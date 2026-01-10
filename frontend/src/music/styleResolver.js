import { STYLE_BY_ID, STYLE_CATALOG, normalizeStyleId } from './styleCatalog.js';
import { getMoodById, getMoodsForStyle, getDefaultMoodId } from './moodCatalog.js';
import { HARMONY_PROGRESSIONS, HARMONY_BY_ID } from './harmonyCatalog.js';
import { PATTERN_CATALOG, PATTERN_BY_ID, FALLBACK_PATTERNS } from './patternCatalog.js';
import { FEEL_PRESETS, FEEL_BY_ID } from './feelCatalog.js';
import { INSTRUMENT_SUGGESTIONS, REGISTER_SUGGESTIONS, INSTRUMENT_BY_ID, REGISTER_BY_ID } from './instrumentCatalog.js';
import { CAPABILITIES, capabilityEnabled } from './capabilities.js';
import { MOTION_BY_ID } from './motionCatalog.js';

const DEFAULTS = {
  harmonyMode: 'progression_preset',
  progressionPresetId: 'legacy_pop',
  progressionVariantId: 'triads',
  progressionLength: 'preset',
  chordsPerBar: '1',
  fillBehavior: 'repeat',
  patternType: 'arp-3-up',
  rhythmGrid: '1/12',
  syncopation: 'none',
  timingWarp: 'none',
  timingIntensity: 0,
  instrumentPreset: 'gm:0:0',
  registerMin: 48,
  registerMax: 84,
  styleId: 'legacy',
  moodId: 'none',
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

function makeSubSeed(styleSeed, nodeId, groupName) {
  return hash32(`${styleSeed}|${nodeId}|${groupName}`);
}

function stablePickId(candidates, rng) {
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

function normalizeStyle(styleId) {
  const normalizedId = normalizeStyleId(styleId);
  return STYLE_BY_ID[normalizedId] || STYLE_BY_ID[DEFAULTS.styleId] || STYLE_CATALOG[0];
}

function resolveMoodId({ style, moodId, moodMode, styleSeed, nodeId }) {
  const moods = getMoodsForStyle(style.id);
  if (moodMode === 'auto') {
    const rng = mulberry32(makeSubSeed(styleSeed, nodeId, `mood:${style.id}`));
    return stablePickId(moods.map(mood => mood.id), rng) || moods[0]?.id || getDefaultMoodId(style.id);
  }
  const requested = moods.find(mood => mood.id === moodId);
  if (requested) {
    return requested.id;
  }
  return getDefaultMoodId(style.id);
}

function scoreTags(itemTags = [], moodTags = [], styleTags = []) {
  const targets = new Set([...(moodTags || []), ...(styleTags || [])]);
  return itemTags.reduce((score, tag) => (targets.has(tag) ? score + 1 : score), 0);
}

function sortByScoreAndId(items, moodTags, styleTags) {
  return [...items].map(item => ({
    item,
    score: scoreTags(item.tags || [], moodTags, styleTags),
  })).sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (a.item.id || '').localeCompare(b.item.id || '');
  }).map(entry => entry.item);
}

function filterByStyle(items, styleId) {
  return items.filter(item => (item.styles || []).includes(styleId));
}

function ensureMinimum(list, fallback, minCount) {
  if (!Array.isArray(list) || list.length >= minCount) {
    return list;
  }
  return fallback;
}

const MIN_ROLE_MOTION_CANDIDATES = 6;

function dedupeById(list) {
  const seen = new Set();
  const result = [];
  for (const item of list || []) {
    if (item?.id && !seen.has(item.id)) {
      seen.add(item.id);
      result.push(item);
    }
  }
  return result;
}

function filterPatternsByRoleMotion(patterns, role, motionId) {
  return (patterns || []).filter((pattern) => {
    const roles = pattern.roles || [];
    const motions = pattern.motions || [];
    const roleMatch = !role || roles.length === 0 || roles.includes(role);
    const motionMatch = !motionId || motions.length === 0 || motions.includes(motionId);
    return roleMatch && motionMatch;
  });
}

function isArpPattern(pattern) {
  const id = String(pattern?.id || '').toLowerCase();
  const label = String(pattern?.label || '').toLowerCase();
  return id.includes('arp') || label.includes('arp');
}

function motionAllowsArps(motionId) {
  if (!motionId) return false;
  return Boolean(MOTION_BY_ID[motionId]?.allowArps);
}

function gatePatternsByCapability(patterns, capabilities) {
  return patterns.filter((pattern) => {
    if (!pattern.requiresCapability) return true;
    if (capabilities && Object.prototype.hasOwnProperty.call(capabilities, pattern.requiresCapability)) {
      return Boolean(capabilities[pattern.requiresCapability]);
    }
    return capabilityEnabled(pattern.requiresCapability);
  });
}

