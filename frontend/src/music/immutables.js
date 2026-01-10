/**
 * frontend/src/music/immutables.js
 *
 * Canonical key strings and version constants used across the codebase.
 * New code must import from here rather than writing raw literals.
 */

export const PROTOCOL_VERSION = '1.0';
export const GRAPH_VERSION = '9.11';
export const RESOLVER_VERSION = '9.11.0';

export const THOUGHT_INTENT_KEYS = Object.freeze({
  ROOT: 'intent',
  GOAL: 'goal',
  ROLE: 'role',
  STYLE_ID: 'styleId',
  MOOD_ID: 'moodId',
  MOTION_ID: 'motionId',
  DENSITY: 'density',
  HARMONY_BEHAVIOR: 'harmonyBehavior',
  SOUND_COLOR: 'soundColor',
  SEED: 'seed',
  LOCKS: 'locks',
});

export const THOUGHT_COMPILED_KEYS = Object.freeze({
  ROOT: 'compiled',
  RESOLVER_VERSION: 'resolverVersion',
  NOTE_PATTERN_ID: 'notePatternId',
  RHYTHM_GRID: 'rhythmGrid',
  SYNCOPATION: 'syncopation',
  TIMING_WARP: 'timingWarp',
  TIMING_INTENSITY: 'timingIntensity',
  INSTRUMENT_PRESET: 'instrumentPreset',
  REGISTER_MIN: 'registerMin',
  REGISTER_MAX: 'registerMax',
  PRESET_CODE: 'presetCode',
  ARTIFACT: 'artifact',
});
