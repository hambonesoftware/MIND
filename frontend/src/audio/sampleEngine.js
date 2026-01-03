/*
 * SampleAudioEngine
 *
 * A lightweight sample‑based audio engine for the MIND sequencer.  This
 * implementation loads a handful of single‑cycle sample recordings for
 * drums and a simple melodic instrument and schedules them via the
 * WebAudio API.  It honours per‑node preset selection and velocity
 * scaling and will gracefully fall back if any sample file is missing.
 *
 * The engine exposes the same API as the NullAudioEngine so it can be
 * swapped in transparently.  Beats are scheduled relative to the bar
 * according to the current BPM; you can adjust the tempo via
 * ``setBpm``.  If multiple notes overlap the engine spawns separate
 * buffer sources for each one (polyphony).  A simple pitch‑shifter
 * applies when playing the melodic lane (preset ``gm_piano``) by
 * altering the playback rate based on the MIDI note number.
 */

export class SampleAudioEngine {
  constructor() {
    this.ac = null;
    this.masterGain = null;
    this.samples = {};
    this.nodePresets = new Map();
    this.isRunning = false;
    this.scheduled = [];
    this.bpm = 80;

    /**
     * Human friendly name for this engine.  The UI uses this
     * identifier to display the currently active audio backend.
     */
    this.name = 'Sample Engine';
  }

  /**
   * Initialise the audio engine.  Creates an AudioContext, loads
   * sample files and prepares the master gain node.  Samples are
   * stored in the ``samples`` map keyed by preset ID.
   */
  async init() {
    // Create audio context on user gesture; some browsers require
    // context to be resumed later (handled in start()).
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    this.ac = new AudioCtx();
    this.masterGain = this.ac.createGain();
    this.masterGain.gain.value = 1.0;
    this.masterGain.connect(this.ac.destination);
    // Define mapping from preset IDs to sample file names.  The
    // GeneralUser GS bank defines preset names such as gm_kick and
    // gm_piano; these keys mirror those returned by the backend.
    const presetFiles = {
      gm_kick: '/assets/instruments/kick.wav',
      gm_snare: '/assets/instruments/snare.wav',
      gm_hat: '/assets/instruments/hat.wav',
      gm_piano: '/assets/instruments/piano.wav',
    };
    // Load each sample asynchronously.  If any fetch fails the
    // corresponding entry will be undefined; schedule() will skip it.
    for (const presetId of Object.keys(presetFiles)) {
      const url = presetFiles[presetId];
      try {
        const resp = await fetch(url);
        if (!resp.ok) {
          console.warn(`SampleAudioEngine: failed to fetch ${url}`);
          continue;
        }
        const arrayBuf = await resp.arrayBuffer();
        const buf = await new Promise((resolve, reject) => {
          // decodeAudioData occasionally rejects; wrap to catch
          this.ac.decodeAudioData(arrayBuf, resolve, reject);
        });
        this.samples[presetId] = buf;
      } catch (err) {
        console.warn(`SampleAudioEngine: error loading ${url}`, err);
      }
    }
    return this;
  }

  /** Set the BPM used to convert beats to seconds. */
  setBpm(bpm) {
    if (!isFinite(bpm) || bpm <= 0) return;
    this.bpm = bpm;
  }

  /** Mark the engine as running and resume the audio context if
   * suspended. */
  start() {
    this.isRunning = true;
    this.scheduled = [];
    if (this.ac && this.ac.state === 'suspended') {
      this.ac.resume().catch(() => {});
    }
  }

  /** Stop playback; scheduled events will continue to play but new
   * events are ignored and the scheduled list is reset. */
  stop() {
    this.isRunning = false;
    this.scheduled = [];
  }

  getCurrentTime() {
    return this.ac ? this.ac.currentTime : 0;
  }