function withFallbackPatterns(baseList, styleId, capabilities, gateUnsupported = true) {
  const allIds = new Set(baseList.map(item => item.id));
  const fallbacks = FALLBACK_PATTERNS
    .map(id => PATTERN_BY_ID[id])
    .filter(Boolean)
    .filter(pattern => (pattern.styles || []).includes(styleId))
    .filter(pattern => !gateUnsupported || gatePatternsByCapability([pattern], capabilities).length > 0);
  const merged = [...baseList];
  for (const pattern of fallbacks) {
    if (!allIds.has(pattern.id)) {
      merged.push(pattern);
      allIds.add(pattern.id);
    }
  }
  return merged;
}

function buildPatternSet(style, moodTags, styleTags, capabilities) {
  const raw = filterByStyle(PATTERN_CATALOG, style.id);
  const sortedAll = sortByScoreAndId(raw, [], []);
  const supported = gatePatternsByCapability(raw, capabilities);
  const recommended = sortByScoreAndId(supported, moodTags, styleTags);
  const finalRecommended = withFallbackPatterns(recommended, style.id, capabilities, true);
  return {
    all: dedupeById(withFallbackPatterns(sortedAll, style.id, capabilities, false)),
    recommended: dedupeById(finalRecommended),
  };
}

function buildProgressionSet(style, moodTags, styleTags) {
  const candidates = filterByStyle(HARMONY_PROGRESSIONS, style.id);
  const sortedAll = sortByScoreAndId(candidates, [], []);
  const recommended = sortByScoreAndId(candidates, moodTags, styleTags);
  const ensured = ensureMinimum(recommended, sortedAll, 2);
  return {
    all: dedupeById(sortedAll),
    recommended: dedupeById(ensured),
  };
}

function buildFeelSet(style, moodTags, styleTags) {
  const candidates = filterByStyle(FEEL_PRESETS, style.id);
  const sortedAll = sortByScoreAndId(candidates, [], []);
  const recommended = sortByScoreAndId(candidates, moodTags, styleTags);
  const ensured = ensureMinimum(recommended, sortedAll, 2);
  return {
    all: dedupeById(sortedAll),
    recommended: dedupeById(ensured),
  };
}

function buildInstrumentSet(style, moodTags, styleTags) {
  const candidates = filterByStyle(INSTRUMENT_SUGGESTIONS, style.id);
  const sortedAll = sortByScoreAndId(candidates, [], []);
  const recommended = sortByScoreAndId(candidates, moodTags, styleTags);
  const ensured = ensureMinimum(recommended, sortedAll, 2);
  return {
    all: dedupeById(sortedAll),
    recommended: dedupeById(ensured),
  };
}

function buildRegisterSet(style, moodTags, styleTags) {
  const candidates = filterByStyle(REGISTER_SUGGESTIONS, style.id);
  const sortedAll = sortByScoreAndId(candidates, [], []);
  const recommended = sortByScoreAndId(candidates, moodTags, styleTags);
  const ensured = ensureMinimum(recommended, sortedAll, 1);
  return {
    all: dedupeById(sortedAll),
    recommended: dedupeById(ensured),
  };
}

export function buildStyleOptionSets({ styleId, moodId, moodMode = 'override', styleSeed = 0, nodeId = 'node', capabilities = CAPABILITIES } = {}) {
  const style = normalizeStyle(styleId || DEFAULTS.styleId);
  const resolvedMoodId = resolveMoodId({ style, moodId, moodMode, styleSeed, nodeId });
  const mood = getMoodById(style.id, resolvedMoodId);
  const moodTags = mood?.tags || [];
  const styleTags = style?.tags || [];

  return {
    style,
    mood,
    moodId: mood?.id || resolvedMoodId,
    moods: getMoodsForStyle(style.id),
    tagContext: { moodTags, styleTags },
    optionSets: {
      progressions: buildProgressionSet(style, moodTags, styleTags),
      patterns: buildPatternSet(style, moodTags, styleTags, capabilities),
      feels: buildFeelSet(style, moodTags, styleTags),
      instruments: buildInstrumentSet(style, moodTags, styleTags),
      registers: buildRegisterSet(style, moodTags, styleTags),
    },
  };
}

function pickWithPriority({ field, candidates, fallback, locks, overrides, rng }) {
  if (overrides && overrides[field] !== undefined && overrides[field] !== null) {
    return overrides[field];
  }
  if (locks && locks[field] !== undefined && locks[field] !== null) {
    return locks[field];
  }
  const pick = stablePickId(candidates, rng);
  if (pick !== null && pick !== undefined) {
    return pick;
  }
  return fallback;
}

