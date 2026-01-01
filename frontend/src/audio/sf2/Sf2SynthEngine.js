// frontend/src/audio/sf2/Sf2SynthEngine.js
//
// FluidSynth (WASM) + AudioWorklet SF2 synth engine.
// FULL VERBOSE DEBUG VERSION.
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

const DEBUG_SF2 = true;

// -----------------------------------------------------------------------------
// URLs / Worklet configuration
// -----------------------------------------------------------------------------

const DEFAULT_SF2_URL = '/assets/soundfonts/General-GS.sf2';

// Worklet loading order is important in AudioWorkletGlobalScope:
//  1) worklet-prelude.js  (polyfills e.g. setTimeout, performance)
//  2) libfluidsynth.js    (emscripten Module/wasm glue)
//  3) sf2-worklet.js      (registerProcessor(...))
const WORKLET_PRELUDE_URL = '/assets/wasm/worklet-prelude.js';
const FLUID_LIB_URL = '/assets/wasm/libfluidsynth.js';
const WORKLET_URL = '/assets/wasm/sf2-worklet.js';

// The processor name MUST match registerProcessor() inside sf2-worklet.js
// (You said you changed to sf2-synth-processor)
const WORKLET_PROCESSOR_NAME = 'sf2-synth-processor';

// Timeouts (keep init from ever hanging forever)
const ADDMODULE_TIMEOUT_MS = 15000;
const HANDSHAKE_BEST_EFFORT_TIMEOUT_MS = 8000;

// Scheduler parameters
const LOOKAHEAD_INTERVAL_MS = 25;
const SCHEDULE_AHEAD_SEC = 0.25;

// Lane conventions in MIND
const DRUM_LANES = new Set(['kick', 'snare', 'hat']);
const NOTE_LANE = 'note';

// GM channel mapping
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

// --- Preset mapping --------------------------------------------------------
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

export class Sf2SynthEngine {
  constructor() {
    this._audioContext = null;
    this._workletNode = null;
    this._masterGain = null;

    this._ready = false;

    // "active" means: worklet reports synth created and process is alive.
    // "sf2Loaded" means: soundfont loaded into FluidSynth.
    this._active = false;
    this._sf2Loaded = false;

    // status / UI
    this._programByLane = {};
    this._bankByLane = {};
    this._engineLabel = 'SF2 Synth: Initializing…';

    // scheduler
    this._tickHandle = null;
    this._pending = [];
    this._scheduledIdx = 0;

    this._presetByLane = {};

    // tempo
    this._bpm = 80;

    // init bookkeeping
    this._initStarted = false;
    this._fontLoadStarted = false;

    // handshake bookkeeping (best-effort)
    this._handshakeDone = false;

    // message counter
    this._msgCount = 0;

    // auto-resume bookkeeping
    this._autoResumeInstalled = false;
    this._autoResumeTriggered = false;

    // expose for console debugging
    try {
      window.__MIND_SF2 = this;
    } catch {}

    this._log(
      'constructed.',
      'processorName=', WORKLET_PROCESSOR_NAME,
      'sf2Url=', DEFAULT_SF2_URL
    );
  }

  // -------------------------------------------------------------------------
  // Compatibility surface for main.js
  // -------------------------------------------------------------------------

  get name() {
    return 'SF2 Engine';
  }

  get status() {
    if (!this._active) return 'Fallback';
    if (this._active && !this._sf2Loaded) return 'Loading';
    return 'Active';
  }

