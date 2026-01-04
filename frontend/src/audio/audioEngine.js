// frontend/src/audio/audioEngine.js

import { NullAudioEngine } from './nullEngine.js';
import { SampleAudioEngine } from './sampleEngine.js';

// Preferred real SF2 synth (SpessaSynth lib + AudioWorklet)
import { SpessaSynthEngine } from './spessa/SpessaSynthEngine.js';

// Legacy real SF2 synth (FluidSynth WASM + AudioWorklet) — keep as fallback for now
import { Sf2SynthEngine } from './sf2/Sf2SynthEngine.js';

/**
 * Factory function that creates an appropriate audio engine.
 *
 * @param {Object} options
 * @param {boolean} options.strictSf2 - When true, throws after SpessaSynth failure.
 *
 * Policy:
 *   1) Try SpessaSynth first (spessasynth_lib + AudioWorklet)
 *   2) If that fails, try legacy FluidSynth SF2 engine
 *   3) If that fails, fall back to SampleAudioEngine (WAV samples)
 *   4) If that fails, fall back to NullAudioEngine
 *
 * The rest of the app should treat the returned engine as the single
 * audio backend (same scheduling/play/stop behavior).
 */
export async function createAudioEngine({ strictSf2 = false } = {}) {
  // 1) Preferred: SpessaSynth
  try {
    const spessa = new SpessaSynthEngine();
    await spessa.init();
    console.log('[Audio] SF2 Synth active (SpessaSynth lib + AudioWorklet)');
    return spessa;
  } catch (err) {
    if (strictSf2) {
      console.error('[Audio] Failed to initialise SpessaSynthEngine; audio disabled.', err);
      throw err;
    }
    console.warn('[Audio] Failed to initialise SpessaSynthEngine; trying legacy Sf2SynthEngine.', err);
  }

  // 2) Legacy: FluidSynth WASM
  try {
    const sf2 = new Sf2SynthEngine();
    await sf2.init();
    console.log('[Audio] SF2 Synth active (FluidSynth WASM)');
    return sf2;
  } catch (err) {
    console.warn('[Audio] Failed to initialise Sf2SynthEngine; falling back to SampleAudioEngine.', err);
  }

  // 3) Sample-based engine
  try {
    const sample = new SampleAudioEngine();
    if (typeof sample.init === 'function') {
      await sample.init();
    }
    console.log('[Audio] Using SampleAudioEngine (fallback samples)');
    return sample;
  } catch (err) {
    console.warn('[Audio] Failed to initialise SampleAudioEngine; falling back to NullAudioEngine.', err);
  }

  // 4) Last resort: silent
  const nullEngine = new NullAudioEngine();
  if (typeof nullEngine.init === 'function') {
    await nullEngine.init();
  }
  console.log('[Audio] Using NullAudioEngine (silent)');
  return nullEngine;
}
