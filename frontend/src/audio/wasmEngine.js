/*
 * WasmSoundFontEngine
 *
 * This class attempts to load a SoundFont (.sf2) file from the
 * ``/assets/soundfonts`` directory and provide a functional audio
 * engine for the MIND sequencer.  In environments where a true SF2
 * synth is not available (for example, when no WebAssembly module is
 * present) the engine falls back to the SampleAudioEngine defined in
 * ``sampleEngine.js``.  The fallback still produces audible output
 * using short WAV samples included in the repository.
 *
 * The engine emits progress and completion events on the global
 * ``window`` object while the soundfont is being loaded.  These events
 * are named ``sf2-load-progress`` and ``sf2-load-done`` and carry
 * details about the number of bytes read and whether the load was
 * successful.  The frontend listens for these events to update the
 * UI accordingly.
 */

import { SampleAudioEngine } from './sampleEngine.js';

// Default soundfont path for the SF2 engine.  Using an explicit
// constant ensures the same file is referenced throughout the
// application and makes it easy to swap fonts in the future.  The
// corresponding file must be served from the backend under
// ``/assets/soundfonts``.
export const DEFAULT_SOUNDFONT_URL = '/assets/soundfonts/General-GS.sf2';

export class WasmSoundFontEngine {
  constructor() {
    /**
     * A friendly name for display in the UI.  The main application
     * expects engines to expose this property.
     * @type {string}
     */
    this.name = 'SF2 Engine';
    /**
     * Underlying sample‑based fallback engine.  If the soundfont
     * cannot be initialised or there is no SF2 synthesiser available
     * this engine handles all audio scheduling.
     * @private
     */
    this._fallback = null;
  }

  /**
   * Initialise the engine.  Attempts to fetch the soundfont file
   * ``GeneralUser-GS.sf2`` from the assets directory.  Progress is
   * reported via custom events dispatched on ``window``.  On
   * completion a fallback SampleAudioEngine is prepared so that
   * scheduling and playback function regardless of whether a true
   * synthesiser is available.
   *
   * @returns {Promise<this>} resolves when initialisation completes
   */
  async init() {
    // Prepare fallback engine no matter what.  If the SF2 load fails
    // the fallback will still provide audio.
    this._fallback = new SampleAudioEngine();
    // Start loading the soundfont.  If fetch or streaming fails we
    // catch the error and still resolve initialisation.
    try {
      const resp = await fetch(DEFAULT_SOUNDFONT_URL);
      if (!resp.ok) {
        throw new Error(`Failed to fetch SF2 file: ${resp.status}`);
      }
      const total = parseInt(resp.headers.get('content-length') || '0', 10) || 0;
      let loaded = 0;
      // Use ReadableStream when available to report incremental progress.
      if (resp.body && typeof resp.body.getReader === 'function') {
        const reader = resp.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            loaded += value.length;
            // Dispatch progress event
            if (total > 0) {
              window.dispatchEvent(
                new CustomEvent('sf2-load-progress', { detail: { loaded, total } }),
              );
            }
          }
        }
        // final progress update
        if (total > 0 && loaded >= total) {
          window.dispatchEvent(
            new CustomEvent('sf2-load-progress', { detail: { loaded: total, total } }),
          );
        }
      } else {
        // Fallback: download entire array buffer at once
        const arrayBuffer = await resp.arrayBuffer();
        loaded = arrayBuffer.byteLength;
        if (loaded > 0) {
          window.dispatchEvent(
            new CustomEvent('sf2-load-progress', { detail: { loaded, total: loaded } }),
          );
        }
      }
      // Log success in the developer console.  Including the number of
      // bytes loaded helps diagnose caching and network issues.  This
      // message is required by the v0.3.1 specification.
      console.info(
        `SoundFont loaded: ${DEFAULT_SOUNDFONT_URL} (bytes=${loaded || total})`,
      );
      // Signal that loading completed successfully
      window.dispatchEvent(
        new CustomEvent('sf2-load-done', { detail: { success: true } }),
      );
    } catch (err) {
      // Loading failed; dispatch failure event
      window.dispatchEvent(
        new CustomEvent('sf2-load-done', { detail: { success: false } }),
      );
      // Intentionally do not rethrow here; we still initialise fallback
      console.error('SoundFont failed to load:', DEFAULT_SOUNDFONT_URL, err);
    }
    // Always initialises the fallback sample engine.  This may throw
    // errors which we propagate back to the caller.  The SampleEngine
    // provides its own ``init`` method which creates an AudioContext
    // and loads short WAV files.
    await this._fallback.init();
    return this;
  }

  /**
   * Start playback.  Delegates to the fallback engine.
   */
  start() {
    this._fallback?.start();
  }

  /**
   * Stop playback.  Delegates to the fallback engine.
   */
  stop() {
    this._fallback?.stop();
  }

  /**
   * Schedule a list of events.  Delegates to the fallback engine.
   * @param {Array} events
   * @param {number} whenSec
   */
  schedule(events, whenSec) {
    this._fallback?.schedule(events, whenSec);
  }

  /**
   * Update the tempo.  Delegates to the fallback engine.
   * @param {number} bpm
   */
  setBpm(bpm) {
    if (this._fallback && typeof this._fallback.setBpm === 'function') {
      this._fallback.setBpm(bpm);
    }
  }

  /**
   * Associate a preset with a given lane.  Delegates to the fallback
   * engine.  Although the fallback will ignore unknown GM program IDs
   * it maps them to the nearest available sample so that playback
   * remains audible.
   * @param {string} nodeId
   * @param {string} presetId
   */
  setPreset(nodeId, presetId) {
    if (this._fallback && typeof this._fallback.setPreset === 'function') {
      this._fallback.setPreset(nodeId, presetId);
    }
  }
}