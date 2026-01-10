import { getNodeDefinition } from '../state/nodeRegistry.js';
import {
  buildProgressionPreview,
  getProgressionPresetById,
  getProgressionPresets,
} from '../music/progressions.js';
import { STYLE_CATALOG } from '../music/styleCatalog.js';
import { buildStyleOptionSets, resolveThoughtStyle } from '../music/styleResolver.js';
import { PATTERN_BY_ID } from '../music/patternCatalog.js';
import { normalizeMusicThoughtParams } from '../music/normalizeThought.js';
import { PRESET_LIBRARY } from '../music/presetLibrary.js';
import { insertMoonlightTrebleTemplate } from '../templates/moonlightTreble.js';
import {
  buildPresetRhythmA,
  buildPresetRhythmB,
  getStepsPerBar,
  listNoteStarts,
  normalizeBars,
  normalizeRhythm,
  syncNotesToRhythm,
  tokenizeNotes,
} from './customMelodyModel.js';
import { createStepStrip } from './stepStrip.js';

const SOUND_FONTS = [
  { value: '/assets/soundfonts/General-GS.sf2', label: 'General GS' },
];

const STYLE_DROPDOWN_VIEW_OPTIONS = [
  { value: 'recommended', label: 'Recommended (Style+Mood)' },
  { value: 'all', label: 'All in Style' },
];

const BEGINNER_DEFAULTS = {
  role: 'verse',
  voice: 'auto',
  style: 'pop',
  inst: 'auto',
  pat: 'auto',
  mood: 'warm',
  energy: 'medium',
  complexity: 'normal',
  variation: 'similar',
  len: '8',
  reg: 'mid',
  reroll: 0,
};

const BEGINNER_OPTIONS = {
  role: [
    { value: 'intro', label: 'Intro' },
    { value: 'verse', label: 'Verse' },
    { value: 'pre-chorus', label: 'Pre-Chorus' },
    { value: 'chorus', label: 'Chorus' },
    { value: 'bridge', label: 'Bridge' },
    { value: 'outro', label: 'Outro' },
    { value: 'fill', label: 'Fill/Transition' },
  ],
  voice: [
    { value: 'auto', label: 'Auto' },
    { value: 'lead', label: 'Lead' },
    { value: 'harmony', label: 'Harmony' },
    { value: 'bass', label: 'Bass' },
    { value: 'drums', label: 'Drums' },
    { value: 'fx', label: 'FX/Transitions' },
  ],
  style: [
    { value: 'pop', label: 'Pop' },
    { value: 'hip-hop', label: 'Hip-Hop' },
    { value: 'electronic', label: 'Electronic' },
    { value: 'lo-fi', label: 'Lo-Fi' },
    { value: 'rock', label: 'Rock' },
    { value: 'jazz', label: 'Jazz' },
    { value: 'classical', label: 'Classical' },
    { value: 'cinematic', label: 'Cinematic' },
    { value: 'world', label: 'World' },
    { value: 'experimental', label: 'Experimental' },
  ],
  mood: [
    { value: 'bright', label: 'Bright' },
    { value: 'warm', label: 'Warm' },
    { value: 'dreamy', label: 'Dreamy' },
    { value: 'dark', label: 'Dark' },
    { value: 'mysterious', label: 'Mysterious' },
    { value: 'tense', label: 'Tense' },
    { value: 'epic', label: 'Epic' },
    { value: 'playful', label: 'Playful' },
  ],
  energy: [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'peak', label: 'Peak' },
  ],
  complexity: [
    { value: 'simple', label: 'Simple' },
    { value: 'normal', label: 'Normal' },
    { value: 'rich', label: 'Rich' },
  ],
  variation: [
    { value: 'same', label: 'Same' },
    { value: 'similar', label: 'Similar' },
    { value: 'fresh', label: 'Fresh' },
    { value: 'wild', label: 'Wild' },
  ],
  len: [
    { value: '2', label: '2 bars' },
    { value: '4', label: '4 bars' },
    { value: '8', label: '8 bars' },
    { value: '16', label: '16 bars' },
  ],
  reg: [
    { value: 'low', label: 'Low' },
    { value: 'mid', label: 'Mid' },
    { value: 'high', label: 'High' },
  ],
};

const BEGINNER_INSTRUMENTS = {
  auto: [
    { id: 'gm:0:0', label: 'Piano' },
    { id: 'gm:0:48', label: 'Strings' },
    { id: 'gm:0:80', label: 'Lead Synth' },
  ],
  lead: [
    { id: 'gm:0:80', label: 'Lead Synth' },
    { id: 'gm:0:56', label: 'Trumpet' },
    { id: 'gm:0:0', label: 'Piano' },
  ],
  harmony: [
    { id: 'gm:0:48', label: 'String Ensemble' },
    { id: 'gm:0:52', label: 'Choir Aahs' },
    { id: 'gm:0:0', label: 'Piano' },
  ],
  bass: [
    { id: 'gm:0:32', label: 'Acoustic Bass' },
  ],
  drums: [
    { id: 'gm_kick', label: 'Kick Drum' },
    { id: 'gm_snare', label: 'Snare Drum' },
    { id: 'gm_hat', label: 'Hi-Hat' },
  ],
  fx: [
    { id: 'gm:0:52', label: 'Choir Aahs' },
    { id: 'gm:0:56', label: 'Trumpet' },
    { id: 'gm:0:48', label: 'String Ensemble' },
  ],
};

const BEGINNER_PATTERN_FAMILIES = {
  lead: [
    { id: 'hook', label: 'Hook' },
    { id: 'riff', label: 'Riff' },
    { id: 'flowing_line', label: 'Flowing Line' },
    { id: 'call_response', label: 'Call/Response' },
    { id: 'light_fills', label: 'Runs/Fills (Light)' },
    { id: 'arp_texture', label: 'Arp Texture', optional: true },
  ],
  harmony: [
    { id: 'stabs', label: 'Stabs / Comping' },
    { id: 'strum_roll', label: 'Strum/Roll' },
    { id: 'pad_drone', label: 'Pad/Drone' },
    { id: 'chops', label: 'Chops' },
    { id: 'pulse', label: 'Pulse' },
    { id: 'arp_texture', label: 'Arp Texture', optional: true },
  ],
  bass: [
    { id: 'root_pulse', label: 'Root Pulse' },
    { id: 'octave_bounce', label: 'Octave Bounce' },
    { id: 'pedal_tone', label: 'Pedal Tone' },
    { id: 'walking_bass', label: 'Walking', styles: ['jazz', 'cinematic'] },
    { id: 'syncop_bass', label: 'Syncop Bass' },
  ],
  drums: [
    { id: 'basic_groove', label: 'Basic Groove' },
    { id: 'busy_groove', label: 'Busy Groove' },
    { id: 'half_time', label: 'Half-time' },
    { id: 'breakbeat', label: 'Breakbeat' },
    { id: 'swing_groove', label: 'Swing/Shuffley', styles: ['jazz'] },
    { id: 'fill_transition', label: 'Fill/Transition' },
  ],
  fx: [
    { id: 'riser', label: 'Riser' },
    { id: 'impact', label: 'Impact' },
    { id: 'noise_sweep', label: 'Noise Sweep' },
    { id: 'reverse', label: 'Reverse' },
    { id: 'transition_fill', label: 'Transition Fill' },
  ],
};

const ROLE_DEFAULTS = {
  intro: { energy: 'low', variation: 'similar' },
  verse: { energy: 'medium', variation: 'similar' },
  'pre-chorus': { energy: 'high', variation: 'fresh' },
  chorus: { energy: 'peak', variation: 'fresh' },
  bridge: { energy: 'medium', variation: 'wild' },
  outro: { energy: 'low', variation: 'similar' },
  fill: { energy: 'high', variation: 'fresh', len: '2' },
};

const ROLE_VOICE_DEFAULTS = {
  intro: {
    harmony: { pat: 'pad_drone' },
    bass: { pat: 'pedal_tone' },
    drums: { pat: 'half_time' },
  },
  chorus: {
    lead: { pat: 'hook' },
    drums: { pat: 'busy_groove' },
  },
  bridge: {
    lead: { pat: 'call_response' },
    harmony: { pat: 'chops' },
    bass: { pat: 'syncop_bass' },
  },
  outro: {
    harmony: { pat: 'pad_drone' },
    bass: { pat: 'pedal_tone' },
    drums: { pat: 'half_time' },
  },
  fill: {
    drums: { pat: 'fill_transition' },
    fx: { pat: 'transition_fill' },
  },
};

const ADVANCED_DEFAULTS = {
  style: {
    subtype: 'auto',
    era: 'auto',
    feelBias: 'auto',
    avoidArps: 'auto',
    avoidLeaps: 'auto',
    avoidBusy: 'auto',
    avoidChromatic: 'auto',
  },
  voice: {
    articulation: 'auto',
    tone: 'auto',
    humanization: 'auto',
    polyMode: 'auto',
    layering: 'auto',
  },
  pattern: {
    rhythmMask: 'auto',
    density: 'auto',
    accents: 'auto',
    contour: 'auto',
    repetition: 'auto',
  },
  mood: {
    tension: 'auto',
    brightness: 'auto',
    resolution: 'auto',
  },
  energy: {
    dynamics: 'auto',
    drive: 'auto',
    attack: 'auto',
    peaks: 'auto',
  },
  complexity: {
    harmony: 'auto',
    melody: 'auto',
    rhythm: 'auto',
    ornamentation: 'auto',
  },
  variation: {
    strategy: 'auto',
    similarity: 'auto',
    antiRepeat: 'auto',
    seedMode: 'auto',
  },
  length: {
    phrase: 'auto',
    cadence: 'auto',
  },
  register: {
    width: 'auto',
    movement: 'auto',
  },
};

const BEGINNER_VALUE_SETS = {
  role: new Set(BEGINNER_OPTIONS.role.map(option => option.value)),
  voice: new Set(BEGINNER_OPTIONS.voice.map(option => option.value)),
  style: new Set(BEGINNER_OPTIONS.style.map(option => option.value)),
  mood: new Set(BEGINNER_OPTIONS.mood.map(option => option.value)),
  energy: new Set(BEGINNER_OPTIONS.energy.map(option => option.value)),
  complexity: new Set(BEGINNER_OPTIONS.complexity.map(option => option.value)),
  variation: new Set(BEGINNER_OPTIONS.variation.map(option => option.value)),
  len: new Set(BEGINNER_OPTIONS.len.map(option => option.value)),
  reg: new Set(BEGINNER_OPTIONS.reg.map(option => option.value)),
};

const PRESET_ADVANCED_FIELDS = [
  { key: 'style_sub', path: ['style', 'subtype'] },
  { key: 'style_era', path: ['style', 'era'] },
  { key: 'style_feel', path: ['style', 'feelBias'] },
  { key: 'avoid_arps', path: ['style', 'avoidArps'] },
  { key: 'avoid_leaps', path: ['style', 'avoidLeaps'] },
  { key: 'avoid_busy', path: ['style', 'avoidBusy'] },
  { key: 'avoid_chromatic', path: ['style', 'avoidChromatic'] },
  { key: 'voice_art', path: ['voice', 'articulation'] },
  { key: 'voice_tone', path: ['voice', 'tone'] },
  { key: 'voice_human', path: ['voice', 'humanization'] },
  { key: 'voice_poly', path: ['voice', 'polyMode'] },
  { key: 'voice_layer', path: ['voice', 'layering'] },
  { key: 'pattern_mask', path: ['pattern', 'rhythmMask'] },
  { key: 'pattern_density', path: ['pattern', 'density'] },
  { key: 'pattern_accents', path: ['pattern', 'accents'] },
  { key: 'pattern_contour', path: ['pattern', 'contour'] },
  { key: 'pattern_repeat', path: ['pattern', 'repetition'] },
  { key: 'mood_tension', path: ['mood', 'tension'] },
  { key: 'mood_bright', path: ['mood', 'brightness'] },
  { key: 'mood_resolve', path: ['mood', 'resolution'] },
  { key: 'energy_dyn', path: ['energy', 'dynamics'] },
  { key: 'energy_drive', path: ['energy', 'drive'] },
  { key: 'energy_attack', path: ['energy', 'attack'] },
  { key: 'energy_peaks', path: ['energy', 'peaks'] },
  { key: 'complexity_harmony', path: ['complexity', 'harmony'] },
  { key: 'complexity_melody', path: ['complexity', 'melody'] },
  { key: 'complexity_rhythm', path: ['complexity', 'rhythm'] },
  { key: 'complexity_orn', path: ['complexity', 'ornamentation'] },
  { key: 'variation_strategy', path: ['variation', 'strategy'] },
  { key: 'variation_similarity', path: ['variation', 'similarity'] },
  { key: 'variation_window', path: ['variation', 'antiRepeat'] },
  { key: 'variation_seedmode', path: ['variation', 'seedMode'] },
  { key: 'length_phrase', path: ['length', 'phrase'] },
  { key: 'length_cadence', path: ['length', 'cadence'] },
  { key: 'register_width', path: ['register', 'width'] },
  { key: 'register_move', path: ['register', 'movement'] },
];

let currentFocusScope = '';

function debounce(fn, delay = 250) {
  let timeout = null;
  let lastArgs = null;
  const wrapped = (...args) => {
    lastArgs = args;
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      timeout = null;
      fn(...(lastArgs || []));
    }, delay);
  };
  wrapped.flush = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
      if (lastArgs) {
        fn(...lastArgs);
      }
    }
  };
  return wrapped;
}

function getInstrumentOptions(voiceType, presets = []) {
  const presetMap = new Map((presets || []).map(preset => [preset.id, preset.name]));
  const curated = BEGINNER_INSTRUMENTS[voiceType] || BEGINNER_INSTRUMENTS.auto;
  const baseOptions = curated.map(item => ({
    value: item.id,
    label: presetMap.get(item.id) || item.label || item.id,
  }));
  const options = [{ value: 'auto', label: 'Auto (curated)' }, ...baseOptions];
  const seen = new Set();
  return options.filter((option) => {
    if (seen.has(option.value)) return false;
    seen.add(option.value);
    return true;
  });
}

function getPatternOptions(voiceType, styleId) {
  const curated = BEGINNER_PATTERN_FAMILIES[voiceType] || [];
  const filtered = curated.filter((item) => {
    if (!item.styles || item.styles.length === 0) return true;
    return item.styles.includes(styleId);
  });
  const options = filtered.map(item => ({
    value: item.id,
    label: item.label,
  }));
  return [{ value: 'auto', label: 'Auto (curated)' }, ...options];
}

function getDefaultInstrumentForVoice(voiceType) {
  if (voiceType === 'auto') {
    return 'auto';
  }
  const curated = BEGINNER_INSTRUMENTS[voiceType] || BEGINNER_INSTRUMENTS.auto;
  return curated[0]?.id || 'auto';
}

function getDefaultPatternForVoice(voiceType, role) {
  if (voiceType === 'auto') {
    return 'auto';
  }
  if (role === 'fill') {
    if (voiceType === 'drums') return 'fill_transition';
    if (voiceType === 'fx') return 'transition_fill';
    return 'light_fills';
  }
  switch (voiceType) {
    case 'lead':
      return 'hook';
    case 'harmony':
      return 'pad_drone';
    case 'bass':
      return 'root_pulse';
    case 'drums':
      return 'basic_groove';
    case 'fx':
      return 'riser';
    default:
      return 'auto';
  }
}

function cloneAdvancedDefaults() {
  return JSON.parse(JSON.stringify(ADVANCED_DEFAULTS));
}

