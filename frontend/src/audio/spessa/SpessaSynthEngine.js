// frontend/src/audio/spessa/SpessaSynthEngine.js
//
// SpessaSynth (spessasynth_lib) + AudioWorklet SF2/SF3 synth engine.
// Minimal-drop-in replacement for Sf2SynthEngine’s public surface.
//
// main.js expects:
//   - audioEngine.name  (string)
//   - audioEngine.status (string: 'Active' / 'Fallback' / 'Loading'...)
//   - audioEngine.start() (no args, not awaited)
//   - audioEngine.stop()
//   - audioEngine.schedule(events, whenSec)
//
// IMPORTANT:
// - MIND compile events are in BEATS (tBeat + durationBeats), not seconds.
// - main.js calls audioEngine.schedule(res.events, 0) where whenSec is an OFFSET from "now".
//   This engine MUST schedule in absolute AudioContext seconds: abs = now + whenSec + relSec.
//
// SpessaSynth note scheduling:
// - spessasynth_lib methods accept an eventOptions object with { time: <absTimeSec> }.
//   The worklet queues the message if time > current synth time (see processor logic).

const DEBUG_SPESSA = true;

// -----------------------------------------------------------------------------
// URLs / Worklet configuration
// -----------------------------------------------------------------------------

// Your vendored files (FastAPI serves /assets/*)
const SPESSA_LIB_URL = '/assets/vendor/spessasynth/index.js';
const SPESSA_WORKLET_URL = '/assets/vendor/spessasynth/spessasynth_processor.min.js';

// SoundFont URL (keep same as FluidSynth engine for continuity)
const DEFAULT_SF2_URL = '/assets/soundfonts/General-GS.sf2';

// Timeouts
const ADDMODULE_TIMEOUT_MS = 15000;
const INIT_TIMEOUT_MS = 15000;

// Scheduler parameters (same spirit as Sf2SynthEngine)
const LOOKAHEAD_INTERVAL_MS = 25;
const SCHEDULE_AHEAD_SEC = 0.25;

// Lane conventions in MIND
const DRUM_LANES = new Set(['kick', 'snare', 'hat']);

// GM channel mapping (same as Sf2SynthEngine)
const MELODY_CHANNEL = 0;
const DRUM_CHANNEL = 9; // GM channel 10 (0-based index 9)

// Default velocity if absent
const DEFAULT_VEL = 96;

function clampInt(n, lo, hi) {
  const x = (n | 0);
  return Math.max(lo, Math.min(hi, x));
}

function nowIso() {
  try {
    return new Date().toISOString();
  } catch {
    return String(Date.now());
  }
}

function withTimeout(promise, ms, label) {
  let t = null;
  const timeout = new Promise((_, reject) => {
    t = window.setTimeout(() => reject(new Error(label)), ms);
  });
  return Promise.race([
    promise.finally(() => {
      if (t !== null) window.clearTimeout(t);
    }),
    timeout
  ]);
}

// --- Preset mapping (copied from Sf2SynthEngine semantics) -------------------
const GM_NAME_TO_PROGRAM = {
  gm_piano: 0,
  gm_grand_piano: 0,
  gm_acoustic_grand_piano: 0,
  gm_bright_piano: 1,
  gm_electric_piano_1: 4,
  gm_electric_piano_2: 5,
  gm_harpsichord: 6,
  gm_clavinet: 7,
  gm_strings: 48,
  gm_slow_strings: 49,
  gm_choir_aahs: 52,
  gm_voice_oohs: 53,
  gm_synth_voice: 54,
  gm_trumpet: 56,
  gm_trombone: 57,
  gm_sax: 64,
  gm_flute: 73,

  // drums are fixed on GM channel 10; program is mostly ignored
  gm_kick: 0,
  gm_snare: 0,
  gm_hat: 0
};

// Supports:
//  - "gm:bank:program"
//  - "gm_piano" style ids
function parsePresetIdToProgram(presetId) {
  if (!presetId || typeof presetId !== 'string') return { bank: 0, program: 0 };

  if (presetId.startsWith('gm:')) {
    const parts = presetId.split(':');
    if (parts.length >= 3) {
      const bank = clampInt(parseInt(parts[1], 10) || 0, 0, 16383);
      const program = clampInt(parseInt(parts[2], 10) || 0, 0, 127);
      return { bank, program };
    }
  }

  if (presetId in GM_NAME_TO_PROGRAM) {
    return { bank: 0, program: GM_NAME_TO_PROGRAM[presetId] };
  }

  const norm = presetId.trim().toLowerCase();
  if (norm in GM_NAME_TO_PROGRAM) {
    return { bank: 0, program: GM_NAME_TO_PROGRAM[norm] };
  }

  return { bank: 0, program: 0 };
}