function resolveHarmony({ style, optionSets, seed, nodeId, locks, overrides, moodTags = [], styleTags = [] }) {
  const rng = mulberry32(makeSubSeed(seed, nodeId, `harmony:${style.id}`));
  const progressionCandidates = optionSets.progressions?.recommended?.length
    ? optionSets.progressions.recommended
    : optionSets.progressions?.all || [];
  const progressionIds = progressionCandidates.map(item => item.id);
  const selectedPresetId = pickWithPriority({
    field: 'progressionPresetId',
    candidates: progressionIds,
    fallback: progressionIds[0] || DEFAULTS.progressionPresetId,
    locks,
    overrides,
    rng,
  });
  const progression = HARMONY_BY_ID[selectedPresetId] || progressionCandidates[0];
  const variantCandidates = progression?.variants || [];
  const variantSorted = sortByScoreAndId(variantCandidates, [...(progression?.tags || []), ...moodTags], styleTags || []);
  const variantIds = (variantSorted.length > 0 ? variantSorted : variantCandidates).map(variant => variant.id);
  const progressionCustom = String(progression?.romanTemplate || '').trim().replace(/\s+/g, ' ');

  return {
    harmonyMode: pickWithPriority({ field: 'harmonyMode', candidates: ['progression_custom'], fallback: 'progression_custom', locks, overrides, rng }),
    progressionPresetId: selectedPresetId,
    progressionVariantId: pickWithPriority({
      field: 'progressionVariantId',
      candidates: variantIds,
      fallback: variantIds[0] || DEFAULTS.progressionVariantId,
      locks,
      overrides,
      rng,
    }),
    progressionCustom,
    progressionCustomVariantStyle: pickWithPriority({
      field: 'progressionCustomVariantStyle',
      candidates: variantIds,
      fallback: variantIds[0] || DEFAULTS.progressionVariantId,
      locks,
      overrides,
      rng,
    }),
    chordsPerBar: pickWithPriority({ field: 'chordsPerBar', candidates: [DEFAULTS.chordsPerBar], fallback: DEFAULTS.chordsPerBar, locks, overrides, rng }),
    fillBehavior: pickWithPriority({ field: 'fillBehavior', candidates: [DEFAULTS.fillBehavior], fallback: DEFAULTS.fillBehavior, locks, overrides, rng }),
    progressionLength: pickWithPriority({
      field: 'progressionLength',
      candidates: [progression?.defaultLengthBars ?? DEFAULTS.progressionLength],
      fallback: progression?.defaultLengthBars ?? DEFAULTS.progressionLength,
      locks,
      overrides,
      rng,
    }),
  };
}

function resolvePattern({ optionSets, seed, style, nodeId, locks, overrides, role, motionId }) {
  const rng = mulberry32(makeSubSeed(seed, nodeId, `pattern:${style.id}`));
  const patternCandidates = optionSets.patterns?.recommended?.length
    ? optionSets.patterns.recommended
    : optionSets.patterns?.all || [];
  let filteredCandidates = filterPatternsByRoleMotion(patternCandidates, role, motionId);
  filteredCandidates = ensureMinimum(filteredCandidates, patternCandidates, MIN_ROLE_MOTION_CANDIDATES);
  if (motionId === 'arpeggiate') {
    const arpCandidates = filteredCandidates.filter(pattern => isArpPattern(pattern));
    if (arpCandidates.length > 0) {
      filteredCandidates = arpCandidates;
    } else {
      const globalArpCandidates = patternCandidates.filter(pattern => isArpPattern(pattern));
      if (globalArpCandidates.length > 0) {
        filteredCandidates = globalArpCandidates;
      }
    }
  }
  if ((role === 'bass' || role === 'harmony') && !motionAllowsArps(motionId)) {
    const nonArpCandidates = filteredCandidates.filter(pattern => !isArpPattern(pattern));
    if (nonArpCandidates.length > 0) {
      filteredCandidates = nonArpCandidates;
    }
  }
  const patternIds = filteredCandidates.map(item => item.id);
  const selectedPatternId = pickWithPriority({
    field: 'notePatternId',
    candidates: patternIds,
    fallback: patternIds[0],
    locks,
    overrides,
    rng,
  });
  const pattern = PATTERN_BY_ID[selectedPatternId] || filteredCandidates[0];
  const patternType = pattern?.mapsToPatternType || selectedPatternId || DEFAULTS.patternType;
  return {
    notePatternId: selectedPatternId,
    patternType: pickWithPriority({
      field: 'patternType',
      candidates: [patternType],
      fallback: patternType,
      locks,
      overrides,
      rng,
    }),
  };
}

