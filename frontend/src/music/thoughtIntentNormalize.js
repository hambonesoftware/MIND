import { STYLE_METADATA_DEFAULTS } from '../state/nodeRegistry.js';

const DEFAULT_INTENT = Object.freeze({
  goal: 'driving_groove',
  role: 'harmony',
  motionId: 'flowing',
  density: 0.5,
  harmonyBehavior: 'auto',
  soundColor: 'auto',
});

const isObject = (value) => Boolean(value && typeof value === 'object' && !Array.isArray(value));

const normalizeNumber = (value, fallback) => (Number.isFinite(value) ? value : fallback);

export function normalizeThoughtIntent(canon = {}) {
  const intentInput = isObject(canon.intent) ? canon.intent : {};
  const style = isObject(canon.style) ? canon.style : {};
  const mood = isObject(style.mood) ? style.mood : {};
  const resolution = isObject(style.resolution) ? style.resolution : {};

  const styleId = intentInput.styleId ?? style.id ?? canon.styleId ?? STYLE_METADATA_DEFAULTS.styleId;
  const moodId = intentInput.moodId ?? mood.id ?? canon.moodId ?? STYLE_METADATA_DEFAULTS.moodId;
  const seed = normalizeNumber(
    intentInput.seed ?? style.seed ?? canon.styleSeed,
    STYLE_METADATA_DEFAULTS.styleSeed,
  );

  const locksInput = intentInput.locks ?? resolution.locks ?? canon.styleOptionLocks ?? {};
  const locks = isObject(locksInput) ? { ...locksInput } : {};

  return {
    goal: intentInput.goal ?? DEFAULT_INTENT.goal,
    role: intentInput.role ?? DEFAULT_INTENT.role,
    styleId,
    moodId,
    motionId: intentInput.motionId ?? DEFAULT_INTENT.motionId,
    density: normalizeNumber(intentInput.density, DEFAULT_INTENT.density),
    harmonyBehavior: intentInput.harmonyBehavior ?? DEFAULT_INTENT.harmonyBehavior,
    soundColor: intentInput.soundColor ?? DEFAULT_INTENT.soundColor,
    seed,
    locks,
  };
}