export class SpessaSynthEngine {
  constructor(options = {}) {
    this._audioContext = null;
    this._masterGain = null;

    this._synth = null; // WorkletSynthesizer instance

    this._ready = false;
    this._active = false;
    this._soundBankLoaded = false;

    // status / UI
    this._engineLabel = 'SpessaSynth: Initializing…';
    this._presetByLane = {};
    this._programByLane = {};
    this._bankByLane = {};

    // scheduler
    this._tickHandle = null;
    this._pending = [];
    this._scheduledIdx = 0;

    // tempo
    this._bpm = 80;

    // init bookkeeping
    this._initStarted = false;

    // config
    this._sf2Url = (options.sf2Url || DEFAULT_SF2_URL);

    // auto-resume bookkeeping
    this._autoResumeInstalled = false;
    this._autoResumeTriggered = false;

    // expose for console debugging
    try {
      window.__MIND_SPESSA = this;
    } catch {}

    this._log('constructed.', 'sf2Url=', this._sf2Url, 'libUrl=', SPESSA_LIB_URL);
  }

  // -------------------------------------------------------------------------
  // Compatibility surface for main.js
  // -------------------------------------------------------------------------

  get name() {
    return 'SpessaSynth Engine';
  }

  get status() {
    if (!this._active) return 'Fallback';
    if (this._active && !this._soundBankLoaded) return 'Loading';
    return 'Active';
  }

  start() {
    this._log('start() called');
    this._ensureContextRunning('start()').catch((err) => {
      this._warn('start(): resume failed:', err);
    });
  }

  stop() {
    this._log('stop() called');
    try {
      if (this._tickHandle) {
        window.clearInterval(this._tickHandle);
        this._tickHandle = null;
      }
    } catch {}

    try {
      if (this._synth) {
        // graceful stop
        this._synth.stopAll(false);
      }
    } catch (e) {
      this._warn('stop(): stopAll failed:', e);
    }

    // optional: suspend audio context to save CPU
    try {
      if (this._audioContext && this._audioContext.state === 'running') {
        this._audioContext.suspend().catch(() => {});
      }
    } catch {}
  }

  setBpm(bpm) {
    const v = Number(bpm);
    if (isFinite(v) && v > 0) {
      this._bpm = v;
      this._log('setBpm:', v);
    } else {
      this._warn('setBpm ignored (invalid):', bpm);
    }
  }

  // -------------------------------------------------------------------------
  // Introspection
  // -------------------------------------------------------------------------

  engineName() { return 'spessasynth'; }
  isReady() { return this._ready; }

  statusObject() {
    return {
      active: this._active,
      soundBankLoaded: this._soundBankLoaded,
      engine: this._engineLabel,
      bpm: this._bpm,
      audioContextState: this._audioContext ? this._audioContext.state : 'none',
      programByLane: { ...this._programByLane },
      bankByLane: { ...this._bankByLane }
    };
  }

  // -------------------------------------------------------------------------
  // Init
  // -------------------------------------------------------------------------

  async init() {
    if (this._ready) {
      this._log('init(): already ready; skipping');
      return;
    }
    if (this._initStarted) {
      this._log('init(): already started; returning');
      return;
    }

    this._initStarted = true;
    this._log('init(): begin');

    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) {
      this._warn('WebAudio AudioContext not supported');
      throw new Error('WebAudio AudioContext not supported');
    }

    this._audioContext = new AudioContextCtor({ latencyHint: 'interactive' });
    this._log('init(): AudioContext created.', 'state=', this._audioContext.state);

    // master gain (match FluidSynth engine pattern)
    this._masterGain = this._audioContext.createGain();
    this._masterGain.gain.value = 0.9;
    this._masterGain.connect(this._audioContext.destination);

    // Ensure we resume on user interaction if browser starts suspended
    this._installAutoResume();

    // 1) Add AudioWorklet module (processor must register "spessasynth-worklet-processor")
    this._engineLabel = 'SpessaSynth: Loading worklet…';
    this._log('init(): addModule', SPESSA_WORKLET_URL);

    await withTimeout(
      this._audioContext.audioWorklet.addModule(SPESSA_WORKLET_URL),
      ADDMODULE_TIMEOUT_MS,
      `SpessaSynth addModule timed out (${SPESSA_WORKLET_URL})`
    );