  start() {
    this._log('start() called');
    this._ensureContextRunning('start()').catch((err) => {
      this._warn('start(): resume failed:', err);
    });
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

  engineName() { return 'sf2'; }
  isReady() { return this._ready; }

  statusObject() {
    return {
      active: this._active,
      sf2Loaded: this._sf2Loaded,
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

    this._audioContext = new AudioContextCtor();
    const ctx = this._audioContext;

    this._log('AudioContext created.',
      'state=', ctx.state,
      'sampleRate=', ctx.sampleRate
    );

    // Statechange diagnostics
    try {
      ctx.onstatechange = () => {
        this._log('AudioContext statechange:', ctx.state, 'currentTime=', ctx.currentTime);
      };
    } catch (err) {
      this._warn('ctx.onstatechange attach failed:', err);
    }

    // Install auto-resume on user gesture ASAP
    this._installAutoResumeOnce();

    // Load modules with explicit timeouts so UI never hangs forever.
    this._log(
      'Loading AudioWorklet modules in order:',
      WORKLET_PRELUDE_URL,
      FLUID_LIB_URL,
      WORKLET_URL
    );

    const t0 = performance.now();

    await withTimeout(
      ctx.audioWorklet.addModule(WORKLET_PRELUDE_URL),
      ADDMODULE_TIMEOUT_MS,
      `Timed out loading ${WORKLET_PRELUDE_URL}`
    );
    this._log('Loaded:', WORKLET_PRELUDE_URL, `(+${(performance.now() - t0).toFixed(1)}ms)`);

    await withTimeout(
      ctx.audioWorklet.addModule(FLUID_LIB_URL),
      ADDMODULE_TIMEOUT_MS,
      `Timed out loading ${FLUID_LIB_URL}`
    );
    this._log('Loaded:', FLUID_LIB_URL, `(+${(performance.now() - t0).toFixed(1)}ms)`);

    await withTimeout(
      ctx.audioWorklet.addModule(WORKLET_URL),
      ADDMODULE_TIMEOUT_MS,
      `Timed out loading ${WORKLET_URL}`
    );
    this._log('Loaded:', WORKLET_URL, `(+${(performance.now() - t0).toFixed(1)}ms)`);

    // Create worklet node
    this._log('Creating AudioWorkletNode with processor name:', WORKLET_PROCESSOR_NAME);

    this._workletNode = new AudioWorkletNode(ctx, WORKLET_PROCESSOR_NAME, {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      outputChannelCount: [2]
    });

    this._log('AudioWorkletNode created OK');

    // Critical: catch processor crashes
    try {
      this._workletNode.onprocessorerror = (ev) => {
        this._warn('AudioWorklet processor error event:', ev);
      };
    } catch (err) {
      this._warn('onprocessorerror attach failed:', err);
    }

    this._masterGain = ctx.createGain();
    this._masterGain.gain.value = 0.85;
    this._log('Master gain created; gain=', this._masterGain.gain.value);

    this._workletNode.connect(this._masterGain);
    this._masterGain.connect(ctx.destination);
    this._log('Audio graph connected: worklet -> gain -> destination');

    // Port message handler
    this._workletNode.port.onmessage = (e) => this._handleWorkletMessage(e);
    this._workletNode.port.onmessageerror = (e) => {
      this._warn('worklet port onmessageerror:', e);
    };

    // Mark ready immediately (do NOT block UI)
    this._ready = true;
    this._engineLabel = 'SF2 Synth: Ready (initializing worklet…)';

    // Start SF2 fetch immediately (async, no await)
    this._startSoundFontLoad(DEFAULT_SF2_URL);

    // Best-effort handshake timer: we do not fail init if it doesn’t complete.
    this._log('Waiting for worklet handshake (best-effort). timeoutMs=', HANDSHAKE_BEST_EFFORT_TIMEOUT_MS);
    window.setTimeout(() => {
      if (!this._handshakeDone) {
        this._warn(
          'Handshake did NOT complete in time. This is often OK if AudioContext is suspended until user gesture.',
          'ctx.state=', ctx.state,
          'active=', this._active,
          'sf2Loaded=', this._sf2Loaded
        );
        this._engineLabel = (this._active)
          ? (this._sf2Loaded ? 'SF2 Synth: Active' : 'SF2 Synth: Active (loading font…)')
          : 'SF2 Synth: Waiting for user gesture / worklet init';
      }
      this._log('init(): done.',
        'ready=', this._ready,
        'active=', this._active,
        'sf2Loaded=', this._sf2Loaded,
        'ctx.state=', ctx.state
      );
    }, HANDSHAKE_BEST_EFFORT_TIMEOUT_MS);
  }

  // -------------------------------------------------------------------------
  // Worklet messaging
  // -------------------------------------------------------------------------

  _handleWorkletMessage(e) {
    const msg = e?.data;
    this._msgCount += 1;

    if (DEBUG_SF2) {
      let safe = null;
      try { safe = JSON.stringify(msg); } catch { safe = String(msg); }
      this._log(`worklet->main message #${this._msgCount}:`, safe);
    }

    if (!msg || typeof msg.type !== 'string') return;

    if (msg.type === 'status') {
      const status = msg.status || '';
      this._active = !!msg.active;

      this._log(
        'STATUS:',
        'status=', status,
        'active=', this._active,
        'sf2Loaded=', !!msg.sf2Loaded,
        'sampleRate=', msg.sampleRate
      );

      if (status === 'sf2Loaded') {
        this._sf2Loaded = true;
        const url = msg.url || DEFAULT_SF2_URL;
        const path = msg.path || '';
        this._engineLabel = this._active ? 'SF2 Synth: Active' : 'SF2 Synth: Inactive';
        console.log(`[Audio] SoundFont loaded: ${url}${path ? ` (worklet path: ${path})` : ''}`);
        window.dispatchEvent(new CustomEvent('sf2-load-done', { detail: { success: true, url, path } }));
      } else if (status === 'ready' || status === 'initializing') {
        // "initializing" is useful: proves processor constructed and messaging works.
        this._sf2Loaded = !!msg.sf2Loaded;
        this._engineLabel = this._active
          ? (this._sf2Loaded ? 'SF2 Synth: Active' : 'SF2 Synth: Active (loading font…)')
          : 'SF2 Synth: Initializing…';
      } else if (status === 'error') {
        this._active = false;
        this._engineLabel = 'SF2 Synth: Error (Fallback recommended)';
        const message = msg.message || 'Unknown worklet error';
        this._warn('worklet status error:', message);
        window.dispatchEvent(new CustomEvent('sf2-load-done', { detail: { success: false, error: message } }));
      }

      if (!this._handshakeDone && (status === 'ready' || status === 'sf2Loaded')) {
        this._handshakeDone = true;
        this._log('Handshake COMPLETE via status=', status);
      }

      return;
    }

    if (msg.type === 'loaded') {
      // Older protocol support
      this._sf2Loaded = true;
      this._engineLabel = this._active ? 'SF2 Synth: Active' : 'SF2 Synth: Inactive';
      this._log('Received legacy loaded message. path=', msg.path || '');
      window.dispatchEvent(new CustomEvent('sf2-load-done', { detail: { success: true, url: DEFAULT_SF2_URL, path: msg.path || '' } }));
      this._handshakeDone = true;
      return;
    }

    if (msg.type === 'error') {
      const message = msg.message || 'Unknown worklet error';
      this._warn('Received worklet error:', message);
      this._active = false;
      this._engineLabel = 'SF2 Synth: Error (Fallback recommended)';
      window.dispatchEvent(new CustomEvent('sf2-load-done', { detail: { success: false, error: message } }));
      return;
    }

    if (msg.type === 'debug') {
      this._log('WORKLET DEBUG:', msg.msg);
    }
  }

  // -------------------------------------------------------------------------
  // Auto-resume helpers
  // -------------------------------------------------------------------------

  _installAutoResumeOnce() {
    if (this._autoResumeInstalled) return;
    this._autoResumeInstalled = true;

    const fire = (reason) => {
      if (this._autoResumeTriggered) return;
      this._autoResumeTriggered = true;
      this._log('Auto-resume triggered by:', reason);
      this._ensureContextRunning(`auto-resume (${reason})`).catch((err) => {
        this._warn('Auto-resume failed:', err);
      });
      window.removeEventListener('pointerdown', onPointerDown, true);
      window.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('touchstart', onTouchStart, true);
    };

    const onPointerDown = () => fire('pointerdown');
    const onKeyDown = () => fire('keydown');
    const onTouchStart = () => fire('touchstart');

    window.addEventListener('pointerdown', onPointerDown, true);
    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('touchstart', onTouchStart, true);

    this._log('Auto-resume listeners installed (pointerdown/keydown/touchstart)');
  }

  async _ensureContextRunning(reason) {
    const ctx = this._audioContext;
    if (!ctx) {
      this._warn('_ensureContextRunning called but no AudioContext. reason=', reason);
      return;
    }

    this._log('_ensureContextRunning:', reason, 'ctx.state=', ctx.state, 'currentTime=', ctx.currentTime);

    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
        this._log('AudioContext resumed OK.', 'state=', ctx.state, 'currentTime=', ctx.currentTime);
      } catch (err) {
        this._warn('AudioContext.resume() threw:', err);
        throw err;
      }
    } else {
      this._log('AudioContext already not suspended:', ctx.state);
    }
  }