function resolveFeel({ optionSets, seed, style, nodeId, locks, overrides }) {
  const rng = mulberry32(makeSubSeed(seed, nodeId, `feel:${style.id}`));
  const feelCandidates = optionSets.feels?.recommended?.length
    ? optionSets.feels.recommended
    : optionSets.feels?.all || [];
  const feelIds = feelCandidates.map(item => item.id);
  const selectedFeelId = pickWithPriority({
    field: 'feelPresetId',
    candidates: feelIds,
    fallback: feelIds[0],
    locks,
    overrides,
    rng,
  });
  const feel = FEEL_BY_ID[selectedFeelId] || feelCandidates[0];
  return {
    rhythmGrid: pickWithPriority({ field: 'rhythmGrid', candidates: [feel?.rhythmGrid], fallback: feel?.rhythmGrid || DEFAULTS.rhythmGrid, locks, overrides, rng }),
    syncopation: pickWithPriority({ field: 'syncopation', candidates: [feel?.syncopation], fallback: feel?.syncopation || DEFAULTS.syncopation, locks, overrides, rng }),
    timingWarp: pickWithPriority({ field: 'timingWarp', candidates: [feel?.timingWarp], fallback: feel?.timingWarp || DEFAULTS.timingWarp, locks, overrides, rng }),
    timingIntensity: pickWithPriority({ field: 'timingIntensity', candidates: [feel?.timingIntensity], fallback: feel?.timingIntensity ?? DEFAULTS.timingIntensity, locks, overrides, rng }),
  };
}

function resolveInstrument({ optionSets, seed, style, nodeId, locks, overrides }) {
  const rng = mulberry32(makeSubSeed(seed, nodeId, `instrument:${style.id}`));
  const instrumentCandidates = optionSets.instruments?.recommended?.length
    ? optionSets.instruments.recommended
    : optionSets.instruments?.all || [];
  const instrumentIds = instrumentCandidates.map(item => item.id);
  const selectedInstrumentId = pickWithPriority({
    field: 'instrumentPreset',
    candidates: instrumentIds,
    fallback: instrumentIds[0],
    locks,
    overrides,
    rng,
  });
  const instrument = INSTRUMENT_BY_ID[selectedInstrumentId] || instrumentCandidates[0];

  const registerCandidates = optionSets.registers?.recommended?.length
    ? optionSets.registers.recommended
    : optionSets.registers?.all || [];
  const registerIds = registerCandidates.map(item => item.id);
  const selectedRegisterId = pickWithPriority({
    field: 'registerRangeId',
    candidates: registerIds,
    fallback: registerIds[0],
    locks,
    overrides,
    rng,
  });
  const register = REGISTER_BY_ID[selectedRegisterId] || registerCandidates[0];

  return {
    instrumentPreset: instrument?.instrumentPreset || DEFAULTS.instrumentPreset,
    registerMin: pickWithPriority({
      field: 'registerMin',
      candidates: [register?.min],
      fallback: register?.min ?? DEFAULTS.registerMin,
      locks,
      overrides,
      rng,
    }),
    registerMax: pickWithPriority({
      field: 'registerMax',
      candidates: [register?.max],
      fallback: register?.max ?? DEFAULTS.registerMax,
      locks,
      overrides,
      rng,
    }),
  };
}

export function resolveThoughtStyle({
  styleId = DEFAULTS.styleId,
  styleSeed = 0,
  nodeId = 'node',
  locks = {},
  overrides = {},
  modes = {},
  moodMode = 'override',
  moodId = DEFAULTS.moodId,
  capabilities = CAPABILITIES,
  role = null,
  motionId = null,
} = {}) {
  const style = normalizeStyle(styleId);
  const seed = toUint32(styleSeed);
  const { optionSets, mood, tagContext } = buildStyleOptionSets({ styleId: style.id, moodId, moodMode, styleSeed: seed, nodeId, capabilities });
  const moodTags = tagContext?.moodTags || [];
  const styleTags = tagContext?.styleTags || [];

  const harmony = resolveHarmony({ style, optionSets, seed, nodeId, locks, overrides, moodTags, styleTags });
  const pattern = resolvePattern({ style, optionSets, seed, nodeId, locks, overrides, role, motionId });
  const feel = resolveFeel({ style, optionSets, seed, nodeId, locks, overrides });
  const instrument = resolveInstrument({ style, optionSets, seed, nodeId, locks, overrides });

  return {
    styleId: style.id,
    styleSeed: seed,
    moodId: mood?.id || moodId,
    resolvedMoodId: mood?.id || moodId,
    modes: modes || {},
    ...harmony,
    ...pattern,
    ...feel,
    ...instrument,
  };
}