    // 2) Dynamically import the ESM library (avoid bundler trying to resolve it at build time)
    this._engineLabel = 'SpessaSynth: Loading library…';
    this._log('init(): importing library', SPESSA_LIB_URL);

    // Vite note: @vite-ignore prevents pre-bundling of absolute runtime URL imports.
    const mod = await withTimeout(
      import(/* @vite-ignore */ SPESSA_LIB_URL),
      INIT_TIMEOUT_MS,
      `SpessaSynth import timed out (${SPESSA_LIB_URL})`
    );

    const WorkletSynthesizer = mod?.WorkletSynthesizer;
    if (!WorkletSynthesizer) {
      this._warn('init(): WorkletSynthesizer export not found in', SPESSA_LIB_URL, 'exports=', Object.keys(mod || {}));
      throw new Error('SpessaSynth lib missing WorkletSynthesizer export');
    }

    // 3) Create synth
    this._engineLabel = 'SpessaSynth: Creating synth…';
    this._synth = new WorkletSynthesizer(this._audioContext);

    // Route synth outputs through master gain
    // (spessasynth_lib connect() connects its outputs to a destination node)
    try {
      this._synth.connect(this._masterGain);
    } catch (e) {
      // Fallback: connect directly to destination if masterGain route fails for any reason
      this._warn('init(): synth.connect(masterGain) failed; trying destination.', e);
      this._synth.connect(this._audioContext.destination);
    }

    // 4) Wait for synth ready
    this._engineLabel = 'SpessaSynth: Waiting ready…';
    await withTimeout(
      Promise.resolve(this._synth.isReady),
      INIT_TIMEOUT_MS,
      'SpessaSynth isReady timed out'
    );

    this._active = true;
    this._log('init(): synth isReady ok.');

    // 5) Load sound bank
    this._engineLabel = 'SpessaSynth: Loading soundfont…';
    await this._loadSoundBank(this._sf2Url);

    this._soundBankLoaded = true;
    this._engineLabel = 'SpessaSynth: Active';
    this._ready = true;