function mergeAdvancedState(current, next) {
  const base = cloneAdvancedDefaults();
  const merged = { ...base, ...(current || {}) };
  Object.keys(next || {}).forEach((sectionKey) => {
    merged[sectionKey] = {
      ...(merged[sectionKey] || {}),
      ...(next[sectionKey] || {}),
    };
  });
  return merged;
}

function getNestedValue(obj, path) {
  return path.reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

function setNestedValue(obj, path, value) {
  let cursor = obj;
  for (let i = 0; i < path.length - 1; i += 1) {
    const key = path[i];
    if (!cursor[key] || typeof cursor[key] !== 'object') {
      cursor[key] = {};
    }
    cursor = cursor[key];
  }
  cursor[path[path.length - 1]] = value;
}

function parsePresetCode(code) {
  const raw = String(code || '').trim();
  if (!raw) {
    return { ok: false, error: null };
  }
  const parts = raw.split('|');
  if (parts.length < 4 || parts[0] !== 'MIND') {
    return { ok: false, error: 'Preset Code must start with “MIND|PS#|GV#|”.' };
  }
  const schemaVersion = parts[1] || 'PS1';
  const generatorVersion = parts[2] || 'GV1';
  if (!['PS1', 'PS2'].includes(schemaVersion)) {
    return { ok: false, error: `Unsupported preset schema version: ${schemaVersion}.` };
  }
  if (!/^GV\d+$/i.test(generatorVersion)) {
    return { ok: false, error: `Invalid generator version: ${generatorVersion}.` };
  }
  const body = parts.slice(3).join('|');
  const entries = body.split(';').map(segment => segment.trim()).filter(Boolean);
  const nextBeginner = { ...BEGINNER_DEFAULTS };
  const nextAdvanced = cloneAdvancedDefaults();
  const allowedKeys = new Set([
    'role',
    'voice',
    'style',
    'inst',
    'pat',
    'mood',
    'energy',
    'complexity',
    'variation',
    'len',
    'reg',
    'reroll',
  ]);
  const advancedKeyMap = new Map(PRESET_ADVANCED_FIELDS.map(field => [field.key, field]));

  entries.forEach((entry) => {
    const [rawKey, rawValue = ''] = entry.split('=');
    const key = String(rawKey || '').trim().toLowerCase();
    const value = String(rawValue || '').trim().toLowerCase();
    const advancedField = advancedKeyMap.get(key);
    if (advancedField) {
      setNestedValue(nextAdvanced, advancedField.path, value || 'auto');
      return;
    }
    if (!allowedKeys.has(key)) {
      return;
    }
    if (key === 'inst' || key === 'pat') {
      if (value) {
        nextBeginner[key] = value;
      }
      return;
    }
    if (key === 'reroll') {
      const parsed = Number.parseInt(value, 10);
      if (Number.isFinite(parsed) && parsed >= 0) {
        nextBeginner.reroll = parsed;
      }
      return;
    }
    if (key === 'len') {
      const normalized = value;
      if (BEGINNER_VALUE_SETS.len.has(normalized)) {
        nextBeginner.len = normalized;
      }
      return;
    }
    const allowed = BEGINNER_VALUE_SETS[key];
    if (allowed && allowed.has(value)) {
      nextBeginner[key] = value;
    }
  });

  const targetSchemaVersion = schemaVersion === 'PS1' ? 'PS2' : schemaVersion;
  const normalized = buildPresetCodeFromBeginner(nextBeginner, {
    schemaVersion: targetSchemaVersion,
    generatorVersion: generatorVersion.toUpperCase(),
    advanced: nextAdvanced,
  });
  return {
    ok: true,
    beginner: nextBeginner,
    advanced: nextAdvanced,
    normalized,
    schemaVersion: targetSchemaVersion,
    generatorVersion: generatorVersion.toUpperCase(),
  };
}

function hashStringToSeed(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = (hash + (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)) >>> 0;
  }
  return hash;
}

function compilePresetCode(code) {
  const parsed = parsePresetCode(code);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error || 'Invalid Preset Code.' };
  }
  const normalized = parsed.normalized;
  const seed = hashStringToSeed(`${normalized}|${parsed.generatorVersion}`);
  return {
    ok: true,
    presetCode: normalized,
    beginner: parsed.beginner,
    advanced: parsed.advanced,
    compiledArtifact: {
      presetCode: normalized,
      generatorVersion: parsed.generatorVersion,
      seed,
    },
  };
}

function buildPresetCodeFromBeginner(beginner, { schemaVersion = 'PS2', generatorVersion = 'GV1', advanced = null } = {}) {
  const normalized = { ...BEGINNER_DEFAULTS, ...(beginner || {}) };
  const fields = [
    ['role', normalized.role],
    ['voice', normalized.voice],
    ['style', normalized.style],
    ['inst', normalized.inst],
    ['pat', normalized.pat],
    ['mood', normalized.mood],
    ['energy', normalized.energy],
    ['complexity', normalized.complexity],
    ['variation', normalized.variation],
    ['len', normalized.len],
    ['reg', normalized.reg],
    ['reroll', Number.isFinite(Number(normalized.reroll)) ? Number(normalized.reroll) : 0],
  ];
  if (schemaVersion === 'PS2') {
    const advancedState = mergeAdvancedState(advanced, {});
    PRESET_ADVANCED_FIELDS.forEach((field) => {
      const value = getNestedValue(advancedState, field.path) ?? 'auto';
      fields.push([field.key, value || 'auto']);
    });
  }
  const pairs = fields.map(([key, value]) => `${key}=${value}`);
  return `MIND|${schemaVersion}|${generatorVersion}|${pairs.join(';')}`;
}

let presetCache = null;
let presetCachePromise = null;

async function loadPresets() {
  if (presetCachePromise) {
    return presetCachePromise;
  }
  presetCachePromise = fetch('/api/presets')
    .then(res => (res.ok ? res.json() : Promise.reject(new Error('Preset load failed'))))
    .then(data => {
      presetCache = Array.isArray(data?.presets) ? data.presets : [];
      return presetCache;
    })
    .catch(() => {
      presetCache = [];
      return presetCache;
    });
  return presetCachePromise;
}

const customMelodyState = new Map();
let customMelodyClipboard = null;
const rebuildNoticeByNode = new Map();

const STORAGE_KEYS = {
  recent: 'mindRecentPresets',
  saved: 'mindSavedPresets',
};

