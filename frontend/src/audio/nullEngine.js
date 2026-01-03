// NullAudioEngine is a silent audio engine that fulfils the same API as
// a real synthesiser.  It records scheduled events for visualisation
// but never produces sound.  This is used when the WASM soundfont
// engine is unavailable or audio files are missing.

export class NullAudioEngine {
  constructor() {
    this.scheduled = [];
    this.isRunning = false;

    /**
     * Human friendly name for this engine.  The UI uses this
     * identifier to display the currently active audio backend.
     */
    this.name = 'Null Engine';
  }

  async init() {
    // no-op for compatibility
    return this;
  }

  start() {
    this.isRunning = true;
    this.scheduled = [];
  }

  stop() {
    this.isRunning = false;
    this.scheduled = [];
  }

  getCurrentTime() {
    return 0;
  }

  /**
   * Schedule a list of events at a given absolute time (in seconds).
   * For the null engine we simply record them; the UI will handle
   * visualisation separately.
   *
   * @param {Array} events
   * @param {number} whenSec
   */
  schedule(events, whenSec) {
    if (!this.isRunning) return;
    // Tag events with the absolute time they should occur
    for (const ev of events) {
      const audioTime = (typeof ev.audioTime === 'number' && Number.isFinite(ev.audioTime))
        ? ev.audioTime
        : whenSec;
      this.scheduled.push({ ...ev, when: audioTime });
    }
  }

  setPreset(/* nodeId, presetId */) {
    // nothing to do
  }
}