    this._log('init(): complete.', this.statusObject());
  }

  async _loadSoundBank(url) {
    if (!this._audioContext || !this._synth) throw new Error('loadSoundBank: missing audioContext/synth');

    this._log('_loadSoundBank(): fetching', url);
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch soundfont (${res.status}): ${url}`);
    }

    // IMPORTANT: pass ArrayBuffer to soundBankManager.addSoundBank
    const buf = await res.arrayBuffer();

    // ID can be arbitrary; using "main" for consistency.
    // bankOffset stays 0 for typical GM/GS fonts.
    await this._synth.soundBankManager.addSoundBank(buf, 'main', 0);

    this._log('_loadSoundBank(): loaded ok.', 'bytes=', buf.byteLength);
  }

  _installAutoResume() {
    if (this._autoResumeInstalled) return;
    this._autoResumeInstalled = true;

    const handler = async () => {
      if (this._autoResumeTriggered) return;
      this._autoResumeTriggered = true;
      try {
        await this._ensureContextRunning('autoResume');
      } catch {}
      window.removeEventListener('pointerdown', handler, true);
      window.removeEventListener('keydown', handler, true);
      window.removeEventListener('touchstart', handler, true);
    };

    window.addEventListener('pointerdown', handler, true);
    window.addEventListener('keydown', handler, true);
    window.addEventListener('touchstart', handler, true);
  }

  async _ensureContextRunning(reason) {
    if (!this._audioContext) return;
    if (this._audioContext.state === 'running') return;

    this._log('_ensureContextRunning:', reason, 'state=', this._audioContext.state);
    try {
      await this._audioContext.resume();
      this._log('_ensureContextRunning: resumed. state=', this._audioContext.state);
    } catch (e) {
      this._warn('_ensureContextRunning: resume failed:', e);
      throw e;
    }
  }

  // -------------------------------------------------------------------------
  // Presets
  // -------------------------------------------------------------------------

  setPreset(lane, presetId) {
    this._log('setPreset called.', 'lane=', lane, 'presetId=', presetId);

    this._presetByLane[lane] = presetId;

    const { bank, program } = parsePresetIdToProgram(presetId);
    this._programByLane[lane] = program;
    this._bankByLane[lane] = bank;

    if (!this._synth || !this._audioContext) {
      this._warn('setPreset: missing synth/audioContext (will only store mapping)');
      return;
    }

    const channel = DRUM_LANES.has(lane) ? DRUM_CHANNEL : MELODY_CHANNEL;
    const t = this._audioContext.currentTime;

    this._setBankProgramAt(channel, bank, program, t);
  }

  _setBankProgramAt(channel, bank, program, absTimeSec) {
    if (!this._synth) return;

    // Bank select is CC0 (MSB) and CC32 (LSB). For 0..16383:
    const bankMSB = clampInt((bank >> 7) & 0x7f, 0, 127);
    const bankLSB = clampInt(bank & 0x7f, 0, 127);

    // Some GM/GS SF2 ignore banks; this is still safe.
    try {
      this._synth.controllerChange(channel, 0, bankMSB, true, { time: absTimeSec });
      this._synth.controllerChange(channel, 32, bankLSB, true, { time: absTimeSec });
    } catch (e) {
      if (DEBUG_SPESSA) this._warn('_setBankProgramAt: bank select failed:', e);
    }

    try {
      this._synth.programChange(channel, program);
      // programChange in spessasynth_lib doesn’t accept options in current build;
      // it posts immediately. To keep timing stable, we send as raw MIDI with time if needed.
      // Fall back to timed raw message:
      // status byte: 0xC0 | (channel & 0x0F), data: program
      const ch = channel % 16;
      const status = 0xC0 | (ch & 0x0f);
      this._synth.sendMessage([status, clampInt(program, 0, 127)], channel - ch, { time: absTimeSec });
    } catch (e) {
      this._warn('_setBankProgramAt: program set failed:', e);
    }
  }

  // -------------------------------------------------------------------------
  // Scheduling
  // -------------------------------------------------------------------------

  schedule(events, whenSec = 0) {
    if (!Array.isArray(events) || events.length === 0) {
      this._warn('schedule(): no events');
      return;
    }
    if (!this._audioContext || !this._synth) {
      this._warn('schedule(): missing audioContext/synth');
      return;
    }

    const now = this._audioContext.currentTime;
    const offset = (typeof whenSec === 'number' && isFinite(whenSec)) ? whenSec : 0;
    const baseAbs = now + offset;

    const bpm = (isFinite(this._bpm) && this._bpm > 0) ? this._bpm : 80;
    const beatDur = 60 / bpm;

    this._log('schedule(): called.',
      'eventsIn=', events.length,
      'ctx.now=', now,
      'whenSec(offset)=', offset,
      'baseAbs=', baseAbs,
      'bpm=', bpm,
      'beatDur=', beatDur
    );

    const normalized = [];

    for (const ev of events) {
      if (!ev) continue;

      const lane = ev.lane || ev.track || ev.nodeLane || ev.name;
      if (!lane) continue;

      // pitches: prefer explicit pitches array; fallback to legacy note
      let pitches = null;
      if (Array.isArray(ev.pitches) && ev.pitches.length > 0) {
        pitches = ev.pitches;
      } else if (typeof ev.note === 'number') {
        pitches = [ev.note];
      }
      if (!pitches || pitches.length === 0) continue;

      let relSec = null;
      if (ev.tBeat !== undefined && ev.tBeat !== null && isFinite(Number(ev.tBeat))) {
        relSec = Number(ev.tBeat) * beatDur;
      } else if (ev.tSec !== undefined && ev.tSec !== null && isFinite(Number(ev.tSec))) {
        relSec = Number(ev.tSec);
      } else if (ev.timeSec !== undefined && ev.timeSec !== null && isFinite(Number(ev.timeSec))) {
        relSec = Number(ev.timeSec);
      }
      if (relSec === null) continue;

      let durSec = null;
      if (ev.durationBeats !== undefined && ev.durationBeats !== null && isFinite(Number(ev.durationBeats))) {
        durSec = Math.max(0.02, Number(ev.durationBeats) * beatDur);
      } else if (ev.durSec !== undefined && ev.durSec !== null && isFinite(Number(ev.durSec))) {
        durSec = Math.max(0.02, Number(ev.durSec));
      } else if (ev.durationSec !== undefined && ev.durationSec !== null && isFinite(Number(ev.durationSec))) {
        durSec = Math.max(0.02, Number(ev.durationSec));
      } else {
        durSec = 0.12;
      }

      const vel = (ev.velocity !== undefined && ev.velocity !== null)
        ? clampInt(ev.velocity, 1, 127)
        : ((ev.vel !== undefined && ev.vel !== null) ? clampInt(ev.vel, 1, 127) : DEFAULT_VEL);

      const presetId = ev.preset || ev.presetId || this._presetByLane[lane] || null;

      normalized.push({
        timeSec: baseAbs + relSec,
        lane,
        pitches: pitches.map((p) => clampInt(p, 0, 127)),
        durSec,
        vel,
        presetId
      });
    }

    if (normalized.length === 0) {
      const first = events[0] || null;
      const keys = first ? Object.keys(first) : [];
      this._warn('schedule(): normalized to 0 playable events. First event keys:', keys);
      return;
    }

    normalized.sort((a, b) => a.timeSec - b.timeSec);

    this._log('schedule(): normalized events:',
      'count=', normalized.length,
      'first=', normalized[0]
    );

    // Keep pending list until synth is active + bank loaded
    this._pending = normalized;
    this._scheduledIdx = 0;

    if (!this._tickHandle) {
      this._log('schedule(): starting tick timer', LOOKAHEAD_INTERVAL_MS, 'ms');
      this._tickHandle = window.setInterval(() => this._tick(), LOOKAHEAD_INTERVAL_MS);
    }
  }

  _tick() {
    if (!this._audioContext || !this._synth) return;
    if (!this._pending || this._pending.length === 0) return;

    const ctxNow = this._audioContext.currentTime;

    if (!this._active) {
      if (DEBUG_SPESSA && (this._scheduledIdx === 0)) {
        this._log('_tick(): synth not active yet; holding events. ctx.state=', this._audioContext.state, 'ctxNow=', ctxNow);
      }
      return;
    }

    if (!this._soundBankLoaded) {
      if (DEBUG_SPESSA && (this._scheduledIdx === 0)) {
        this._log('_tick(): sound bank not loaded yet; holding events. ctx.state=', this._audioContext.state, 'ctxNow=', ctxNow);
      }
      return;
    }

    const horizon = ctxNow + SCHEDULE_AHEAD_SEC;

    while (this._scheduledIdx < this._pending.length) {
      const ev = this._pending[this._scheduledIdx];
      if (ev.timeSec > horizon) break;

      // Optional program changes for melody lane
      if (ev.presetId && !DRUM_LANES.has(ev.lane)) {
        const { bank, program } = parsePresetIdToProgram(ev.presetId);
        const prevProg = this._programByLane[ev.lane];
        const prevBank = this._bankByLane[ev.lane];

        if (prevProg !== program || prevBank !== bank) {
          this._programByLane[ev.lane] = program;
          this._bankByLane[ev.lane] = bank;

          if (DEBUG_SPESSA) {
            this._log('_tick(): setBankProgramAt', 'lane=', ev.lane, 'bank=', bank, 'program=', program, 't=', ev.timeSec);
          }
          this._setBankProgramAt(MELODY_CHANNEL, bank, program, ev.timeSec);
        }
      }

      const channel = DRUM_LANES.has(ev.lane) ? DRUM_CHANNEL : MELODY_CHANNEL;

      for (const key of ev.pitches) {
        const tOn = ev.timeSec;
        const tOff = ev.timeSec + ev.durSec;

        if (DEBUG_SPESSA) {
          this._log('_tick(): noteOn/off',
            { lane: ev.lane, channel, key, vel: ev.vel, tOn, tOff }
          );
        }

        // SpessaSynth schedules by passing { time: absSeconds } in eventOptions
        this._synth.noteOn(channel, key, ev.vel, { time: tOn });
        this._synth.noteOff(channel, key, false, { time: tOff });
      }

      this._scheduledIdx++;
    }
  }

  // -------------------------------------------------------------------------
  // Debug helper: call from devconsole
  // -------------------------------------------------------------------------

  async debugPlayMiddleC() {
    this._log('debugPlayMiddleC() called');
    if (!this._audioContext || !this._synth) {
      this._warn('debugPlayMiddleC: not initialized');
      return;
    }

    await this._ensureContextRunning('debugPlayMiddleC');

    const t = this._audioContext.currentTime + 0.05;
    this._setBankProgramAt(MELODY_CHANNEL, 0, 0, t);

    this._synth.noteOn(MELODY_CHANNEL, 60, 100, { time: t });
    this._synth.noteOff(MELODY_CHANNEL, 60, false, { time: t + 0.35 });

    this._log('debugPlayMiddleC(): scheduled at', t);
  }

  // -------------------------------------------------------------------------
  // Logging
  // -------------------------------------------------------------------------

  _log(...args) {
    if (!DEBUG_SPESSA) return;
    try {
      console.log(`[SpessaSynthEngine ${nowIso()}]`, ...args);
    } catch {}
  }

  _warn(...args) {
    try {
      console.warn(`[SpessaSynthEngine ${nowIso()}]`, ...args);
    } catch {}
  }
}