function readPresetStorage(key) {
  if (typeof localStorage === 'undefined') {
    return [];
  }
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function writePresetStorage(key, value) {
  if (typeof localStorage === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // ignore storage errors
  }
}

function addRecentPreset(entry) {
  const list = readPresetStorage(STORAGE_KEYS.recent);
  const filtered = list.filter(item => item.code !== entry.code);
  filtered.unshift(entry);
  writePresetStorage(STORAGE_KEYS.recent, filtered.slice(0, 10));
}

function addSavedPreset(entry) {
  const list = readPresetStorage(STORAGE_KEYS.saved);
  const filtered = list.filter(item => item.name !== entry.name);
  filtered.unshift(entry);
  writePresetStorage(STORAGE_KEYS.saved, filtered.slice(0, 20));
}

function buildField({ label, type, value, onChange, placeholder, helper, focusKey, commitDelay = 250 }) {
  const wrapper = document.createElement('label');
  wrapper.className = 'flow-field';
  const title = document.createElement('span');
  title.className = 'flow-field-label';
  title.textContent = label;
  const input = document.createElement('input');
  input.className = 'flow-field-input';
  input.type = type === 'number' ? 'number' : 'text';
  input.value = value ?? '';
  if (placeholder) {
    input.placeholder = placeholder;
  }
  const keyBase = focusKey || label;
  if (keyBase) {
    const scopedKey = currentFocusScope ? `${currentFocusScope}:${keyBase}` : keyBase;
    input.dataset.focusKey = scopedKey;
  }
  const commit = debounce((nextValue) => {
    onChange(nextValue);
  }, commitDelay);
  input.addEventListener('input', () => {
    const nextValue = type === 'number'
      ? Number(input.value)
      : input.value;
    commit(nextValue);
  });
  input.addEventListener('blur', () => {
    if (typeof commit.flush === 'function') {
      commit.flush();
    }
  });
  wrapper.appendChild(title);
  wrapper.appendChild(input);
  if (helper) {
    const help = document.createElement('span');
    help.className = 'flow-field-help';
    help.textContent = helper;
    wrapper.appendChild(help);
  }
  return wrapper;
}

function buildToggle({ label, checked, onChange }) {
  const wrapper = document.createElement('label');
  wrapper.className = 'flow-toggle';
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = Boolean(checked);
  input.addEventListener('change', () => onChange(input.checked));
  const text = document.createElement('span');
  text.textContent = label;
  wrapper.appendChild(input);
  wrapper.appendChild(text);
  return wrapper;
}

function buildSelect({ label, value, options, onChange, focusKey }) {
  const wrapper = document.createElement('label');
  wrapper.className = 'flow-field';
  const title = document.createElement('span');
  title.className = 'flow-field-label';
  title.textContent = label;
  const select = document.createElement('select');
  select.className = 'flow-field-input';
  const keyBase = focusKey || label;
  if (keyBase) {
    const scopedKey = currentFocusScope ? `${currentFocusScope}:${keyBase}` : keyBase;
    select.dataset.focusKey = scopedKey;
  }
  options.forEach((option) => {
    const opt = document.createElement('option');
    opt.value = option.value;
    opt.textContent = option.label ?? option.value;
    if (option.value === value) {
      opt.selected = true;
    }
    select.appendChild(opt);
  });
  select.addEventListener('change', () => {
    onChange(select.value);
  });
  wrapper.appendChild(title);
  wrapper.appendChild(select);
  return wrapper;
}

function buildTextarea({ label, value, onChange, placeholder, helper, focusKey, commitDelay = 250 }) {
  const wrapper = document.createElement('label');
  wrapper.className = 'flow-field';
  const title = document.createElement('span');
  title.className = 'flow-field-label';
  title.textContent = label;
  const input = document.createElement('textarea');
  input.className = 'flow-field-input flow-field-textarea';
  input.value = value ?? '';
  if (placeholder) {
    input.placeholder = placeholder;
  }
  const keyBase = focusKey || label;
  if (keyBase) {
    const scopedKey = currentFocusScope ? `${currentFocusScope}:${keyBase}` : keyBase;
    input.dataset.focusKey = scopedKey;
  }
  const commit = debounce(onChange, commitDelay);
  input.addEventListener('input', () => {
    commit(input.value);
  });
  input.addEventListener('blur', () => {
    if (typeof commit.flush === 'function') {
      commit.flush();
    }
  });
  wrapper.appendChild(title);
  wrapper.appendChild(input);
  if (helper) {
    const help = document.createElement('span');
    help.className = 'flow-field-help';
    help.textContent = helper;
    wrapper.appendChild(help);
  }
  return wrapper;
}

function buildCheckbox({ label, checked, onChange }) {
  const wrapper = document.createElement('label');
  wrapper.className = 'flow-field flow-field-row';
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = Boolean(checked);
  input.addEventListener('change', () => {
    onChange(input.checked);
  });
  const title = document.createElement('span');
  title.className = 'flow-field-label';
  title.textContent = label;
  wrapper.appendChild(input);
  wrapper.appendChild(title);
  return wrapper;
}

export function createFlowInspector({ store } = {}) {
  const panel = document.createElement('section');
  panel.className = 'flow-panel flow-inspector';

  const header = document.createElement('div');
  header.className = 'flow-panel-header';
  header.textContent = 'Inspector';
  panel.appendChild(header);

  const content = document.createElement('div');
  content.className = 'flow-inspector-content';
  panel.appendChild(content);

  const captureFocusState = () => {
    const active = document.activeElement;
    if (!active || !content.contains(active)) {
      return null;
    }
    const key = active.dataset?.focusKey || null;
    const selectionStart = typeof active.selectionStart === 'number' ? active.selectionStart : null;
    const selectionEnd = typeof active.selectionEnd === 'number' ? active.selectionEnd : null;
    return { key, selectionStart, selectionEnd };
  };

  const restoreFocusState = (state) => {
    if (!state || !state.key) {
      return;
    }
    const targets = Array.from(content.querySelectorAll('[data-focus-key]'));
    const match = targets.find(el => el.dataset.focusKey === state.key);
    if (!match) {
      return;
    }
    match.focus({ preventScroll: true });
    if (typeof match.setSelectionRange === 'function' && state.selectionStart !== null && state.selectionEnd !== null) {
      const length = typeof match.value === 'string' ? match.value.length : 0;
      const start = Math.min(state.selectionStart, length);
      const end = Math.min(state.selectionEnd, length);
      try {
        match.setSelectionRange(start, end);
      } catch (error) {
        // ignore selection errors
      }
    }
  };

  const renderEmpty = () => {
    currentFocusScope = 'empty';
    content.innerHTML = '';
    const empty = document.createElement('div');
    empty.className = 'flow-inspector-empty';
    empty.textContent = 'Select a node or edge to inspect its properties.';
    content.appendChild(empty);

    const templates = document.createElement('div');
    templates.className = 'flow-inspector-templates';
    const title = document.createElement('div');
    title.className = 'flow-inspector-title';
    title.textContent = 'Templates';
    templates.appendChild(title);

    const templateButton = document.createElement('button');
    templateButton.type = 'button';
    templateButton.className = 'flow-branch-add';
    templateButton.textContent = 'Insert Moonlight Treble (Bars 1–16)';
    templateButton.addEventListener('click', () => {
      insertMoonlightTrebleTemplate(store);
    });
    templates.appendChild(templateButton);
    content.appendChild(templates);
  };

  const renderSwitchEditor = (node, state) => {
    const params = node.params || {};
    const branches = Array.isArray(params.branches) ? params.branches : [];
    const defaultBranch = params.defaultBranch || 'default';
    const updateParams = (next) => {
      store.updateNode(node.id, {
        params: {
          ...params,
          ...next,
        },
      });
    };

    const form = document.createElement('div');
    form.className = 'flow-inspector-form';
    form.appendChild(buildField({
      label: 'label',
      type: 'string',
      value: params.label,
      onChange: value => updateParams({ label: value }),
    }));
    form.appendChild(buildSelect({
      label: 'mode',
      value: params.mode || 'first',
      options: [
        { value: 'first', label: 'First match' },
        { value: 'all', label: 'All matches' },
      ],
      onChange: value => updateParams({ mode: value }),
    }));
    form.appendChild(buildField({
      label: 'manualSelection',
      type: 'string',
      value: params.manualSelection || '',
      onChange: value => updateParams({ manualSelection: value }),
    }));
    const branchOptions = [
      { value: 'default', label: 'Default' },
      ...branches.map(branch => ({
        value: branch.id,
        label: branch.label || branch.id,
      })),
    ];
    form.appendChild(buildSelect({
      label: 'defaultBranch',
      value: defaultBranch,
      options: branchOptions,
      onChange: value => updateParams({ defaultBranch: value }),
    }));

    const table = document.createElement('div');
    table.className = 'flow-branch-table';
    branches.forEach((branch, index) => {
      const row = document.createElement('div');
      row.className = 'flow-branch-row';
      const focusKeyFor = suffix => `${node.id}-branch-${branch.id || index}-${suffix}`;
      const rowHeader = document.createElement('div');
      rowHeader.className = 'flow-branch-header';
      rowHeader.textContent = branch.id;
      row.appendChild(rowHeader);

      const labelField = buildField({
        label: 'label',
        type: 'string',
        value: branch.label || '',
        focusKey: focusKeyFor('label'),
        onChange: (value) => {
          const nextBranches = branches.map((item, idx) => (
            idx === index ? { ...item, label: value } : item
          ));
          updateParams({ branches: nextBranches });
        },
      });
      row.appendChild(labelField);

      const condition = branch.condition || { type: 'always', value: true };
      row.appendChild(buildSelect({
        label: 'condition',
        value: condition.type || 'always',
        options: [
          { value: 'always', label: 'Always' },
          { value: 'counter', label: 'Counter' },
          { value: 'barIndex', label: 'Bar Index' },
          { value: 'manual', label: 'Manual' },
          { value: 'random', label: 'Random' },
        ],
        onChange: (value) => {
          const nextBranches = branches.map((item, idx) => (
            idx === index
              ? { ...item, condition: { type: value, value: condition.value ?? 0 } }
              : item
          ));
          updateParams({ branches: nextBranches });
        },
      }));

      if (condition.type === 'counter') {
        row.appendChild(buildField({
          label: 'counterId',
          type: 'string',
          value: condition.counterId || '',
          focusKey: focusKeyFor('counterId'),
          onChange: (value) => {
            const nextBranches = branches.map((item, idx) => (
              idx === index
                ? { ...item, condition: { ...condition, counterId: value } }
                : item
            ));
            updateParams({ branches: nextBranches });
          },
        }));
        row.appendChild(buildSelect({
          label: 'operator',
          value: condition.op || '>=',
          options: ['==', '!=', '>=', '<=', '>', '<'].map(op => ({ value: op, label: op })),
          onChange: (value) => {
            const nextBranches = branches.map((item, idx) => (
              idx === index
                ? { ...item, condition: { ...condition, op: value } }
                : item
            ));
            updateParams({ branches: nextBranches });
          },
        }));
        row.appendChild(buildField({
          label: 'value',
          type: 'number',
          value: condition.value ?? 0,
          focusKey: focusKeyFor('counter-value'),
          onChange: (value) => {
            const nextBranches = branches.map((item, idx) => (
              idx === index
                ? { ...item, condition: { ...condition, value } }
                : item
            ));
            updateParams({ branches: nextBranches });
          },
        }));
      } else if (condition.type === 'barIndex') {
        row.appendChild(buildSelect({
          label: 'operator',
          value: condition.op || '>=',
          options: ['==', '!=', '>=', '<=', '>', '<'].map(op => ({ value: op, label: op })),
          onChange: (value) => {
            const nextBranches = branches.map((item, idx) => (
              idx === index
                ? { ...item, condition: { ...condition, op: value } }
                : item
            ));
            updateParams({ branches: nextBranches });
          },
        }));
        row.appendChild(buildField({
          label: 'value',
          type: 'number',
          value: condition.value ?? 0,
          focusKey: focusKeyFor('bar-index'),
          onChange: (value) => {
            const nextBranches = branches.map((item, idx) => (
              idx === index
                ? { ...item, condition: { ...condition, value } }
                : item
            ));
            updateParams({ branches: nextBranches });
          },
        }));
      } else if (condition.type === 'manual') {
        row.appendChild(buildField({
          label: 'value',
          type: 'string',
          value: condition.value || '',
          focusKey: focusKeyFor('manual-value'),
          onChange: (value) => {
            const nextBranches = branches.map((item, idx) => (
              idx === index
                ? { ...item, condition: { ...condition, value } }
                : item
            ));
            updateParams({ branches: nextBranches });
          },
        }));
      } else if (condition.type === 'random') {
        row.appendChild(buildField({
          label: 'threshold',
          type: 'number',
          value: condition.threshold ?? 0.5,
          focusKey: focusKeyFor('threshold'),
          onChange: (value) => {
            const nextBranches = branches.map((item, idx) => (
              idx === index
                ? { ...item, condition: { ...condition, threshold: value } }
                : item
            ));
            updateParams({ branches: nextBranches });
          },
        }));
      } else if (condition.type === 'always') {
        row.appendChild(buildCheckbox({
          label: 'value',
          checked: condition.value !== false,
          onChange: (checked) => {
            const nextBranches = branches.map((item, idx) => (
              idx === index
                ? { ...item, condition: { ...condition, value: checked } }
                : item
            ));
            updateParams({ branches: nextBranches });
          },
        }));
      }

      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.className = 'flow-branch-remove';
      removeButton.textContent = 'Remove';
      removeButton.addEventListener('click', () => {
        const nextBranches = branches.filter((_, idx) => idx !== index);
        const nextDefault = nextBranches.some(b => b.id === defaultBranch) ? defaultBranch : 'default';
        updateParams({ branches: nextBranches, defaultBranch: nextDefault });
      });
      row.appendChild(removeButton);

      table.appendChild(row);
    });

    const addButton = document.createElement('button');
    addButton.type = 'button';
    addButton.className = 'flow-branch-add';
    addButton.textContent = 'Add branch';
    addButton.addEventListener('click', () => {
      const index = branches.length + 1;
      const nextBranch = {
        id: `branch-${index}`,
        label: `Branch ${index}`,
        condition: { type: 'always', value: true },
      };
      updateParams({ branches: [...branches, nextBranch] });
    });

    const layout = document.createElement('div');
    layout.className = 'flow-inspector-stack';
    layout.appendChild(form);
    layout.appendChild(table);
    layout.appendChild(addButton);
    return layout;
  };

  const renderCounterEditor = (node) => {
    const params = node.params || {};
    const updateParams = (next) => {
      store.updateNode(node.id, {
        params: {
          ...params,
          ...next,
        },
      });
    };
    const form = document.createElement('div');
    form.className = 'flow-inspector-form';
    form.appendChild(buildField({
      label: 'label',
      type: 'string',
      value: params.label,
      onChange: value => updateParams({ label: value }),
    }));
    form.appendChild(buildField({
      label: 'start',
      type: 'number',
      value: params.start ?? 0,
      onChange: value => updateParams({ start: value }),
    }));
    form.appendChild(buildField({
      label: 'step',
      type: 'number',
      value: params.step ?? 1,
      onChange: value => updateParams({ step: value }),
    }));
    form.appendChild(buildCheckbox({
      label: 'reset on play',
      checked: params.resetOnPlay !== false,
      onChange: checked => updateParams({ resetOnPlay: checked }),
    }));
    return form;
  };

  const renderJoinEditor = (node, state) => {
    const params = node.params || {};
    const updateParams = (next) => {
      store.updateNode(node.id, {
        params: {
          ...params,
          ...next,
        },
      });
    };
    const incoming = (state.edges || []).filter(edge => edge.to?.nodeId === node.id);
    const form = document.createElement('div');
    form.className = 'flow-inspector-form';
    form.appendChild(buildField({
      label: 'label',
      type: 'string',
      value: params.label,
      onChange: value => updateParams({ label: value }),
    }));
    form.appendChild(buildSelect({
      label: 'quantize',
      value: params.quantize || 'next-bar',
      options: [
        { value: 'next-bar', label: 'Next bar' },
        { value: 'immediate', label: 'Immediate' },
      ],
      onChange: value => updateParams({ quantize: value }),
    }));
    const summary = document.createElement('div');
    summary.className = 'flow-inspector-meta';
    summary.textContent = `Incoming connections: ${incoming.length}`;
    form.appendChild(summary);
    return form;
  };

  const renderThoughtEditor = (node) => {
    const params = node.params || {};
    const canon = normalizeMusicThoughtParams(params);
    const isLegacyOnly = !params.style && !params.harmony && !params.pattern && !params.feel && !params.voice;
    const updateParams = (next) => {
      store.updateNode(node.id, {
        params: {
          ...params,
          ...next,
        },
      });
    };
    const updateParamsNormalized = (next) => {
      const merged = { ...params, ...next };
      const normalized = normalizeMusicThoughtParams(merged);
      console.log('Normalized pattern params', {
        patternGeneratedId: normalized.pattern?.generated?.id,
        notePatternId: normalized.notePatternId,
        patternType: normalized.patternType,
      });
      store.updateNode(node.id, {
        params: {
          ...params,
          ...normalized,
        },
      });
    };
    const beginnerState = { ...BEGINNER_DEFAULTS, ...(params.beginner || {}) };
    const advancedState = mergeAdvancedState(params.advanced, {});
    let presetCodeValue = params.presetCode || '';
    if (!presetCodeValue || !String(presetCodeValue).startsWith('MIND|')) {
      const generated = buildPresetCodeFromBeginner(beginnerState, { advanced: advancedState });
      if (presetCodeValue !== generated) {
        const compiled = compilePresetCode(generated);
        updateParams({
          presetCode: generated,
          compiledPresetCode: compiled.ok ? compiled.presetCode : '',
          compiledArtifact: compiled.ok ? compiled.compiledArtifact : null,
          advanced: advancedState,
          beginner: beginnerState,
        });
      }
      presetCodeValue = generated;
    } else {
      const migrated = parsePresetCode(presetCodeValue);
      if (migrated.ok && migrated.normalized !== presetCodeValue) {
        updateParams({
          presetCode: migrated.normalized,
          beginner: migrated.beginner,
          advanced: mergeAdvancedState(migrated.advanced, {}),
        });
        presetCodeValue = migrated.normalized;
      }
    }
    const parsedPresetCode = parsePresetCode(presetCodeValue);
    const presetCodeError = parsedPresetCode?.error || null;
    const compiledPresetCode = params.compiledPresetCode || '';
    const isDirtyPreset = presetCodeValue !== compiledPresetCode;
    const compiledParsed = compiledPresetCode ? parsePresetCode(compiledPresetCode) : null;
    const rebuildChanges = (() => {
      if (!compiledParsed?.ok) return [];
      const fields = [
        ['role', 'Role'],
        ['voice', 'Voice'],
        ['style', 'Style'],
        ['inst', 'Instrument'],
        ['pat', 'Pattern'],
        ['mood', 'Mood'],
        ['energy', 'Energy'],
        ['complexity', 'Complexity'],
        ['variation', 'Variation'],
        ['len', 'Length'],
        ['reg', 'Register'],
      ];
      return fields
        .filter(([key]) => compiledParsed.beginner?.[key] !== beginnerState[key])
        .map(([, label]) => label);
    })();
    const rebuildSummary = rebuildChanges.length
      ? `Updated: ${rebuildChanges.slice(0, 3).join(' + ')}`
      : 'Up to date.';
    const rebuildNotice = rebuildNoticeByNode.get(node.id) || '';
    if (rebuildNotice) {
      rebuildNoticeByNode.delete(node.id);
    }
    const coerceSeed = (value, fallback = 1) => (
      Number.isFinite(value) ? Number(value) : fallback
    );
    const buildStyleSignature = ({ styleId, moodId, styleSeed }) => `${styleId}|${moodId}|${styleSeed}`;
    const getDropdownView = (key) => (canon.dropdownViewPrefs?.[key] || 'recommended');
    const updateDropdownPrefs = (key, value) => {
      const nextPrefs = { ...(canon.dropdownViewPrefs || {}) };
      nextPrefs[key] = value;
      updateParamsNormalized({ dropdownViewPrefs: nextPrefs });
    };
    const ensureOptionPresence = (options, currentValue, labelResolver) => {
      if (!currentValue) return options;
      if (options.some(option => option.value === currentValue)) {
        return options;
      }
      const label = labelResolver ? labelResolver(currentValue) : currentValue;
      return [...options, { value: currentValue, label }];
    };
    const computeStyleContext = () => buildStyleOptionSets({
      styleId: canon.style?.id || (STYLE_CATALOG[0]?.id || 'classical_film'),
      moodId: canon.style?.mood?.id || 'none',
      moodMode: canon.style?.mood?.mode || 'override',
      styleSeed: coerceSeed(canon.style?.seed, 1),
      nodeId: node.id,
    });
    const styleContext = computeStyleContext();

    const applyStyleResolution = ({ nextSeed, nextStyleId, nextMoodId, forceHarmony = false } = {}) => {
      const seedToUse = coerceSeed(nextSeed ?? canon.style?.seed, 1);
      const styleId = nextStyleId || canon.style?.id || (STYLE_CATALOG[0]?.id || 'classical_film');
      const moodId = nextMoodId || canon.style?.mood?.id || 'none';
      const moodMode = canon.style?.mood?.mode || 'override';
      const resolved = resolveThoughtStyle({
        styleId,
        styleSeed: seedToUse,
        nodeId: node.id,
        moodMode,
        moodId,
      });
      const resolvedPresetId = resolved.progressionPresetId ?? canon.progressionPresetId;
      const resolvedVariantId = resolved.progressionVariantId ?? canon.progressionVariantId;
      const resolvedLength = resolved.progressionLength ?? canon.progressionLength;
      const shouldUseCustomHarmony = forceHarmony || canon.harmonyMode !== 'progression_preset';
      const nextMoodIdValue = resolved.moodId || moodId;
      const nextSignature = buildStyleSignature({
        styleId,
        moodId: nextMoodIdValue,
        styleSeed: seedToUse,
      });

      const nextHarmony = {
        ...canon.harmony,
        mode: shouldUseCustomHarmony ? 'custom' : 'preset',
        preset: {
          ...canon.harmony.preset,
          id: resolvedPresetId ?? canon.harmony.preset.id,
          variantId: resolvedVariantId ?? canon.harmony.preset.variantId,
          chordsPerBar: resolved.chordsPerBar ?? canon.harmony.preset.chordsPerBar,
          fill: resolved.fillBehavior ?? canon.harmony.preset.fill,
          length: resolvedLength ?? canon.harmony.preset.length,
        },
        custom: {
          ...canon.harmony.custom,
          roman: resolved.progressionCustom ?? canon.harmony.custom.roman ?? '',
          variantStyle: resolved.progressionCustomVariantStyle
            ?? resolvedVariantId
            ?? canon.harmony.custom.variantStyle
            ?? 'triads',
          chordsPerBar: resolved.chordsPerBar ?? canon.harmony.custom.chordsPerBar,
          fill: resolved.fillBehavior ?? canon.harmony.custom.fill,
          length: resolvedLength ?? canon.harmony.custom.length,
        },
      };

      const nextPattern = {
        ...canon.pattern,
        mode: 'generated',
        generated: {
          ...canon.pattern.generated,
          id: resolved.notePatternId ?? canon.pattern.generated.id,
        },
      };

      const nextFeel = {
        ...canon.feel,
        manual: {
          ...canon.feel.manual,
          grid: resolved.rhythmGrid ?? canon.feel.manual.grid,
          syncopation: resolved.syncopation ?? canon.feel.manual.syncopation,
          warp: resolved.timingWarp ?? canon.feel.manual.warp,
          intensity: resolved.timingIntensity ?? canon.feel.manual.intensity,
        },
      };

      const nextVoice = {
        ...canon.voice,
        preset: resolved.instrumentPreset ?? canon.voice.preset,
        register: {
          min: resolved.registerMin ?? canon.voice.register.min,
          max: resolved.registerMax ?? canon.voice.register.max,
        },
      };

      updateParamsNormalized({
        styleResolvedSignature: nextSignature,
        style: {
          ...canon.style,
          id: styleId,
          seed: seedToUse,
          mood: { ...canon.style.mood, mode: moodMode, id: nextMoodIdValue },
        },
        harmony: nextHarmony,
        pattern: nextPattern,
        feel: nextFeel,
        voice: nextVoice,
      });
    };

    const rerollSeed = () => {
      const nextSeed = coerceSeed(canon.style?.seed, 1) + 1;
      applyStyleResolution({ nextSeed, forceHarmony: true });
    };

    const copySeed = async () => {
      const seedValue = canon.style?.seed ?? '';
      if (navigator?.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(String(seedValue));
        } catch (error) {
          // ignore copy errors silently
        }
      }
    };

    const pasteSeed = async () => {
      let text = '';
      if (navigator?.clipboard?.readText) {
        try {
          text = await navigator.clipboard.readText();
        } catch (error) {
          text = '';
        }
      }
      const parsed = Number.parseInt(text, 10);
      if (Number.isFinite(parsed)) {
        applyStyleResolution({ nextSeed: parsed, forceHarmony: true });
      }
    };

    const buildSection = (title, body, { collapsible = false, defaultOpen = true } = {}) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'flow-section';
      if (collapsible) {
        const details = document.createElement('details');
        details.open = defaultOpen;
        const summary = document.createElement('summary');
        summary.className = 'flow-section-title';
        summary.textContent = title;
        details.appendChild(summary);
        details.appendChild(body);
        wrapper.appendChild(details);
        return wrapper;
      }
      const header = document.createElement('div');
      header.className = 'flow-section-title';
      header.textContent = title;
      wrapper.appendChild(header);
      wrapper.appendChild(body);
      return wrapper;
    };

    const inspectorViewMode = canon.dropdownViewPrefs?.inspectorView || 'beginner';

    const renderViewModeSection = () => {
      const body = document.createElement('div');
      body.className = 'flow-section-body';
      body.appendChild(buildSelect({
        label: 'View',
        value: inspectorViewMode,
        options: [
          { value: 'beginner', label: 'Beginner' },
          { value: 'simple', label: 'Simple' },
          { value: 'advanced', label: 'Advanced' },
          { value: 'expert', label: 'Expert' },
        ],
        onChange: value => updateDropdownPrefs('inspectorView', value),
      }));
      return buildSection('Inspector Mode', body);
    };

    const updateBeginnerState = (next) => {
      let merged = { ...beginnerState, ...next };
      const roleChanged = Object.prototype.hasOwnProperty.call(next, 'role')
        && next.role !== beginnerState.role;
      const voiceChanged = Object.prototype.hasOwnProperty.call(next, 'voice')
        && next.voice !== beginnerState.voice;
      const styleChanged = Object.prototype.hasOwnProperty.call(next, 'style')
        && next.style !== beginnerState.style;
      const patChanged = Object.prototype.hasOwnProperty.call(next, 'pat')
        && next.pat !== beginnerState.pat;

      if (roleChanged) {
        const defaults = ROLE_DEFAULTS[merged.role] || {};
        Object.entries(defaults).forEach(([key, value]) => {
          if (!Object.prototype.hasOwnProperty.call(next, key)) {
            merged[key] = value;
          }
        });
        const roleVoiceDefaults = ROLE_VOICE_DEFAULTS[merged.role]?.[merged.voice] || {};
        Object.entries(roleVoiceDefaults).forEach(([key, value]) => {
          if (!Object.prototype.hasOwnProperty.call(next, key)) {
            merged[key] = value;
          }
        });
      }

      if (voiceChanged) {
        const roleVoiceDefaults = ROLE_VOICE_DEFAULTS[merged.role]?.[merged.voice] || {};
        Object.entries(roleVoiceDefaults).forEach(([key, value]) => {
          if (!Object.prototype.hasOwnProperty.call(next, key)) {
            merged[key] = value;
          }
        });
        if (!Object.prototype.hasOwnProperty.call(next, 'inst')) {
          merged.inst = getDefaultInstrumentForVoice(merged.voice);
        }
        if (!Object.prototype.hasOwnProperty.call(next, 'pat')) {
          merged.pat = getDefaultPatternForVoice(merged.voice, merged.role);
        }
      }

      if (styleChanged && merged.voice === 'bass') {
        const styleOptions = getPatternOptions(merged.voice, merged.style);
        if (!styleOptions.some(option => option.value === merged.pat)) {
          merged.pat = getDefaultPatternForVoice(merged.voice, merged.role);
        }
      }

      const instrumentOptions = getInstrumentOptions(merged.voice, presetCache || []);
      if (!instrumentOptions.some(option => option.value === merged.inst)) {
        merged.inst = getDefaultInstrumentForVoice(merged.voice);
      }

      const patternOptions = getPatternOptions(merged.voice, merged.style);
      if (!patternOptions.some(option => option.value === merged.pat)) {
        merged.pat = getDefaultPatternForVoice(merged.voice, merged.role);
      }

      if (patChanged || merged.pat !== beginnerState.pat) {
        console.log('Beginner pattern changed', { value: merged.pat, nodeId: node?.id });
      }

      updateParams({
        beginner: merged,
        presetCode: buildPresetCodeFromBeginner(merged, { advanced: advancedState }),
      });
    };

    const updateAdvancedState = (nextSection) => {
      const mergedAdvanced = mergeAdvancedState(advancedState, nextSection);
      updateParams({
        advanced: mergedAdvanced,
        presetCode: buildPresetCodeFromBeginner(beginnerState, { advanced: mergedAdvanced }),
      });
    };

    const buildPresetCodeHeader = () => {
      const wrapper = document.createElement('div');
      wrapper.className = 'flow-preset-header';

      const field = document.createElement('div');
      field.className = 'flow-preset-field';

      const label = document.createElement('div');
      label.className = 'flow-field-label';
      label.textContent = 'Preset Code';
      field.appendChild(label);

      const inputRow = document.createElement('div');
      inputRow.className = 'flow-preset-input-row';

      const input = document.createElement('input');
      input.className = 'flow-field-input flow-preset-input';
      input.type = 'text';
      input.value = presetCodeValue;
      input.placeholder = 'MIND|PS1|GV1|...';
      input.dataset.focusKey = currentFocusScope ? `${currentFocusScope}:presetCode` : 'presetCode';
      input.addEventListener('input', () => {
        updateParams({ presetCode: input.value });
      });
      const applyPresetCode = () => {
        const parsed = parsePresetCode(input.value);
        if (!parsed.ok) {
          return;
        }
        updateParams({
          presetCode: parsed.normalized,
          beginner: parsed.beginner,
          advanced: mergeAdvancedState(parsed.advanced, {}),
        });
      };
      input.addEventListener('blur', applyPresetCode);
      input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          applyPresetCode();
        }
      });
      inputRow.appendChild(input);

      const actions = document.createElement('div');
      actions.className = 'flow-preset-actions';

      const rerollButton = document.createElement('button');
      rerollButton.type = 'button';
      rerollButton.className = 'flow-secondary';
      rerollButton.textContent = 'Reroll';
      rerollButton.addEventListener('click', () => {
        const nextReroll = (Number(beginnerState.reroll) || 0) + 1;
        const nextBeginner = { ...beginnerState, reroll: nextReroll };
        updateParams({
          beginner: nextBeginner,
          presetCode: buildPresetCodeFromBeginner(nextBeginner, { advanced: advancedState }),
        });
      });

      const copyButton = document.createElement('button');
      copyButton.type = 'button';
      copyButton.className = 'flow-secondary';
      copyButton.textContent = 'Copy';
      copyButton.addEventListener('click', async () => {
        if (navigator?.clipboard?.writeText) {
          try {
            await navigator.clipboard.writeText(input.value);
          } catch (error) {
            // ignore clipboard errors
          }
        }
      });

      const pasteButton = document.createElement('button');
      pasteButton.type = 'button';
      pasteButton.className = 'flow-secondary';
      pasteButton.textContent = 'Paste';
      pasteButton.addEventListener('click', async () => {
        if (navigator?.clipboard?.readText) {
          try {
            const text = await navigator.clipboard.readText();
            if (typeof text === 'string') {
              updateParams({ presetCode: text.trim() });
              input.value = text.trim();
              applyPresetCode();
            }
          } catch (error) {
            // ignore clipboard errors
          }
        }
      });

      actions.appendChild(copyButton);
      actions.appendChild(pasteButton);
      actions.appendChild(rerollButton);
      inputRow.appendChild(actions);
      field.appendChild(inputRow);

      if (presetCodeError) {
        const error = document.createElement('div');
        error.className = 'flow-field-error';
        error.textContent = presetCodeError;
        field.appendChild(error);
      }

      wrapper.appendChild(field);

      const status = document.createElement('div');
      status.className = `flow-preset-status ${isDirtyPreset ? 'flow-preset-status-dirty' : ''}`;
      status.textContent = isDirtyPreset ? '⚠️ Needs rebuild' : '✅ Up to date';
      const statusNote = document.createElement('div');
      statusNote.className = 'flow-preset-status-note';
      statusNote.textContent = rebuildNotice || rebuildSummary;
      wrapper.appendChild(status);
      wrapper.appendChild(statusNote);

      const rebuildButton = document.createElement('button');
      rebuildButton.type = 'button';
      rebuildButton.className = 'flow-primary';
      rebuildButton.textContent = 'Rebuild';
      rebuildButton.addEventListener('click', () => {
        const compiled = compilePresetCode(input.value);
        if (!compiled.ok) {
          return;
        }
        const summary = rebuildChanges.length
          ? `Updated: ${rebuildChanges.slice(0, 3).join(' + ')}`
          : 'Updated.';
        rebuildNoticeByNode.set(node.id, summary);
        updateParams({
          presetCode: compiled.presetCode,
          compiledPresetCode: compiled.presetCode,
          compiledArtifact: compiled.compiledArtifact,
          beginner: compiled.beginner,
          advanced: mergeAdvancedState(compiled.advanced, {}),
        });
        input.value = compiled.presetCode;
      });
      wrapper.appendChild(rebuildButton);

      return wrapper;
    };

    const renderBeginnerPanel = () => {
      const instrumentOptions = getInstrumentOptions(beginnerState.voice, presetCache || []);
      const patternOptions = getPatternOptions(beginnerState.voice, beginnerState.style);
      const body = document.createElement('div');
      body.className = 'flow-section-body';

      body.appendChild(buildSection('Identity', (() => {
        const section = document.createElement('div');
        section.className = 'flow-section-body';
        section.appendChild(buildSelect({
          label: 'Role',
          value: beginnerState.role,
          options: BEGINNER_OPTIONS.role,
          onChange: value => updateBeginnerState({ role: value }),
        }));
        section.appendChild(buildSelect({
          label: 'Voice Type',
          value: beginnerState.voice,
          options: BEGINNER_OPTIONS.voice,
          onChange: value => updateBeginnerState({ voice: value }),
        }));
        return section;
      })()));

      body.appendChild(buildSection('Sound', (() => {
        const section = document.createElement('div');
        section.className = 'flow-section-body';
        section.appendChild(buildSelect({
          label: 'Style',
          value: beginnerState.style,
          options: BEGINNER_OPTIONS.style,
          onChange: value => updateBeginnerState({ style: value }),
        }));
        section.appendChild(buildSelect({
          label: 'Instrument',
          value: beginnerState.inst,
          options: instrumentOptions,
          onChange: value => updateBeginnerState({ inst: value }),
        }));
        return section;
      })()));

      body.appendChild(buildSection('Motion', (() => {
        const section = document.createElement('div');
        section.className = 'flow-section-body';
        section.appendChild(buildSelect({
          label: 'Pattern',
          value: beginnerState.pat,
          options: patternOptions,
          onChange: value => updateBeginnerState({ pat: value }),
        }));
        return section;
      })()));

      body.appendChild(buildSection('Feel', (() => {
        const section = document.createElement('div');
        section.className = 'flow-section-body';
        section.appendChild(buildSelect({
          label: 'Mood',
          value: beginnerState.mood,
          options: BEGINNER_OPTIONS.mood,
          onChange: value => updateBeginnerState({ mood: value }),
        }));
        section.appendChild(buildSelect({
          label: 'Energy',
          value: beginnerState.energy,
          options: BEGINNER_OPTIONS.energy,
          onChange: value => updateBeginnerState({ energy: value }),
        }));
        section.appendChild(buildSelect({
          label: 'Complexity',
          value: beginnerState.complexity,
          options: BEGINNER_OPTIONS.complexity,
          onChange: value => updateBeginnerState({ complexity: value }),
        }));
        section.appendChild(buildSelect({
          label: 'Variation',
          value: beginnerState.variation,
          options: BEGINNER_OPTIONS.variation,
          onChange: value => updateBeginnerState({ variation: value }),
        }));
        return section;
      })()));

      body.appendChild(buildSection('Size', (() => {
        const section = document.createElement('div');
        section.className = 'flow-section-body';
        section.appendChild(buildSelect({
          label: 'Length',
          value: beginnerState.len,
          options: BEGINNER_OPTIONS.len,
          onChange: value => updateBeginnerState({ len: value }),
        }));
        section.appendChild(buildSelect({
          label: 'Register',
          value: beginnerState.reg,
          options: BEGINNER_OPTIONS.reg,
          onChange: value => updateBeginnerState({ reg: value }),
        }));
        return section;
      })()));

      const explainer = document.createElement('div');
      explainer.className = 'flow-section-body';
      const roleLabel = BEGINNER_OPTIONS.role.find(option => option.value === beginnerState.role)?.label || beginnerState.role;
      const voiceLabel = BEGINNER_OPTIONS.voice.find(option => option.value === beginnerState.voice)?.label || beginnerState.voice;
      const patternLabel = patternOptions.find(option => option.value === beginnerState.pat)?.label || beginnerState.pat;
      const energyLabel = BEGINNER_OPTIONS.energy.find(option => option.value === beginnerState.energy)?.label || beginnerState.energy;
      const complexityLabel = BEGINNER_OPTIONS.complexity.find(option => option.value === beginnerState.complexity)?.label || beginnerState.complexity;
      const lines = [
        `Role intention: ${roleLabel}`,
        `Voice behavior: ${voiceLabel}`,
        `Pattern family: ${patternLabel}`,
        `Energy/Complexity: ${energyLabel} · ${complexityLabel}`,
      ];
      lines.forEach((text) => {
        const line = document.createElement('div');
        line.className = 'flow-field-help';
        line.textContent = text;
        explainer.appendChild(line);
      });
      body.appendChild(buildSection('What you’re hearing', explainer));

      return buildSection('Beginner', body);
    };

    const applyPresetEntry = (entry) => {
      if (!entry?.code) return;
      const parsed = parsePresetCode(entry.code);
      if (!parsed.ok) return;
      updateParams({
        presetCode: parsed.normalized,
        beginner: parsed.beginner,
        advanced: mergeAdvancedState(parsed.advanced, {}),
      });
      addRecentPreset({
        name: entry.name || 'Preset',
        code: parsed.normalized,
      });
    };

    const renderPresetList = (title, presets, { allowSave = false } = {}) => {
      const body = document.createElement('div');
      body.className = 'flow-section-body';
      if (!presets.length) {
        const empty = document.createElement('div');
        empty.className = 'flow-field-help';
        empty.textContent = 'No presets available yet.';
        body.appendChild(empty);
        return buildSection(title, body, { collapsible: true, defaultOpen: false });
      }
      presets.forEach((preset) => {
        const row = document.createElement('div');
        row.className = 'flow-inline-actions';
        const name = document.createElement('div');
        name.className = 'flow-section-title';
        name.textContent = preset.name || preset.id || 'Preset';
        row.appendChild(name);
        if (preset.description) {
          const desc = document.createElement('div');
          desc.className = 'flow-field-help';
          desc.textContent = preset.description;
          row.appendChild(desc);
        }
        const actionRow = document.createElement('div');
        actionRow.className = 'flow-seed-actions';
        const applyButton = document.createElement('button');
        applyButton.type = 'button';
        applyButton.textContent = 'Apply';
        applyButton.addEventListener('click', () => applyPresetEntry(preset));
        actionRow.appendChild(applyButton);
        const copyButton = document.createElement('button');
        copyButton.type = 'button';
        copyButton.textContent = 'Copy Code';
        copyButton.addEventListener('click', async () => {
          if (navigator?.clipboard?.writeText) {
            try {
              await navigator.clipboard.writeText(preset.code || '');
            } catch (error) {
              // ignore copy errors
            }
          }
        });
        actionRow.appendChild(copyButton);
        if (allowSave) {
          const saveButton = document.createElement('button');
          saveButton.type = 'button';
          saveButton.textContent = 'Save';
          saveButton.addEventListener('click', () => {
            const nameValue = window.prompt('Save preset as:', preset.name || '');
            if (!nameValue) return;
            addSavedPreset({
              name: nameValue,
              code: preset.code,
            });
          });
          actionRow.appendChild(saveButton);
        }
        row.appendChild(actionRow);
        body.appendChild(row);
      });
      return buildSection(title, body, { collapsible: true, defaultOpen: false });
    };

    const renderPresetLibraryPanel = () => {
      const savedPresets = readPresetStorage(STORAGE_KEYS.saved);
      const recentPresets = readPresetStorage(STORAGE_KEYS.recent);
      const curated = PRESET_LIBRARY.map((preset) => ({
        ...preset,
      }));
      const sections = document.createElement('div');
      sections.className = 'flow-section-body';
      sections.appendChild(renderPresetList('Curated Presets', curated, { allowSave: true }));
      sections.appendChild(renderPresetList('Saved Presets', savedPresets));
      sections.appendChild(renderPresetList('Recent Presets', recentPresets));
      return buildSection('Preset Library', sections, { collapsible: true, defaultOpen: false });
    };

    const renderAdvancedControls = () => {
      const buildAdvancedSelect = (label, sectionKey, fieldKey, options) => (
        buildSelect({
          label,
          value: advancedState[sectionKey]?.[fieldKey] ?? 'auto',
          options,
          onChange: value => updateAdvancedState({
            [sectionKey]: {
              ...advancedState[sectionKey],
              [fieldKey]: value,
            },
          }),
        })
      );

      const autoIntensityOptions = [
        { value: 'auto', label: 'Auto' },
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
      ];
      const autoToggleOptions = [
        { value: 'auto', label: 'Auto' },
        { value: 'avoid', label: 'Avoid' },
        { value: 'allow', label: 'Allow' },
      ];
      const feelBiasOptions = [
        { value: 'auto', label: 'Auto' },
        { value: 'straight', label: 'Straight' },
        { value: 'swing', label: 'Swing' },
        { value: 'shuffle', label: 'Shuffle' },
      ];
      const polyOptions = [
        { value: 'auto', label: 'Auto' },
        { value: 'mono', label: 'Mono' },
        { value: 'poly', label: 'Poly' },
        { value: 'choke', label: 'Choke' },
      ];
      const variationStrategyOptions = [
        { value: 'auto', label: 'Auto' },
        { value: 'repeat', label: 'Repeat' },
        { value: 'mutate', label: 'Mutate' },
        { value: 'contrast', label: 'Contrast' },
      ];
      const seedModeOptions = [
        { value: 'auto', label: 'Auto' },
        { value: 'locked', label: 'Locked' },
        { value: 'reroll', label: 'Reroll' },
      ];

      const body = document.createElement('div');
      body.className = 'flow-section-body';

      const styleSection = document.createElement('div');
      styleSection.className = 'flow-section-body';
      styleSection.appendChild(buildAdvancedSelect('Subtype', 'style', 'subtype', [
        { value: 'auto', label: 'Auto' },
        { value: 'classic', label: 'Classic' },
        { value: 'modern', label: 'Modern' },
        { value: 'hybrid', label: 'Hybrid' },
      ]));
      styleSection.appendChild(buildAdvancedSelect('Era/Flavor', 'style', 'era', [
        { value: 'auto', label: 'Auto' },
        { value: 'vintage', label: 'Vintage' },
        { value: 'current', label: 'Current' },
        { value: 'future', label: 'Future' },
      ]));
      styleSection.appendChild(buildAdvancedSelect('Feel Bias', 'style', 'feelBias', feelBiasOptions));
      styleSection.appendChild(buildAdvancedSelect('Avoid Arps', 'style', 'avoidArps', autoToggleOptions));
      styleSection.appendChild(buildAdvancedSelect('Avoid Leaps', 'style', 'avoidLeaps', autoToggleOptions));
      styleSection.appendChild(buildAdvancedSelect('Avoid Busy', 'style', 'avoidBusy', autoToggleOptions));
      styleSection.appendChild(buildAdvancedSelect('Avoid Chromatic', 'style', 'avoidChromatic', autoToggleOptions));
      body.appendChild(buildSection('Style (Advanced)', styleSection));

      const voiceSection = document.createElement('div');
      voiceSection.className = 'flow-section-body';
      voiceSection.appendChild(buildAdvancedSelect('Articulation', 'voice', 'articulation', [
        { value: 'auto', label: 'Auto' },
        { value: 'legato', label: 'Legato' },
        { value: 'staccato', label: 'Staccato' },
        { value: 'accented', label: 'Accented' },
      ]));
      voiceSection.appendChild(buildAdvancedSelect('Tone', 'voice', 'tone', [
        { value: 'auto', label: 'Auto' },
        { value: 'soft', label: 'Soft' },
        { value: 'neutral', label: 'Neutral' },
        { value: 'bright', label: 'Bright' },
      ]));
      voiceSection.appendChild(buildAdvancedSelect('Humanization', 'voice', 'humanization', autoIntensityOptions));
      voiceSection.appendChild(buildAdvancedSelect('Poly Mode', 'voice', 'polyMode', polyOptions));
      voiceSection.appendChild(buildAdvancedSelect('Layering', 'voice', 'layering', [
        { value: 'auto', label: 'Auto' },
        { value: 'single', label: 'Single' },
        { value: 'double', label: 'Double' },
        { value: 'stack', label: 'Stack' },
      ]));
      body.appendChild(buildSection('Voice (Advanced)', voiceSection));

      const patternSection = document.createElement('div');
      patternSection.className = 'flow-section-body';
      patternSection.appendChild(buildAdvancedSelect('Rhythm Mask', 'pattern', 'rhythmMask', [
        { value: 'auto', label: 'Auto' },
        { value: 'straight', label: 'Straight' },
        { value: 'syncopated', label: 'Syncopated' },
        { value: 'sparse', label: 'Sparse' },
      ]));
      patternSection.appendChild(buildAdvancedSelect('Density', 'pattern', 'density', autoIntensityOptions));
      patternSection.appendChild(buildAdvancedSelect('Accents', 'pattern', 'accents', autoIntensityOptions));
      patternSection.appendChild(buildAdvancedSelect('Contour', 'pattern', 'contour', [
        { value: 'auto', label: 'Auto' },
        { value: 'flat', label: 'Flat' },
        { value: 'rising', label: 'Rising' },
        { value: 'falling', label: 'Falling' },
      ]));
      patternSection.appendChild(buildAdvancedSelect('Repetition', 'pattern', 'repetition', [
        { value: 'auto', label: 'Auto' },
        { value: 'looped', label: 'Looped' },
        { value: 'evolving', label: 'Evolving' },
        { value: 'staggered', label: 'Staggered' },
      ]));
      body.appendChild(buildSection('Pattern (Advanced)', patternSection));

      const moodSection = document.createElement('div');
      moodSection.className = 'flow-section-body';
      moodSection.appendChild(buildAdvancedSelect('Tension', 'mood', 'tension', autoIntensityOptions));
      moodSection.appendChild(buildAdvancedSelect('Brightness', 'mood', 'brightness', autoIntensityOptions));
      moodSection.appendChild(buildAdvancedSelect('Resolution', 'mood', 'resolution', [
        { value: 'auto', label: 'Auto' },
        { value: 'open', label: 'Open' },
        { value: 'resolved', label: 'Resolved' },
        { value: 'suspended', label: 'Suspended' },
      ]));
      body.appendChild(buildSection('Mood (Advanced)', moodSection));

      const energySection = document.createElement('div');
      energySection.className = 'flow-section-body';
      energySection.appendChild(buildAdvancedSelect('Dynamics', 'energy', 'dynamics', autoIntensityOptions));
      energySection.appendChild(buildAdvancedSelect('Drive', 'energy', 'drive', autoIntensityOptions));
      energySection.appendChild(buildAdvancedSelect('Attack', 'energy', 'attack', autoIntensityOptions));
      energySection.appendChild(buildAdvancedSelect('Peaks', 'energy', 'peaks', [
        { value: 'auto', label: 'Auto' },
        { value: 'steady', label: 'Steady' },
        { value: 'waves', label: 'Waves' },
        { value: 'bursts', label: 'Bursts' },
      ]));
      body.appendChild(buildSection('Energy (Advanced)', energySection));

      const complexitySection = document.createElement('div');
      complexitySection.className = 'flow-section-body';
      complexitySection.appendChild(buildAdvancedSelect('Harmony', 'complexity', 'harmony', autoIntensityOptions));
      complexitySection.appendChild(buildAdvancedSelect('Melody', 'complexity', 'melody', autoIntensityOptions));
      complexitySection.appendChild(buildAdvancedSelect('Rhythm', 'complexity', 'rhythm', autoIntensityOptions));
      complexitySection.appendChild(buildAdvancedSelect('Ornamentation', 'complexity', 'ornamentation', autoIntensityOptions));
      body.appendChild(buildSection('Complexity (Advanced)', complexitySection));

      const variationSection = document.createElement('div');
      variationSection.className = 'flow-section-body';
      variationSection.appendChild(buildAdvancedSelect('Strategy', 'variation', 'strategy', variationStrategyOptions));
      variationSection.appendChild(buildAdvancedSelect('Similarity Target', 'variation', 'similarity', autoIntensityOptions));
      variationSection.appendChild(buildAdvancedSelect('Anti-repeat Window', 'variation', 'antiRepeat', [
        { value: 'auto', label: 'Auto' },
        { value: 'short', label: 'Short' },
        { value: 'medium', label: 'Medium' },
        { value: 'long', label: 'Long' },
      ]));
      variationSection.appendChild(buildAdvancedSelect('Seed Mode', 'variation', 'seedMode', seedModeOptions));
      body.appendChild(buildSection('Variation (Advanced)', variationSection));

      const lengthSection = document.createElement('div');
      lengthSection.className = 'flow-section-body';
      lengthSection.appendChild(buildAdvancedSelect('Phrase Structure', 'length', 'phrase', [
        { value: 'auto', label: 'Auto' },
        { value: 'tight', label: 'Tight' },
        { value: 'balanced', label: 'Balanced' },
        { value: 'stretched', label: 'Stretched' },
      ]));
      lengthSection.appendChild(buildAdvancedSelect('Cadence Placement', 'length', 'cadence', [
        { value: 'auto', label: 'Auto' },
        { value: 'early', label: 'Early' },
        { value: 'center', label: 'Center' },
        { value: 'late', label: 'Late' },
      ]));
      body.appendChild(buildSection('Length (Advanced)', lengthSection));

      const registerSection = document.createElement('div');
      registerSection.className = 'flow-section-body';
      registerSection.appendChild(buildAdvancedSelect('Range Width', 'register', 'width', [
        { value: 'auto', label: 'Auto' },
        { value: 'narrow', label: 'Narrow' },
        { value: 'mid', label: 'Mid' },
        { value: 'wide', label: 'Wide' },
      ]));
      registerSection.appendChild(buildAdvancedSelect('Range Movement', 'register', 'movement', [
        { value: 'auto', label: 'Auto' },
        { value: 'static', label: 'Static' },
        { value: 'drift', label: 'Drift' },
        { value: 'sweep', label: 'Sweep' },
      ]));
      body.appendChild(buildSection('Register (Advanced)', registerSection));

      return buildSection('Advanced', body, { collapsible: true, defaultOpen: false });
    };

    const renderAdvancedShell = () => {
      const body = document.createElement('div');
      body.className = 'flow-section-body';
      const placeholderText = 'Placeholder controls are coming in Phase 05.';
      const placeholders = [
        'Advanced Style',
        'Advanced Voice',
        'Advanced Pattern',
        'Advanced Feel',
        'Advanced Variation',
        'Advanced Timing',
      ];
      placeholders.forEach((title) => {
        const sectionBody = document.createElement('div');
        sectionBody.className = 'flow-section-body';
        const help = document.createElement('div');
        help.className = 'flow-field-help';
        help.textContent = placeholderText;
        sectionBody.appendChild(help);
        body.appendChild(buildSection(title, sectionBody, { collapsible: true, defaultOpen: false }));
      });
      return buildSection('Advanced', body, { collapsible: true, defaultOpen: false });
    };

    const getStyleDefinition = () => styleContext?.style || STYLE_CATALOG[0] || null;

    const buildCustomMelodyEditor = () => {
      const durationBars = Math.max(canon.durationBars ?? 1, 1);
      const grid = canon.customMelody?.grid || canon.pattern?.custom?.grid || canon.feel?.manual?.grid || '1/16';
      const stepsPerBar = getStepsPerBar(grid);
      const rawBars = canon.customMelody?.bars;
      const barCount = durationBars;
      const emptyBar = normalizeBars([], 1, stepsPerBar)[0];
      const baseBars = normalizeBars(
        rawBars,
        Math.max(barCount, Array.isArray(rawBars) ? rawBars.length : 0),
        stepsPerBar
      );
      const bars = baseBars.slice(0, barCount);
      const savedState = customMelodyState.get(node.id) || { barIndex: 0 };
      let activeIndex = Math.min(Math.max(savedState.barIndex ?? 0, 0), bars.length - 1);
      if (activeIndex !== savedState.barIndex) {
        customMelodyState.set(node.id, { ...savedState, barIndex: activeIndex });
      }

      const mergeBars = (nextSubset) => {
        const mergedLength = Math.max(
          baseBars.length,
          Array.isArray(nextSubset) ? nextSubset.length : 0,
          barCount
        );
        const merged = [];
        for (let idx = 0; idx < mergedLength; idx += 1) {
          if (Array.isArray(nextSubset) && nextSubset[idx]) {
            merged[idx] = nextSubset[idx];
          } else if (baseBars[idx]) {
            merged[idx] = baseBars[idx];
          } else {
            merged[idx] = emptyBar;
          }
        }
        return merged;
      };

      const writeBars = (nextBars, nextGrid = grid) => {
        const targetGrid = nextGrid || grid;
        const merged = mergeBars(nextBars);
        const normalized = normalizeBars(
          merged,
          Math.max(barCount, merged.length),
          getStepsPerBar(targetGrid)
        );
        updateParamsNormalized({
          pattern: {
            ...canon.pattern,
            mode: 'custom',
            custom: {
              ...canon.pattern.custom,
              grid: targetGrid,
              bars: normalized,
            },
          },
        });
      };

      const wrapper = document.createElement('div');
      wrapper.className = 'melody-card';

      const header = document.createElement('div');
      header.className = 'melody-card-header';
      header.textContent = 'Custom Melody';
      wrapper.appendChild(header);

      const topRow = document.createElement('div');
      topRow.className = 'melody-row';
      const gridField = buildSelect({
        label: 'Grid',
        value: grid,
        options: [
          { value: '1/4', label: 'Quarter (1/4)' },
          { value: '1/8', label: 'Eighth (1/8)' },
          { value: '1/12', label: 'Triplet (1/12)' },
          { value: '1/16', label: 'Sixteenth (1/16)' },
          { value: '1/24', label: '1/24' },
        ],
        onChange: (value) => {
          const nextSteps = getStepsPerBar(value);
          const nextBars = normalizeBars(baseBars, Math.max(barCount, baseBars.length), nextSteps);
          writeBars(nextBars, value);
        },
      });
      gridField.classList.add('melody-field');
      topRow.appendChild(gridField);

      const barField = buildSelect({
        label: 'Bar (within thought)',
        value: String(activeIndex),
        options: bars.map((_, idx) => ({ value: String(idx), label: `Bar ${idx + 1}` })),
        onChange: (value) => {
          activeIndex = Math.min(Math.max(Number(value) || 0, 0), bars.length - 1);
          customMelodyState.set(node.id, { ...savedState, barIndex: activeIndex });
          renderBarDetails();
        },
      });
      barField.classList.add('melody-field');
      topRow.appendChild(barField);
      wrapper.appendChild(topRow);

      const stripContainer = document.createElement('div');
      stripContainer.className = 'melody-strip-container';
      const stripHint = document.createElement('div');
      stripHint.className = 'melody-hint';
      stripHint.textContent = 'Click to toggle notes, double-click to add/remove holds, right-click to clear.';
      stripContainer.appendChild(stripHint);

      const stepStrip = createStepStrip({
        steps: normalizeRhythm(bars[activeIndex]?.rhythm, stepsPerBar).split(''),
        onChange: (nextSteps) => {
          const raw = (nextSteps || []).join('').slice(0, stepsPerBar).padEnd(stepsPerBar, '.');
          const rhythm = normalizeRhythm(raw, stepsPerBar);
          const nextBars = bars.map((bar, idx) => (
            idx === activeIndex
              ? { rhythm, notes: syncNotesToRhythm(bar.notes, rhythm) }
              : bar
          ));
          writeBars(nextBars);
        },
      });
      stripContainer.appendChild(stepStrip.element);
      wrapper.appendChild(stripContainer);

      const actions = document.createElement('div');
      actions.className = 'melody-actions';

      const copyButton = document.createElement('button');
      copyButton.type = 'button';
      copyButton.textContent = 'Copy bar';
      copyButton.addEventListener('click', () => {
        const bar = bars[activeIndex] || { rhythm: '', notes: '' };
        customMelodyClipboard = { rhythm: bar.rhythm, notes: bar.notes };
        pasteButton.disabled = false;
      });
      actions.appendChild(copyButton);

      const pasteButton = document.createElement('button');
      pasteButton.type = 'button';
      pasteButton.textContent = 'Paste bar';
      pasteButton.disabled = !customMelodyClipboard;
      pasteButton.addEventListener('click', () => {
        if (!customMelodyClipboard) return;
        const rhythm = normalizeRhythm(customMelodyClipboard.rhythm, stepsPerBar);
        const notes = syncNotesToRhythm(customMelodyClipboard.notes, rhythm);
        const nextBars = bars.map((bar, idx) => (
          idx === activeIndex ? { rhythm, notes } : bar
        ));
        writeBars(nextBars);
      });
      actions.appendChild(pasteButton);

      const copyPrevButton = document.createElement('button');
      copyPrevButton.type = 'button';
      copyPrevButton.textContent = 'Copy previous';
      copyPrevButton.disabled = activeIndex === 0;
      copyPrevButton.addEventListener('click', () => {
        if (activeIndex === 0) return;
        const prev = bars[activeIndex - 1] || { rhythm: '', notes: '' };
        const rhythm = normalizeRhythm(prev.rhythm, stepsPerBar);
        const notes = syncNotesToRhythm(prev.notes, rhythm);
        const nextBars = bars.map((bar, idx) => (
          idx === activeIndex ? { rhythm, notes } : bar
        ));
        writeBars(nextBars);
      });
      actions.appendChild(copyPrevButton);

      const presetAButton = document.createElement('button');
      presetAButton.type = 'button';
      presetAButton.textContent = 'Preset A';
      presetAButton.addEventListener('click', () => {
        const rhythm = normalizeRhythm(buildPresetRhythmA(stepsPerBar), stepsPerBar);
        const notes = syncNotesToRhythm(bars[activeIndex]?.notes || '', rhythm);
        const nextBars = bars.map((bar, idx) => (
          idx === activeIndex ? { rhythm, notes } : bar
        ));
        writeBars(nextBars);
      });
      actions.appendChild(presetAButton);

      const presetBButton = document.createElement('button');
      presetBButton.type = 'button';
      presetBButton.textContent = 'Preset B';
      presetBButton.addEventListener('click', () => {
        const rhythm = normalizeRhythm(buildPresetRhythmB(stepsPerBar), stepsPerBar);
        const notes = syncNotesToRhythm(bars[activeIndex]?.notes || '', rhythm);
        const nextBars = bars.map((bar, idx) => (
          idx === activeIndex ? { rhythm, notes } : bar
        ));
        writeBars(nextBars);
      });
      actions.appendChild(presetBButton);

      wrapper.appendChild(actions);

      const notesSection = document.createElement('div');
      notesSection.className = 'melody-notes';
      const notesHeader = document.createElement('div');
      notesHeader.className = 'melody-notes-header';
      notesHeader.textContent = 'Notes (aligned to note starts)';
      notesSection.appendChild(notesHeader);
      const notesList = document.createElement('div');
      notesList.className = 'melody-notes-list';
      notesSection.appendChild(notesList);
      wrapper.appendChild(notesSection);

      const renderBarDetails = () => {
        const bar = bars[activeIndex] || { rhythm: '.'.repeat(stepsPerBar), notes: '' };
        const normalizedRhythm = normalizeRhythm(bar.rhythm, stepsPerBar);
        stepStrip.setSteps(normalizedRhythm.split(''));

        notesList.innerHTML = '';
        const noteStarts = listNoteStarts(normalizedRhythm);
        const tokens = tokenizeNotes(bar.notes);
        if (noteStarts.length === 0) {
          const empty = document.createElement('div');
          empty.className = 'melody-hint';
          empty.textContent = 'Add note-on steps in the rhythm to enter notes.';
          notesList.appendChild(empty);
          return;
        }
        noteStarts.forEach((stepIndex, noteIndex) => {
          const row = document.createElement('div');
          row.className = 'melody-note-row';
          const label = document.createElement('span');
          label.className = 'melody-note-label';
          label.textContent = `Note ${noteIndex + 1} (Step ${stepIndex + 1})`;
          const input = document.createElement('input');
          input.type = 'text';
          input.className = 'melody-note-input';
          input.placeholder = 'C#5 or 73';
          input.value = tokens[noteIndex] || '';
          const commitNote = debounce((nextValue) => {
            const nextTokens = [...tokens];
            nextTokens[noteIndex] = nextValue;
            const nextNotes = syncNotesToRhythm(nextTokens.join(' '), normalizedRhythm);
            const nextBars = bars.map((item, idx) => (
              idx === activeIndex ? { rhythm: normalizedRhythm, notes: nextNotes } : item
            ));
            writeBars(nextBars);
          }, 250);
          input.addEventListener('input', () => {
            commitNote(input.value);
          });
          input.addEventListener('blur', () => {
            if (typeof commitNote.flush === 'function') {
              commitNote.flush();
            }
          });
          row.appendChild(label);
          row.appendChild(input);
          notesList.appendChild(row);
        });
      };

      renderBarDetails();

      return wrapper;
    };

    const buildHarmonySection = () => {
      const harmonyWrapper = document.createElement('div');
      harmonyWrapper.className = 'flow-section-body';
      const progressionView = getDropdownView('progression');
      const progressionSets = styleContext?.optionSets?.progressions || { recommended: [], all: [] };
      const progressionPool = progressionView === 'all' ? progressionSets.all : progressionSets.recommended;
      const availablePresets = progressionPool.length > 0 ? progressionPool : progressionSets.all;
      const progressionOptions = ensureOptionPresence(
        availablePresets.map(preset => ({ value: preset.id, label: preset.label || preset.id })),
        canon.harmony.preset.id,
        value => getProgressionPresetById(value)?.name || value
      );
      harmonyWrapper.appendChild(buildSelect({
        label: 'Progression View',
        value: progressionView,
        options: [
          { value: 'recommended', label: 'Recommended (Style+Mood)' },
          { value: 'all', label: 'All in Style' },
        ],
        onChange: value => updateDropdownPrefs('progression', value),
      }));
      harmonyWrapper.appendChild(buildSelect({
        label: 'harmony.mode',
        value: canon.harmony.mode || 'single',
        options: [
          { value: 'single', label: 'Single Chord' },
          { value: 'preset', label: 'Progression (Preset)' },
          { value: 'custom', label: 'Progression (Custom)' },
        ],
        onChange: value => updateParamsNormalized({
          harmony: {
            ...canon.harmony,
            mode: value,
          },
        }),
      }));

      const harmonyMode = canon.harmony.mode || 'single';
      if (harmonyMode === 'single') {
        harmonyWrapper.appendChild(buildField({
          label: 'chordRoot',
          type: 'string',
          value: canon.harmony.single.root || '',
          onChange: value => updateParamsNormalized({
            harmony: {
              ...canon.harmony,
              single: { ...canon.harmony.single, root: value },
            },
          }),
        }));
        harmonyWrapper.appendChild(buildSelect({
          label: 'chordQuality',
          value: canon.harmony.single.quality || 'minor',
          options: [
            { value: 'major', label: 'Major' },
            { value: 'minor', label: 'Minor' },
            { value: 'diminished', label: 'Diminished' },
            { value: 'augmented', label: 'Augmented' },
          ],
          onChange: value => updateParamsNormalized({
            harmony: {
              ...canon.harmony,
              single: { ...canon.harmony.single, quality: value },
            },
          }),
        }));
      }

      if (harmonyMode === 'preset') {
        const presetOptions = progressionOptions.length > 0 ? progressionOptions : getProgressionPresets().map(preset => ({
          value: preset.id,
          label: preset.name,
        }));
        let activePresetId = canon.harmony.preset.id || presetOptions[0]?.value || '';
        if (!presetOptions.some(option => option.value === activePresetId)) {
          activePresetId = presetOptions[0]?.value || activePresetId;
        }
        const activePreset = getProgressionPresetById(activePresetId);
        const variantOptions = ensureOptionPresence(
          (activePreset?.variants || []).map(variant => ({
            value: variant.id,
            label: variant.label,
          })),
          canon.harmony.preset.variantId,
          value => value || 'variant'
        );
        harmonyWrapper.appendChild(buildSelect({
          label: 'progressionPresetId',
          value: activePresetId,
          options: presetOptions,
          onChange: value => updateParamsNormalized({
            harmony: {
              ...canon.harmony,
              preset: { ...canon.harmony.preset, id: value },
            },
          }),
        }));
        harmonyWrapper.appendChild(buildSelect({
          label: 'progressionVariantId',
          value: canon.harmony.preset.variantId || activePreset?.variants?.[0]?.id || 'triads',
          options: variantOptions,
          onChange: value => updateParamsNormalized({
            harmony: {
              ...canon.harmony,
              preset: { ...canon.harmony.preset, variantId: value },
            },
          }),
        }));
        harmonyWrapper.appendChild(buildSelect({
          label: 'chordsPerBar',
          value: canon.harmony.preset.chordsPerBar || '1',
          options: [
            { value: '1', label: '1 chord per bar' },
            { value: '2', label: '2 chords per bar' },
            { value: '0.5', label: '1 chord per 2 bars' },
          ],
          onChange: value => updateParamsNormalized({
            harmony: {
              ...canon.harmony,
              preset: { ...canon.harmony.preset, chordsPerBar: value },
            },
          }),
        }));
        harmonyWrapper.appendChild(buildSelect({
          label: 'fillBehavior',
          value: canon.harmony.preset.fill || 'repeat',
          options: [
            { value: 'repeat', label: 'Repeat' },
            { value: 'hold_last', label: 'Hold last' },
            { value: 'rest', label: 'Rest' },
          ],
          onChange: value => updateParamsNormalized({
            harmony: {
              ...canon.harmony,
              preset: { ...canon.harmony.preset, fill: value },
            },
          }),
        }));
        harmonyWrapper.appendChild(buildSelect({
          label: 'progressionLength',
          value: canon.harmony.preset.length ?? 'preset',
          options: [
            { value: 'preset', label: 'Preset length' },
            { value: '2', label: '2 bars' },
            { value: '4', label: '4 bars' },
            { value: '8', label: '8 bars' },
            { value: '16', label: '16 bars' },
          ],
          onChange: value => updateParamsNormalized({
            harmony: {
              ...canon.harmony,
              preset: { ...canon.harmony.preset, length: value },
            },
          }),
        }));
      }

      if (harmonyMode === 'custom') {
        harmonyWrapper.appendChild(buildSelect({
          label: 'progressionCustomVariantStyle',
          value: canon.harmony.custom.variantStyle || 'triads',
          options: [
            { value: 'triads', label: 'Triads' },
            { value: '7ths', label: '7ths' },
            { value: '9ths_soft', label: '9ths (soft)' },
          ],
          onChange: value => updateParamsNormalized({
            harmony: {
              ...canon.harmony,
              custom: { ...canon.harmony.custom, variantStyle: value },
            },
          }),
        }));
        harmonyWrapper.appendChild(buildSelect({
          label: 'chordsPerBar',
          value: canon.harmony.custom.chordsPerBar || '1',
          options: [
            { value: '1', label: '1 chord per bar' },
            { value: '2', label: '2 chords per bar' },
            { value: '0.5', label: '1 chord per 2 bars' },
          ],
          onChange: value => updateParamsNormalized({
            harmony: {
              ...canon.harmony,
              custom: { ...canon.harmony.custom, chordsPerBar: value },
            },
          }),
        }));
        harmonyWrapper.appendChild(buildSelect({
          label: 'fillBehavior',
          value: canon.harmony.custom.fill || 'repeat',
          options: [
            { value: 'repeat', label: 'Repeat' },
            { value: 'hold_last', label: 'Hold last' },
            { value: 'rest', label: 'Rest' },
          ],
          onChange: value => updateParamsNormalized({
            harmony: {
              ...canon.harmony,
              custom: { ...canon.harmony.custom, fill: value },
            },
          }),
        }));
        harmonyWrapper.appendChild(buildSelect({
          label: 'progressionLength',
          value: canon.harmony.custom.length ?? 'preset',
          options: [
            { value: 'preset', label: 'Custom length' },
            { value: '2', label: '2 bars' },
            { value: '4', label: '4 bars' },
            { value: '8', label: '8 bars' },
            { value: '16', label: '16 bars' },
          ],
          onChange: value => updateParamsNormalized({
            harmony: {
              ...canon.harmony,
              custom: { ...canon.harmony.custom, length: value },
            },
          }),
        }));
      }

      if (harmonyMode !== 'single') {
        const preview = buildProgressionPreview({
          ...canon,
          harmonyMode: harmonyMode === 'preset' ? 'progression_preset' : 'progression_custom',
          progressionPresetId: canon.harmony.preset.id || getProgressionPresets()[0]?.id,
        });
        if (preview) {
          harmonyWrapper.appendChild(buildProgressionPreviewStrip(preview));
        }
      }
      return harmonyWrapper;
    };

    const buildPatternSection = ({ includeCustomEditor = true } = {}) => {
      const patternWrapper = document.createElement('div');
      patternWrapper.className = 'flow-section-body';
      const melodyMode = canon.pattern.mode || 'generated';
      patternWrapper.appendChild(buildSelect({
        label: 'pattern.mode',
        value: melodyMode,
        options: [
          { value: 'generated', label: 'Generated' },
          { value: 'custom', label: 'Custom' },
        ],
        onChange: value => updateParamsNormalized({
          pattern: {
            ...canon.pattern,
            mode: value,
          },
        }),
      }));
      if (melodyMode === 'generated') {
        const patternView = getDropdownView('pattern');
        const patternSets = styleContext?.optionSets?.patterns || { recommended: [], all: [] };
        const patternPool = patternView === 'all' ? patternSets.all : patternSets.recommended;
        const availablePatterns = patternPool.length > 0 ? patternPool : patternSets.all;
        const patternOptions = ensureOptionPresence(
          availablePatterns.map(pattern => ({ value: pattern.id, label: pattern.label || pattern.id })),
          canon.pattern.generated.id,
          value => PATTERN_BY_ID[value]?.label || value
        );
        patternWrapper.appendChild(buildSelect({
          label: 'Pattern View',
          value: patternView,
          options: STYLE_DROPDOWN_VIEW_OPTIONS,
          onChange: value => updateDropdownPrefs('pattern', value),
        }));
        patternWrapper.appendChild(buildSelect({
          label: 'pattern',
          value: canon.pattern.generated.id || patternOptions[0]?.value || '',
          options: patternOptions,
          onChange: (value) => {
            console.log('Pattern selection changed', { value, nodeId: node?.id });
            updateParamsNormalized({
              pattern: {
                ...canon.pattern,
                mode: 'generated',
                generated: {
                  ...canon.pattern.generated,
                  id: value,
                },
              },
            });
          },
        }));
      } else if (includeCustomEditor) {
        patternWrapper.appendChild(buildCustomMelodyEditor());
      } else {
        const hint = document.createElement('div');
        hint.className = 'flow-field-help';
        hint.textContent = 'Custom melody editing is available in Expert.';
        patternWrapper.appendChild(hint);
      }
      return patternWrapper;
    };

    const buildFeelSection = () => {
      const feelWrapper = document.createElement('div');
      feelWrapper.className = 'flow-section-body';
      const feelMode = canon.feel.mode || 'manual';
      const feelView = getDropdownView('feel');
      const feelSets = styleContext?.optionSets?.feels || { recommended: [], all: [] };
      const feelPool = feelView === 'all' ? feelSets.all : feelSets.recommended;
      const availableFeels = feelPool.length > 0 ? feelPool : feelSets.all;
      const activeFeel = availableFeels.find(feel => (
        feel.rhythmGrid === (canon.feel.manual.grid || '1/12')
        && feel.syncopation === (canon.feel.manual.syncopation || 'none')
        && feel.timingWarp === (canon.feel.manual.warp || 'none')
        && Number(feel.timingIntensity) === Number(canon.feel.manual.intensity ?? 0)
      )) || feelSets.all.find(feel => (
        feel.rhythmGrid === (canon.feel.manual.grid || '1/12')
        && feel.syncopation === (canon.feel.manual.syncopation || 'none')
        && feel.timingWarp === (canon.feel.manual.warp || 'none')
        && Number(feel.timingIntensity) === Number(canon.feel.manual.intensity ?? 0)
      ));
      const feelOptions = ensureOptionPresence(
        availableFeels.map(feel => ({ value: feel.id, label: feel.label || feel.id })),
        activeFeel?.id,
        value => availableFeels.find(feel => feel.id === value)?.label || value
      );
      feelWrapper.appendChild(buildSelect({
        label: 'feel.mode',
        value: feelMode,
        options: [
          { value: 'preset', label: 'Preset' },
          { value: 'manual', label: 'Manual' },
        ],
        onChange: value => updateParamsNormalized({
          feel: {
            ...canon.feel,
            mode: value,
          },
        }),
      }));
      feelWrapper.appendChild(buildSelect({
        label: 'Feel View',
        value: feelView,
        options: STYLE_DROPDOWN_VIEW_OPTIONS,
        onChange: value => updateDropdownPrefs('feel', value),
      }));
      feelWrapper.appendChild(buildSelect({
        label: 'Feel Preset',
        value: canon.feel.presetId || activeFeel?.id || '',
        options: feelOptions,
        onChange: (value) => {
          const selected = availableFeels.find(feel => feel.id === value) || feelSets.all.find(feel => feel.id === value);
          if (selected) {
            updateParamsNormalized({
              feel: {
                ...canon.feel,
                mode: 'preset',
                presetId: value,
                manual: {
                  ...canon.feel.manual,
                  grid: selected.rhythmGrid,
                  syncopation: selected.syncopation,
                  warp: selected.timingWarp,
                  intensity: selected.timingIntensity,
                },
              },
            });
          }
        },
      }));
      if (feelMode !== 'manual') {
        return feelWrapper;
      }
      feelWrapper.appendChild(buildSelect({
        label: 'rhythmGrid',
        value: canon.feel.manual.grid || '1/12',
        options: [
          { value: '1/4', label: 'Quarter (1/4)' },
          { value: '1/8', label: 'Eighth (1/8)' },
          { value: '1/12', label: 'Triplet (1/12)' },
          { value: '1/16', label: 'Sixteenth (1/16)' },
          { value: '1/24', label: '1/24' },
        ],
        onChange: value => updateParamsNormalized({
          feel: {
            ...canon.feel,
            mode: 'manual',
            manual: { ...canon.feel.manual, grid: value },
          },
        }),
      }));
      feelWrapper.appendChild(buildSelect({
        label: 'syncopation',
        value: canon.feel.manual.syncopation || 'none',
        options: [
          { value: 'none', label: 'None' },
          { value: 'offbeat', label: 'Offbeat' },
          { value: 'anticipation', label: 'Anticipation' },
        ],
        onChange: value => updateParamsNormalized({
          feel: {
            ...canon.feel,
            mode: 'manual',
            manual: { ...canon.feel.manual, syncopation: value },
          },
        }),
      }));
      feelWrapper.appendChild(buildSelect({
        label: 'timingWarp',
        value: canon.feel.manual.warp || 'none',
        options: [
          { value: 'none', label: 'None' },
          { value: 'swing', label: 'Swing' },
          { value: 'shuffle', label: 'Shuffle' },
        ],
        onChange: value => updateParamsNormalized({
          feel: {
            ...canon.feel,
            mode: 'manual',
            manual: { ...canon.feel.manual, warp: value },
          },
        }),
      }));
      feelWrapper.appendChild(buildField({
        label: 'timingIntensity',
        type: 'number',
        value: canon.feel.manual.intensity ?? 0,
        onChange: value => updateParamsNormalized({
          feel: {
            ...canon.feel,
            mode: 'manual',
            manual: { ...canon.feel.manual, intensity: value },
          },
        }),
      }));
      return feelWrapper;
    };

    const buildRegisterAndInstrumentSection = () => {
      const wrapper = document.createElement('div');
      wrapper.className = 'flow-section-body';
      const instrumentView = getDropdownView('instrument');
      const registerView = getDropdownView('register');
      const instrumentSets = styleContext?.optionSets?.instruments || { recommended: [], all: [] };
      const registerSets = styleContext?.optionSets?.registers || { recommended: [], all: [] };
      const instrumentPool = instrumentView === 'all' ? instrumentSets.all : instrumentSets.recommended;
      const registerPool = registerView === 'all' ? registerSets.all : registerSets.recommended;
      const instruments = instrumentPool.length > 0 ? instrumentPool : instrumentSets.all;
      const registers = registerPool.length > 0 ? registerPool : registerSets.all;
      const instrumentOptions = ensureOptionPresence(
        [
          ...instruments.map(item => ({ value: item.instrumentPreset || item.id, label: item.label || item.instrumentPreset || item.id })),
          ...((presetCache || []).map(preset => ({ value: preset.id, label: preset.name }))),
        ].filter(option => option.value),
        canon.voice.preset,
        value => value
      );
      const activeRegister = registers.find(item => item.min === canon.voice.register.min && item.max === canon.voice.register.max)
        || registerSets.all.find(item => item.min === canon.voice.register.min && item.max === canon.voice.register.max);
      const registerOptions = ensureOptionPresence(
        registers.map(item => ({ value: item.id, label: item.label || item.id })),
        activeRegister?.id,
        value => registers.find(item => item.id === value)?.label || value
      );
      wrapper.appendChild(buildSelect({
        label: 'Instrument View',
        value: instrumentView,
        options: STYLE_DROPDOWN_VIEW_OPTIONS,
        onChange: value => updateDropdownPrefs('instrument', value),
      }));
      if (instrumentOptions.length > 0) {
        wrapper.appendChild(buildSelect({
          label: 'instrumentPreset',
          value: canon.voice.preset || instrumentOptions[0]?.value,
          options: instrumentOptions,
          onChange: value => updateParamsNormalized({
            voice: {
              ...canon.voice,
              preset: value,
            },
          }),
        }));
      } else {
        wrapper.appendChild(buildField({
          label: 'instrumentPreset',
          type: 'string',
          value: canon.voice.preset || '',
          onChange: value => updateParamsNormalized({
            voice: {
              ...canon.voice,
              preset: value,
            },
          }),
        }));
      }

      wrapper.appendChild(buildSelect({
        label: 'Register View',
        value: registerView,
        options: STYLE_DROPDOWN_VIEW_OPTIONS,
        onChange: value => updateDropdownPrefs('register', value),
      }));
      wrapper.appendChild(buildField({
        label: 'registerMin',
        type: 'number',
        value: canon.voice.register.min ?? 48,
        onChange: value => updateParamsNormalized({
          voice: {
            ...canon.voice,
            register: { ...canon.voice.register, min: value },
          },
        }),
      }));
      wrapper.appendChild(buildField({
        label: 'registerMax',
        type: 'number',
        value: canon.voice.register.max ?? 84,
        onChange: value => updateParamsNormalized({
          voice: {
            ...canon.voice,
            register: { ...canon.voice.register, max: value },
          },
        }),
      }));
      wrapper.appendChild(buildSelect({
        label: 'instrumentSoundfont',
        value: canon.voice.soundfont || SOUND_FONTS[0].value,
        options: SOUND_FONTS,
        onChange: value => updateParamsNormalized({
          voice: {
            ...canon.voice,
            soundfont: value,
          },
        }),
      }));

      if (registerOptions.length > 0) {
        wrapper.appendChild(buildSelect({
          label: 'Register Suggestion',
          value: activeRegister?.id || '',
          options: registerOptions,
          onChange: (value) => {
            const selected = registers.find(item => item.id === value) || registerSets.all.find(item => item.id === value);
            if (selected) {
              updateParamsNormalized({
                voice: {
                  ...canon.voice,
                  register: { min: selected.min, max: selected.max },
                },
              });
            }
          },
        }));
      }
      return wrapper;
    };

    const buildVoicePresetSection = () => {
      const wrapper = document.createElement('div');
      wrapper.className = 'flow-section-body';
      const instrumentView = getDropdownView('instrument');
      const instrumentSets = styleContext?.optionSets?.instruments || { recommended: [], all: [] };
      const instrumentPool = instrumentView === 'all' ? instrumentSets.all : instrumentSets.recommended;
      const instruments = instrumentPool.length > 0 ? instrumentPool : instrumentSets.all;
      const instrumentOptions = ensureOptionPresence(
        [
          ...instruments.map(item => ({ value: item.instrumentPreset || item.id, label: item.label || item.instrumentPreset || item.id })),
          ...((presetCache || []).map(preset => ({ value: preset.id, label: preset.name }))),
        ].filter(option => option.value),
        canon.voice.preset,
        value => value
      );
      wrapper.appendChild(buildSelect({
        label: 'Instrument View',
        value: instrumentView,
        options: STYLE_DROPDOWN_VIEW_OPTIONS,
        onChange: value => updateDropdownPrefs('instrument', value),
      }));
      if (instrumentOptions.length > 0) {
        wrapper.appendChild(buildSelect({
          label: 'voice.preset',
          value: canon.voice.preset || instrumentOptions[0]?.value,
          options: instrumentOptions,
          onChange: value => updateParamsNormalized({
            voice: {
              ...canon.voice,
              preset: value,
            },
          }),
        }));
      } else {
        wrapper.appendChild(buildField({
          label: 'voice.preset',
          type: 'string',
          value: canon.voice.preset || '',
          onChange: value => updateParamsNormalized({
            voice: {
              ...canon.voice,
              preset: value,
            },
          }),
        }));
      }
      return wrapper;
    };

    const buildVoiceRegisterSection = () => {
      const wrapper = document.createElement('div');
      wrapper.className = 'flow-section-body';
      const registerView = getDropdownView('register');
      const registerSets = styleContext?.optionSets?.registers || { recommended: [], all: [] };
      const registerPool = registerView === 'all' ? registerSets.all : registerSets.recommended;
      const registers = registerPool.length > 0 ? registerPool : registerSets.all;
      const activeRegister = registers.find(item => item.min === canon.voice.register.min && item.max === canon.voice.register.max)
        || registerSets.all.find(item => item.min === canon.voice.register.min && item.max === canon.voice.register.max);
      const registerOptions = ensureOptionPresence(
        registers.map(item => ({ value: item.id, label: item.label || item.id })),
        activeRegister?.id,
        value => registers.find(item => item.id === value)?.label || value
      );
      wrapper.appendChild(buildSelect({
        label: 'Register View',
        value: registerView,
        options: STYLE_DROPDOWN_VIEW_OPTIONS,
        onChange: value => updateDropdownPrefs('register', value),
      }));
      wrapper.appendChild(buildField({
        label: 'voice.register.min',
        type: 'number',
        value: canon.voice.register.min ?? 48,
        onChange: value => updateParamsNormalized({
          voice: {
            ...canon.voice,
            register: { ...canon.voice.register, min: value },
          },
        }),
      }));
      wrapper.appendChild(buildField({
        label: 'voice.register.max',
        type: 'number',
        value: canon.voice.register.max ?? 84,
        onChange: value => updateParamsNormalized({
          voice: {
            ...canon.voice,
            register: { ...canon.voice.register, max: value },
          },
        }),
      }));
      if (registerOptions.length > 0) {
        wrapper.appendChild(buildSelect({
          label: 'Register Suggestion',
          value: activeRegister?.id || '',
          options: registerOptions,
          onChange: (value) => {
            const selected = registers.find(item => item.id === value) || registerSets.all.find(item => item.id === value);
            if (selected) {
              updateParamsNormalized({
                voice: {
                  ...canon.voice,
                  register: { min: selected.min, max: selected.max },
                },
              });
            }
          },
        }));
      }
      return wrapper;
    };

    const renderThoughtCoreSection = () => {
      const body = document.createElement('div');
      body.className = 'flow-section-body';
      body.appendChild(buildField({
        label: 'label',
        type: 'string',
        value: canon.label,
        onChange: value => updateParamsNormalized({ label: value }),
      }));
      body.appendChild(buildField({
        label: 'durationBars',
        type: 'number',
        value: canon.durationBars ?? 1,
        onChange: value => updateParamsNormalized({ durationBars: value }),
      }));
      body.appendChild(buildField({
        label: 'key',
        type: 'string',
        value: canon.key || 'C# minor',
        onChange: value => updateParamsNormalized({ key: value }),
      }));
      return buildSection('Core', body);
    };

    const renderThoughtStyleSection = () => {
      const body = document.createElement('div');
      body.className = 'flow-section-body';

      const styleOptions = (STYLE_CATALOG || []).map(style => ({
        value: style.id,
        label: style.label || style.id,
      }));
      if (styleOptions.length > 0) {
        body.appendChild(buildSelect({
          label: 'Style',
          value: canon.style.id || styleOptions[0].value,
          options: styleOptions,
          onChange: value => {
            updateParamsNormalized({
              style: {
                ...canon.style,
                id: value,
                mood: { ...canon.style.mood, id: 'none', mode: 'override' },
              },
            });
            applyStyleResolution({ nextStyleId: value, nextMoodId: 'none' });
          },
        }));
      }

      body.appendChild(buildRegisterAndInstrumentSection());
      return buildSection('Style', body);
    };

    const renderThoughtStyleBasicsSection = () => {
      const body = document.createElement('div');
      body.className = 'flow-section-body';
      const styleOptions = (STYLE_CATALOG || []).map(style => ({
        value: style.id,
        label: style.label || style.id,
      }));
      if (styleOptions.length > 0) {
        body.appendChild(buildSelect({
          label: 'Style',
          value: canon.style.id || styleOptions[0].value,
          options: styleOptions,
          onChange: value => {
            updateParamsNormalized({
              style: {
                ...canon.style,
                id: value,
                mood: { ...canon.style.mood, id: 'none', mode: 'override' },
              },
            });
            applyStyleResolution({ nextStyleId: value, nextMoodId: 'none' });
          },
        }));
      }

      const seedRow = document.createElement('div');
      seedRow.className = 'flow-inline-actions';
      seedRow.appendChild(buildField({
        label: 'styleSeed',
        type: 'number',
        value: coerceSeed(canon.style?.seed, 1),
        onChange: value => applyStyleResolution({ nextSeed: value }),
      }));
      const buttonRow = document.createElement('div');
      buttonRow.className = 'flow-seed-actions';
      const rerollButton = document.createElement('button');
      rerollButton.type = 'button';
      rerollButton.textContent = 'Reroll';
      rerollButton.addEventListener('click', rerollSeed);
      buttonRow.appendChild(rerollButton);
      const copyButton = document.createElement('button');
      copyButton.type = 'button';
      copyButton.textContent = 'Copy';
      copyButton.addEventListener('click', () => copySeed());
      buttonRow.appendChild(copyButton);
      const pasteButton = document.createElement('button');
      pasteButton.type = 'button';
      pasteButton.textContent = 'Paste';
      pasteButton.addEventListener('click', () => pasteSeed());
      buttonRow.appendChild(pasteButton);
      seedRow.appendChild(buttonRow);
      body.appendChild(seedRow);

      const moodRow = document.createElement('div');
      moodRow.className = 'flow-inline-actions';
      const moodOptions = (styleContext?.moods || []).map(mood => ({ value: mood.id, label: mood.label }));
      moodRow.appendChild(buildSelect({
        label: 'Mood',
        value: canon.style?.mood?.id || styleContext?.mood?.id || '',
        options: ensureOptionPresence(moodOptions, styleContext?.mood?.id, val => moodOptions.find(opt => opt.value === val)?.label || val),
        onChange: value => {
          updateParamsNormalized({
            style: {
              ...canon.style,
              mood: { ...canon.style.mood, id: value, mode: 'override' },
            },
          });
          applyStyleResolution({ nextMoodId: value });
        },
      }));
      body.appendChild(moodRow);

      return buildSection('Style', body);
    };

    const renderThoughtStyleOptionsSection = () => {
      const body = document.createElement('div');
      body.className = 'flow-section-body';
      const styleId = canon.style?.id || (STYLE_CATALOG[0]?.id || 'classical_film');
      const moodId = canon.style?.mood?.id || 'none';
      const styleSeed = coerceSeed(canon.style?.seed, 1);
      const signature = buildStyleSignature({ styleId, moodId, styleSeed });
      const isSignatureResolved = canon.styleResolvedSignature === signature;
      const resolveIfNeeded = () => {
        if (!isSignatureResolved) {
          applyStyleResolution({ nextStyleId: styleId, nextMoodId: moodId, nextSeed: styleSeed });
        }
      };

      const seedRow = document.createElement('div');
      seedRow.className = 'flow-inline-actions';
      seedRow.appendChild(buildField({
        label: 'styleSeed',
        type: 'number',
        value: styleSeed,
        onChange: value => applyStyleResolution({ nextSeed: value }),
      }));
      const buttonRow = document.createElement('div');
      buttonRow.className = 'flow-seed-actions';
      const rerollButton = document.createElement('button');
      rerollButton.type = 'button';
      rerollButton.textContent = 'Reroll';
      rerollButton.addEventListener('click', rerollSeed);
      buttonRow.appendChild(rerollButton);
      const copyButton = document.createElement('button');
      copyButton.type = 'button';
      copyButton.textContent = 'Copy';
      copyButton.addEventListener('click', () => copySeed());
      buttonRow.appendChild(copyButton);
      const pasteButton = document.createElement('button');
      pasteButton.type = 'button';
      pasteButton.textContent = 'Paste';
      pasteButton.addEventListener('click', () => pasteSeed());
      buttonRow.appendChild(pasteButton);
      seedRow.appendChild(buttonRow);
      body.appendChild(seedRow);
      const seedHelp = document.createElement('div');
      seedHelp.className = 'flow-field-help';
      seedHelp.textContent = 'Seed controls Auto choices. Reroll to deterministically update Auto fields.';
      body.appendChild(seedHelp);

      const moodRow = document.createElement('div');
      moodRow.className = 'flow-inline-actions';
      const moodOptions = (styleContext?.moods || []).map(mood => ({ value: mood.id, label: mood.label }));
      moodRow.appendChild(buildSelect({
        label: 'Mood',
        value: canon.style?.mood?.id || styleContext?.mood?.id || '',
        options: ensureOptionPresence(moodOptions, styleContext?.mood?.id, val => moodOptions.find(opt => opt.value === val)?.label || val),
        onChange: value => {
          updateParamsNormalized({
            style: {
              ...canon.style,
              mood: { ...canon.style.mood, id: value, mode: 'override' },
            },
          });
          applyStyleResolution({ nextMoodId: value });
        },
      }));
      body.appendChild(moodRow);

      body.appendChild(buildHarmonySection());
      body.appendChild(buildPatternSection({ includeCustomEditor: true }));
      body.appendChild(buildFeelSection());
      const wrapper = document.createElement('div');
      wrapper.className = 'flow-section';
      const details = document.createElement('details');
      details.open = false;
      const summary = document.createElement('summary');
      summary.className = 'flow-section-title';
      summary.textContent = 'Style Options';
      details.appendChild(summary);
      details.appendChild(body);
      details.addEventListener('toggle', () => {
        if (details.open) {
          resolveIfNeeded();
        }
      });
      wrapper.appendChild(details);
      return wrapper;
    };

    const renderThoughtAdvancedSection = () => {
      const body = document.createElement('div');
      body.className = 'flow-section-body';
      body.appendChild(buildHarmonySection());
      body.appendChild(buildPatternSection({ includeCustomEditor: false }));
      body.appendChild(buildFeelSection());
      body.appendChild(buildVoiceRegisterSection());
      return buildSection('Advanced', body);
    };

    const renderThoughtExpertOverridesSection = () => {
      const body = document.createElement('div');
      body.className = 'flow-section-body';
      body.appendChild(buildField({
        label: 'Chord Notes Override',
        type: 'string',
        value: canon.harmony.single.notesOverride || '',
        placeholder: 'C#4:E4:G#4',
        helper: 'Optional. One chord only. Colon-separated notes (with octave) or MIDI numbers (e.g., 61:64:68). Overrides Chord Root/Quality.',
        onChange: value => updateParamsNormalized({
          harmony: {
            ...canon.harmony,
            single: { ...canon.harmony.single, notesOverride: value },
          },
        }),
      }));
      body.appendChild(buildTextarea({
        label: 'progressionCustom',
        value: canon.harmony.custom.roman || '',
        placeholder: 'i VII VI VII',
        helper: 'Enter roman numerals separated by spaces.',
        onChange: value => updateParamsNormalized({
          harmony: {
            ...canon.harmony,
            custom: { ...canon.harmony.custom, roman: value },
          },
        }),
      }));
      if (canon.pattern.mode === 'custom') {
        body.appendChild(buildCustomMelodyEditor());
      }
      return buildSection('Expert Overrides', body, { collapsible: true, defaultOpen: true });
    };

    const renderLegacySection = () => {
      if (!isLegacyOnly) {
        return null;
      }
      const body = document.createElement('div');
      body.className = 'flow-section-body';
      const legacyNote = document.createElement('div');
      legacyNote.className = 'flow-field-help';
      legacyNote.textContent = 'Legacy (v9.7) fields for older thoughts.';
      body.appendChild(legacyNote);
      const legacyFields = [
        { label: 'harmonyMode', key: 'harmonyMode' },
        { label: 'chordRoot', key: 'chordRoot' },
        { label: 'chordQuality', key: 'chordQuality' },
        { label: 'chordNotes', key: 'chordNotes' },
        { label: 'progressionPresetId', key: 'progressionPresetId' },
        { label: 'progressionVariantId', key: 'progressionVariantId' },
        { label: 'progressionLength', key: 'progressionLength' },
        { label: 'chordsPerBar', key: 'chordsPerBar' },
        { label: 'fillBehavior', key: 'fillBehavior' },
        { label: 'progressionCustom', key: 'progressionCustom' },
        { label: 'progressionCustomVariantStyle', key: 'progressionCustomVariantStyle' },
        { label: 'notePatternId', key: 'notePatternId' },
        { label: 'patternType', key: 'patternType' },
        { label: 'rhythmGrid', key: 'rhythmGrid' },
        { label: 'syncopation', key: 'syncopation' },
        { label: 'timingWarp', key: 'timingWarp' },
        { label: 'timingIntensity', key: 'timingIntensity', type: 'number' },
        { label: 'registerMin', key: 'registerMin', type: 'number' },
        { label: 'registerMax', key: 'registerMax', type: 'number' },
        { label: 'instrumentSoundfont', key: 'instrumentSoundfont' },
        { label: 'instrumentPreset', key: 'instrumentPreset' },
        { label: 'melodyMode', key: 'melodyMode' },
      ];
      legacyFields.forEach((field) => {
        body.appendChild(buildField({
          label: field.label,
          type: field.type || 'string',
          value: params[field.key] ?? '',
          onChange: value => updateParamsNormalized({ [field.key]: value }),
        }));
      });
      return buildSection('Legacy (v9.7)', body, { collapsible: true, defaultOpen: false });
    };

    const stack = document.createElement('div');
    stack.className = 'flow-inspector-form';
    stack.appendChild(buildPresetCodeHeader());
    stack.appendChild(renderViewModeSection());
    if (inspectorViewMode === 'beginner') {
      stack.appendChild(renderBeginnerPanel());
      stack.appendChild(renderAdvancedShell());
      stack.appendChild(renderPresetLibraryPanel());
    } else {
      stack.appendChild(renderThoughtCoreSection());
      stack.appendChild(renderThoughtStyleBasicsSection());
      if (inspectorViewMode === 'simple') {
        stack.appendChild(buildVoicePresetSection());
      } else if (inspectorViewMode === 'advanced') {
        stack.appendChild(renderThoughtAdvancedSection());
      } else {
        stack.appendChild(renderThoughtAdvancedSection());
        stack.appendChild(renderThoughtExpertOverridesSection());
        const legacySection = renderLegacySection();
        if (legacySection) {
          stack.appendChild(legacySection);
        }
      }
    }
    return stack;
  };

  const buildProgressionPreviewStrip = (preview) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'flow-progression-preview';

    const header = document.createElement('div');
    header.className = 'flow-progression-preview-title';
    header.textContent = 'Progression Preview';
    wrapper.appendChild(header);

    const rows = [
      { label: 'Bars', getter: bar => String(bar.index) },
      { label: 'Roman', getter: bar => bar.romans.join(' • ') },
      { label: 'Chords', getter: bar => bar.chords.join(' • ') },
    ];

    rows.forEach((row) => {
      const rowEl = document.createElement('div');
      rowEl.className = 'flow-progression-preview-row';
      const label = document.createElement('div');
      label.className = 'flow-progression-preview-label';
      label.textContent = row.label;
      rowEl.appendChild(label);
      const cells = document.createElement('div');
      cells.className = 'flow-progression-preview-cells';
      preview.bars.forEach((bar) => {
        const cell = document.createElement('div');
        cell.className = 'flow-progression-preview-cell';
        cell.textContent = row.getter(bar);
        cells.appendChild(cell);
      });
      rowEl.appendChild(cells);
      wrapper.appendChild(rowEl);
    });

    return wrapper;
  };

  const renderNode = (node, state) => {
    currentFocusScope = node?.id || 'node';
    content.innerHTML = '';
    const definition = getNodeDefinition(node.type);
    const title = document.createElement('div');
    title.className = 'flow-inspector-title';
    title.textContent = definition?.label || node.type;
    content.appendChild(title);

    const meta = document.createElement('div');
    meta.className = 'flow-inspector-meta';
    meta.textContent = `ID: ${node.id}`;
    content.appendChild(meta);

    if (node.type === 'switch') {
      content.appendChild(renderSwitchEditor(node, state));
    } else if (node.type === 'counter') {
      content.appendChild(renderCounterEditor(node));
    } else if (node.type === 'join') {
      content.appendChild(renderJoinEditor(node, state));
    } else if (node.type === 'thought') {
      content.appendChild(renderThoughtEditor(node));
    } else {
    const schema = definition?.paramSchema || {};
    const params = node.params || {};
    const fields = Object.keys(schema);
    if (fields.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'flow-inspector-empty';
      empty.textContent = 'No configurable parameters for this node.';
      content.appendChild(empty);
    } else {
      const form = document.createElement('div');
      form.className = 'flow-inspector-form';
      fields.forEach((key) => {
        const field = buildField({
          label: key,
          type: schema[key]?.type || 'string',
          value: params[key],
          onChange: (value) => {
            store.updateNode(node.id, {
              params: {
                ...params,
                [key]: value,
              },
            });
          },
        });
        form.appendChild(field);
      });
      content.appendChild(form);
    }
    }

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'flow-danger';
    deleteButton.textContent = 'Delete Node';
    deleteButton.addEventListener('click', () => {
      store.removeNode(node.id);
    });
    content.appendChild(deleteButton);
  };

  const renderEdge = (edge, nodeMap) => {
    currentFocusScope = edge?.id || 'edge';
    content.innerHTML = '';
    const title = document.createElement('div');
    title.className = 'flow-inspector-title';
    title.textContent = 'Edge';
    content.appendChild(title);
    const fromNode = nodeMap.get(edge.from.nodeId);
    const toNode = nodeMap.get(edge.to.nodeId);
    const details = document.createElement('div');
    details.className = 'flow-inspector-meta';
    details.textContent = `From ${fromNode?.type || edge.from.nodeId}:${edge.from.portId} → ${toNode?.type || edge.to.nodeId}:${edge.to.portId}`;
    content.appendChild(details);
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'flow-danger';
    deleteButton.textContent = 'Delete Edge';
    deleteButton.addEventListener('click', () => {
      store.removeEdge(edge.id);
    });
    content.appendChild(deleteButton);
  };

  const update = (state) => {
    const previousFocus = captureFocusState();
    let rendered = false;
    const selection = state.selection || { nodes: [], edges: [] };
    if (selection.nodes.length > 0) {
      const node = state.nodes.find(item => item.id === selection.nodes[0]);
      if (node) {
        renderNode(node, state);
        rendered = true;
      }
    }
    if (selection.edges.length > 0) {
      const edge = state.edges.find(item => item.id === selection.edges[0]);
      if (edge) {
        const nodeMap = new Map(state.nodes.map(node => [node.id, node]));
        renderEdge(edge, nodeMap);
        rendered = true;
      }
    }
    if (!rendered) {
      renderEmpty();
    }
    restoreFocusState(previousFocus);
  };

  loadPresets().finally(() => {
    update(store.getState());
  });
  update(store.getState());
  const unsubscribe = store.subscribe(update);

  return {
    element: panel,
    destroy: () => unsubscribe(),
  };
}