  /**
   * Schedule a list of events relative to the current time.  Each
   * event object should contain ``tBeat`` (time in beats), ``lane``,
   * ``note``, ``velocity``, ``durationBeats`` and ``preset``.  The
   * optional ``whenSec`` offset allows scheduling slightly in the
   * future; MIND always passes 0 so all events align to the bar.
   *
   * Events belonging to unknown presets are skipped.  For the
   * melodic lane (gm_piano) a simple pitch shift is applied based on
   * the MIDI note number relative to middle C (note 60).
   */
  schedule(events, whenSec) {
    if (!this.isRunning || !this.ac) return;
    const beatDur = 60 / this.bpm;
    const now = this.ac.currentTime;
    for (const ev of events) {
      let presetId = ev.preset;
      // Allow per‑node overrides if set via setPreset()
      if (this.nodePresets.has(ev.lane)) {
        presetId = this.nodePresets.get(ev.lane);
      }
      // Fallback: derive from lane
      if (!presetId) {
        if (ev.lane === 'kick') presetId = 'gm_kick';
        else if (ev.lane === 'snare') presetId = 'gm_snare';
        else if (ev.lane === 'hat') presetId = 'gm_hat';
        else presetId = 'gm_piano';
      }
      const buffer = this.samples[presetId];
      if (!buffer) continue;
      // Determine pitches: prefer explicit pitches array; fall back to
      // legacy note alias or middle C (60) if unspecified.
      let pitches = [];
      if (Array.isArray(ev.pitches) && ev.pitches.length > 0) {
        pitches = ev.pitches;
      } else if (typeof ev.note === 'number') {
        pitches = [ev.note];
      } else {
        pitches = [60];
      }
      // Schedule a separate source for each pitch
      for (const pitch of pitches) {
        const src = this.ac.createBufferSource();
        src.buffer = buffer;
        // Compute playback rate for melodic instruments
        let playbackRate = 1;
        if (presetId === 'gm_piano') {
          // base sample recorded at MIDI note 60 (C4)
          const base = 60;
          const semitoneDiff = pitch - base;
          playbackRate = Math.pow(2, semitoneDiff / 12);
        }
        src.playbackRate.value = playbackRate;
        // Create per‑note gain; scale 0–1
        const gainNode = this.ac.createGain();
        const vel = ev.velocity ?? 80;
        gainNode.gain.value = Math.max(0, Math.min(1, vel / 127));
        src.connect(gainNode).connect(this.masterGain);
        const startTime = (typeof ev.audioTime === 'number' && Number.isFinite(ev.audioTime))
          ? ev.audioTime
          : now + (whenSec || 0) + ev.tBeat * beatDur;
        const durationSec = (ev.durationBeats ?? 0.1) * beatDur;
        try {
          src.start(startTime);
          src.stop(startTime + durationSec);
        } catch (err) {
          // Scheduling may fail if start time is in the past; ignore
        }
      }
      // Record scheduled time for visualisation purposes using the first
      // pitch only.  Visualisation does not need to track each voice.
      const startTime = (typeof ev.audioTime === 'number' && Number.isFinite(ev.audioTime))
        ? ev.audioTime
        : now + (whenSec || 0) + ev.tBeat * beatDur;
      this.scheduled.push({ ...ev, when: startTime });
    }
  }

  /** Associate a preset with a given node (lane).  When scheduling
   * events this map takes precedence over the preset value embedded
   * in the compiled event. */
  setPreset(nodeId, presetId) {
    if (!presetId) return;
    // If the requested preset is not available among the loaded
    // samples then fall back to a sensible default based on the
    // lane or preset name.  This allows use of the SampleEngine
    // even when General MIDI program IDs are supplied (e.g. ``gm:0:40``).
    let resolved = presetId;
    if (!this.samples[presetId]) {
      const idLower = presetId.toLowerCase();
      if (idLower.includes('kick') || nodeId === 'kick') {
        resolved = 'gm_kick';
      } else if (idLower.includes('snare') || nodeId === 'snare') {
        resolved = 'gm_snare';
      } else if (idLower.includes('hat') || nodeId === 'hat') {
        resolved = 'gm_hat';
      } else {
        resolved = 'gm_piano';
      }
    }
    this.nodePresets.set(nodeId, resolved);
  }
}
