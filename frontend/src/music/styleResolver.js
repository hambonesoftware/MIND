import { STYLE_BY_ID, STYLE_CATALOG } from './styleCatalog.js';

const DEFAULTS = {
  harmonyMode: 'progression_preset',
  progressionVariantId: 'triads',
  chordsPerBar: '1',
  fillBehavior: 'repeat',
  progressionLength: 'preset',
  patternType: 'arp-3-up',
  rhythmGrid: '1/12',
  syncopation: 'none',
  timingWarp: 'none',
  timingIntensity: 0,
  instrumentPreset: 'gm:0:0',
  registerMin: 48,
  registerMax: 84,
};

function toUint32(value) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return (value >>> 0) >>> 0;
}

export function mulberry32(seed) {
  let t = toUint32(seed) + 0x6d2b79f5;
  return () => {
    t = toUint32(t + 0x6d2b79f5);
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function hash32(input) {
  const str = String(input);
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i += 1) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
    hash >>>= 0;
  }
  return hash >>> 0;
}

function makeSubSeed(styleSeed, styleId, nodeId, namespace) {
  return hash32(`${styleId}|${styleSeed}|${nodeId}|${namespace}`);
}

function stablePick(candidates, rng) {
  if (!candidates || candidates.length === 0) {
    return null;
  }
  const normalized = [...candidates].map((value) => {
    if (value && typeof value === 'object') {
      const id = value.id ?? JSON.stringify(value);
      return { value, key: String(id) };
    }
    return { value, key: String(value) };
  });
  normalized.sort((a, b) => a.key.localeCompare(b.key));
  const roll = rng();
  const index = Math.floor(roll * normalized.length) % normalized.length;
  return normalized[index].value;
}

function resolveHarmony(style, seed, nodeId, locks, overrides) {
  const result = {};
  const rng = mulberry32(makeSubSeed(seed, style.id, nodeId, 'harmony'));

  const withPriority = (field, candidates, fallback) => {
    if (overrides && overrides[field] !== undefined && overrides[field] !== null) {
      result[field] = overrides[field];
      return result[field];
    }
    if (locks && locks[field] !== undefined && locks[field] !== null) {
      result[field] = locks[field];
      return result[field];
    }
    const choice = stablePick(candidates, rng) ?? fallback;
    result[field] = choice;
    return result[field];
  };

  result.harmonyMode = withPriority('harmonyMode', [DEFAULTS.harmonyMode], DEFAULTS.harmonyMode);

  const presetId = withPriority('progressionPresetId', style.progressions, style.progressions?.[0]);
  const variantCandidates = style.variantsByProgression?.[presetId] || style.variants || [DEFAULTS.progressionVariantId];
  withPriority('progressionVariantId', variantCandidates, variantCandidates?.[0] || DEFAULTS.progressionVariantId);

  withPriority('chordsPerBar', style.chordsPerBar || [DEFAULTS.chordsPerBar], DEFAULTS.chordsPerBar);
  withPriority('fillBehavior', style.fillBehavior || [DEFAULTS.fillBehavior], DEFAULTS.fillBehavior);
  withPriority('progressionLength', style.progressionLength || [DEFAULTS.progressionLength], DEFAULTS.progressionLength);

  return result;
}

function resolvePattern(style, seed, nodeId, locks, overrides) {
  const result = {};
  const rng = mulberry32(makeSubSeed(seed, style.id, nodeId, 'pattern'));

  const withPriority = (field, candidates, fallback) => {
    if (overrides && overrides[field] !== undefined && overrides[field] !== null) {
      result[field] = overrides[field];
      return result[field];
    }
    if (locks && locks[field] !== undefined && locks[field] !== null) {
      result[field] = locks[field];
      return result[field];
    }
    const choice = stablePick(candidates, rng) ?? fallback;
    result[field] = choice;
    return result[field];
  };

  const patternId = withPriority('notePatternId', style.patterns, style.patterns?.[0]);
  const patternType = style.patternTypeByPatternId?.[patternId] || patternId || DEFAULTS.patternType;
  withPriority('patternType', [patternType], patternType);

  return result;
}

function resolveFeel(style, seed, nodeId, locks, overrides) {
  const result = {};
  const rng = mulberry32(makeSubSeed(seed, style.id, nodeId, 'feel'));

  const withPriority = (field, candidates, fallback) => {
    if (overrides && overrides[field] !== undefined && overrides[field] !== null) {
      result[field] = overrides[field];
      return result[field];
    }
    if (locks && locks[field] !== undefined && locks[field] !== null) {
      result[field] = locks[field];
      return result[field];
    }
    const choice = stablePick(candidates, rng) ?? fallback;
    result[field] = choice;
    return result[field];
  };

  const feel = style.feelCandidates || {};
  withPriority('rhythmGrid', feel.rhythmGrid, feel.rhythmGrid?.[0] || DEFAULTS.rhythmGrid);
  withPriority('syncopation', feel.syncopation, feel.syncopation?.[0] || DEFAULTS.syncopation);
  withPriority('timingWarp', feel.timingWarp, feel.timingWarp?.[0] || DEFAULTS.timingWarp);
  withPriority('timingIntensity', feel.timingIntensity, feel.timingIntensity?.[0] ?? DEFAULTS.timingIntensity);

  return result;
}

function resolveInstrument(style, seed, nodeId, locks, overrides) {
  const result = {};
  const rng = mulberry32(makeSubSeed(seed, style.id, nodeId, 'instrument'));

  const withPriority = (field, candidates, fallback) => {
    if (overrides && overrides[field] !== undefined && overrides[field] !== null) {
      result[field] = overrides[field];
      return result[field];
    }
    if (locks && locks[field] !== undefined && locks[field] !== null) {
      result[field] = locks[field];
      return result[field];
    }
    const choice = stablePick(candidates, rng) ?? fallback;
    result[field] = choice;
    return result[field];
  };

  withPriority('instrumentPreset', style.instrumentPresets, style.instrumentPresets?.[0] || DEFAULTS.instrumentPreset);

  const range = stablePick(style.registerRanges, rng) || style.registerRanges?.[0];
  const registerMin = range?.min ?? DEFAULTS.registerMin;
  const registerMax = range?.max ?? DEFAULTS.registerMax;

  withPriority('registerMin', [registerMin], registerMin);
  withPriority('registerMax', [registerMax], registerMax);

  return result;
}

export function resolveThoughtStyle({
  styleId,
  styleSeed = 0,
  nodeId = 'node',
  locks = {},
  overrides = {},
  modes = {},
} = {}) {
  const style = STYLE_BY_ID[styleId] || STYLE_CATALOG[0];
  const seed = toUint32(styleSeed);
  const nodeKey = nodeId || 'node';

  const harmony = resolveHarmony(style, seed, nodeKey, locks, overrides);
  const pattern = resolvePattern(style, seed, nodeKey, locks, overrides);
  const feel = resolveFeel(style, seed, nodeKey, locks, overrides);
  const instrument = resolveInstrument(style, seed, nodeKey, locks, overrides);

  return {
    styleId: style.id,
    styleSeed: seed,
    modes: modes || {},
    ...harmony,
    ...pattern,
    ...feel,
    ...instrument,
  };
}