  // -------------------------------------------------------------------------
  // SoundFont loading (main thread fetch -> transfer to worklet)
  // -------------------------------------------------------------------------

  _startSoundFontLoad(url) {
    if (this._fontLoadStarted) return;
    this._fontLoadStarted = true;

    this._log('SoundFont load started:', url);

    window.setTimeout(() => {
      this._loadSoundFont(url).catch((err) => {
        this._warn('SoundFont load failed:', err);
        window.dispatchEvent(new CustomEvent('sf2-load-done', { detail: { success: false, error: String(err) } }));
      });
    }, 0);
  }

  async _loadSoundFont(url) {
    if (!this._workletNode) {
      this._warn('_loadSoundFont called but no worklet node');
      return;
    }

    this._log('Fetching SF2:', url);
    window.dispatchEvent(new CustomEvent('sf2-load-progress', { detail: { loaded: 0, total: 1 } }));

    const resp = await fetch(url);
    this._log('Fetch response:', 'ok=', resp.ok, 'status=', resp.status,
      'content-type=', resp.headers.get('Content-Type'),
      'content-length=', resp.headers.get('Content-Length')
    );

    if (!resp.ok) {
      window.dispatchEvent(new CustomEvent('sf2-load-done', { detail: { success: false, error: `HTTP ${resp.status}` } }));
      throw new Error(`Failed to fetch SF2: ${url} (HTTP ${resp.status})`);
    }

    const total = Number(resp.headers.get('Content-Length') || '0') || 0;
    this._log('SF2 content-length total=', total);

    if (resp.body && total > 0 && typeof resp.body.getReader === 'function') {
      this._log('Using streaming reader for SF2...');
      const reader = resp.body.getReader();
      const bytes = new Uint8Array(total);
      let offset = 0;

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        if (!value || value.byteLength === 0) continue;

        const remaining = total - offset;
        const copyLen = Math.min(remaining, value.byteLength);
        bytes.set(value.subarray(0, copyLen), offset);
        offset += copyLen;

        if (offset % (1024 * 1024) === 0 || offset >= total) {
          this._log(`SF2 streaming progress: ${offset}/${total} bytes`);
        }

        window.dispatchEvent(new CustomEvent('sf2-load-progress', { detail: { loaded: offset, total } }));
        if (offset >= total) break;
      }

      this._log('SF2 streaming done.', 'bytesRead=', offset, 'expectedTotal=', total);

      const finalView = (offset === total) ? bytes : bytes.subarray(0, offset);
      const buf = finalView.buffer.slice(finalView.byteOffset, finalView.byteOffset + finalView.byteLength);

      this._log('SF2 buffer prepared.', 'arrayBufferBytes=', buf.byteLength);

      const path = '/General-GS.sf2';
      this._log('Posting SF2 bytes to worklet...',
        'url=', url,
        'bufBytes=', buf.byteLength,
        'path=', path
      );

      try {
        this._workletNode.port.postMessage(
          { type: 'loadSf2', url, bytes: buf, path },
          [buf]
        );
        this._log('SF2 postMessage transfer succeeded (ownership transferred).');
      } catch (err) {
        this._warn('SF2 postMessage transfer FAILED:', err);
        throw err;
      }

      return;
    }

    // Fallback: non-streaming load
    this._log('No streaming reader; using arrayBuffer() fallback');
    const buf = await resp.arrayBuffer();
    const loaded = buf.byteLength || 1;
    window.dispatchEvent(new CustomEvent('sf2-load-progress', { detail: { loaded, total: loaded } }));

    const path = '/General-GS.sf2';
    this._log('Posting SF2 bytes to worklet (fallback)...',
      'url=', url,
      'bufBytes=', buf.byteLength,
      'path=', path
    );

    this._workletNode.port.postMessage(
      { type: 'loadSf2', url, bytes: buf, path },
      [buf]
    );
  }

  // -------------------------------------------------------------------------
  // Transport / stop
  // -------------------------------------------------------------------------

  async resume() {
    this._log('resume() called');
    await this._ensureContextRunning('resume()');
  }

  stop() {
    this._log('stop() called');

    if (this._tickHandle) {
      window.clearInterval(this._tickHandle);
      this._tickHandle = null;
    }
    this._pending = [];
    this._scheduledIdx = 0;

    if (this._workletNode && this._audioContext) {
      const t = this._audioContext.currentTime;
      this._log('stop(): allNotesOff at time=', t);
      this._workletNode.port.postMessage({ type: 'allNotesOff', timeSec: t, channel: MELODY_CHANNEL });
      this._workletNode.port.postMessage({ type: 'allNotesOff', timeSec: t, channel: DRUM_CHANNEL });
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

    if (!this._workletNode || !this._audioContext) {
      this._warn('setPreset: missing worklet/audioContext (will only store mapping)');
      return;
    }

    const channel = DRUM_LANES.has(lane) ? DRUM_CHANNEL : MELODY_CHANNEL;
    const t = this._audioContext.currentTime;

    const payload = { type: 'setProgram', timeSec: t, channel, bank, program };
    this._log('posting setProgram:', payload);

    this._workletNode.port.postMessage(payload);
  }

  // -------------------------------------------------------------------------
  // Scheduling
  // -------------------------------------------------------------------------

  schedule(events, whenSec = 0) {
    if (!Array.isArray(events) || events.length === 0) {
      this._warn('schedule(): no events');
      return;
    }
    if (!this._audioContext || !this._workletNode) {
      this._warn('schedule(): missing audioContext/workletNode');
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

    // Keep pending list until synth actually becomes active + sf2Loaded
    this._pending = normalized;
    this._scheduledIdx = 0;

    if (!this._tickHandle) {
      this._log('schedule(): starting tick timer', LOOKAHEAD_INTERVAL_MS, 'ms');
      this._tickHandle = window.setInterval(() => this._tick(), LOOKAHEAD_INTERVAL_MS);
    }
  }

  _tick() {
    if (!this._audioContext || !this._workletNode) return;
    if (!this._pending || this._pending.length === 0) return;

    const ctxNow = this._audioContext.currentTime;

    // Don’t advance schedule until the synth is actually able to play.
    if (!this._active) {
      if (DEBUG_SF2 && (this._scheduledIdx === 0)) {
        this._log('_tick(): synth not active yet; holding events. ctx.state=', this._audioContext.state, 'ctxNow=', ctxNow);
      }
      return;
    }

    if (!this._sf2Loaded) {
      if (DEBUG_SF2 && (this._scheduledIdx === 0)) {
        this._log('_tick(): sf2 not loaded yet; holding events. ctx.state=', this._audioContext.state, 'ctxNow=', ctxNow);
      }
      return;
    }

    const horizon = ctxNow + SCHEDULE_AHEAD_SEC;

    while (this._scheduledIdx < this._pending.length) {
      const ev = this._pending[this._scheduledIdx];
      if (ev.timeSec > horizon) break;

      if (ev.presetId && !DRUM_LANES.has(ev.lane)) {
        const { bank, program } = parsePresetIdToProgram(ev.presetId);
        const prevProg = this._programByLane[ev.lane];
        const prevBank = this._bankByLane[ev.lane];
        if (prevProg !== program || prevBank !== bank) {
          this._programByLane[ev.lane] = program;
          this._bankByLane[ev.lane] = bank;
          const payload = {
            type: 'setProgram',
            timeSec: ev.timeSec,
            channel: MELODY_CHANNEL,
            bank,
            program
          };
          this._log('_tick(): posting setProgram for lane=', ev.lane, payload);
          this._workletNode.port.postMessage(payload);
        }
      }

      const channel = DRUM_LANES.has(ev.lane) ? DRUM_CHANNEL : MELODY_CHANNEL;

      for (const key of ev.pitches) {
        const onMsg = { type: 'noteOn', timeSec: ev.timeSec, channel, key, vel: ev.vel };
        const offMsg = { type: 'noteOff', timeSec: ev.timeSec + ev.durSec, channel, key };

        if (DEBUG_SF2) {
          this._log('_tick(): noteOn/off', onMsg, offMsg);
        }

        this._workletNode.port.postMessage(onMsg);
        this._workletNode.port.postMessage(offMsg);
      }

      this._scheduledIdx++;
    }
  }

  // -------------------------------------------------------------------------
  // Debug helper: call from devconsole
  // -------------------------------------------------------------------------

  async debugPlayMiddleC() {
    this._log('debugPlayMiddleC() called');
    if (!this._audioContext || !this._workletNode) {
      this._warn('debugPlayMiddleC: not initialized');
      return;
    }

    await this._ensureContextRunning('debugPlayMiddleC');

    const t = this._audioContext.currentTime + 0.10;
    const key = 60;
    const vel = 100;
    const channel = MELODY_CHANNEL;

    this._log('debugPlayMiddleC: posting noteOn/noteOff at', t);

    this._workletNode.port.postMessage({ type: 'noteOn', timeSec: t, channel, key, vel });
    this._workletNode.port.postMessage({ type: 'noteOff', timeSec: t + 0.50, channel, key });
  }

  // -------------------------------------------------------------------------
  // UI badge
  // -------------------------------------------------------------------------

  badgeText() {
    const noteProg = this._programByLane[NOTE_LANE] ?? 0;
    if (!this._active) return 'SF2 Synth: Fallback / Initializing';
    if (this._active && !this._sf2Loaded) return `SF2 Synth: Active (loading…) (Program ${noteProg})`;
    return `SF2 Synth: Active (Program ${noteProg})`;
  }

  // -------------------------------------------------------------------------
  // Logging helpers
  // -------------------------------------------------------------------------

  _log(...args) {
    if (!DEBUG_SF2) return;
    try {
      console.log(`[Sf2SynthEngine ${nowIso()}]`, ...args);
    } catch {}
  }

  _warn(...args) {
    try {
      console.warn(`[Sf2SynthEngine ${nowIso()}]`, ...args);
    } catch {}
  }
}
