import { HARMONY_PROGRESSIONS } from './harmonyCatalog.js';

const PROGRESSION_PRESETS = HARMONY_PROGRESSIONS.map((progression) => {
  const romans = parseRomanSequence(progression.romanTemplate);
  const defaultLength = progression.defaultLengthBars ?? romans.length;
  return {
    id: progression.id,
    name: progression.label,
    romans,
    defaultLength: defaultLength || 4,
    variants: (progression.variants || []).map(variant => ({
      id: variant.id,
      label: variant.label,
    })),
  };
});

const NOTE_TO_PC = {
  C: 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  F: 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11,
};

const PC_TO_NOTE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11];
const MINOR_SCALE = [0, 2, 3, 5, 7, 8, 10];
const HARMONIC_MINOR = [0, 2, 3, 5, 7, 8, 11];

export function getProgressionPresets() {
  return PROGRESSION_PRESETS.slice();
}

export function getProgressionPresetById(presetId) {
  return PROGRESSION_PRESETS.find(preset => preset.id === presetId) || null;
}

export function parseRomanSequence(raw) {
  if (!raw) {
    return [];
  }
  return raw
    .split(/[\s,]+/)
    .map(token => token.trim())
    .filter(Boolean);
}

export function normalizeProgressionLength(lengthValue, preset, romans) {
  if (lengthValue === 'preset' || lengthValue == null) {
    if (preset && Number.isFinite(preset.defaultLength)) {
      return preset.defaultLength;
    }
    return Math.max(1, romans.length || 1);
  }
  const numeric = Number(lengthValue);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return Math.max(1, romans.length || 1);
  }
  return numeric;
}

function parseKeySignature(raw) {
  const parts = String(raw || '').trim().split(/\s+/);
  const tonic = parts[0] || 'C';
  const mode = parts[1] ? parts[1].toLowerCase() : 'major';
  return { tonic, mode: mode === 'minor' ? 'minor' : 'major' };
}

function romanDegree(symbol) {
  const cleaned = symbol.toLowerCase().replace(/[^iv]/g, '');
  const romans = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii'];
  return romans.indexOf(cleaned);
}

function scaleForSymbol(key, symbol) {
  if (key.mode === 'minor' && symbol.trim().startsWith('V')) {
    return HARMONIC_MINOR;
  }
  return key.mode === 'major' ? MAJOR_SCALE : MINOR_SCALE;
}

function resolveRomanChord(key, symbol, variantStyle) {
  const degree = romanDegree(symbol);
  if (degree < 0) {
    return [];
  }
  const scale = scaleForSymbol(key, symbol);
  const triadDegrees = [degree, (degree + 2) % 7, (degree + 4) % 7];
  const pcs = triadDegrees.map(d => (NOTE_TO_PC[key.tonic] + scale[d]) % 12);
  if (variantStyle === '7ths' || variantStyle === '9ths_soft') {
    const seventh = (NOTE_TO_PC[key.tonic] + scale[(degree + 6) % 7]) % 12;
    pcs.push(seventh);
  }
  if (variantStyle === '9ths_soft') {
    const ninth = (NOTE_TO_PC[key.tonic] + scale[(degree + 1) % 7]) % 12;
    pcs.push(ninth);
  }
  return pcs;
}

function chordNameFromRoman(key, symbol, variantStyle) {
  const degree = romanDegree(symbol);
  if (degree < 0) {
    return '—';
  }
  const scale = scaleForSymbol(key, symbol);
  const rootPc = (NOTE_TO_PC[key.tonic] + scale[degree]) % 12;
  const rootName = PC_TO_NOTE[rootPc];
  const isMinor = symbol.trim().charAt(0) === symbol.trim().charAt(0).toLowerCase();
  let suffix = isMinor ? 'm' : '';
  if (variantStyle === '7ths') {
    suffix = isMinor ? 'm7' : '7';
  }
  if (variantStyle === '9ths_soft') {
    suffix = isMinor ? 'm9' : '9';
  }
  return `${rootName}${suffix}`;
}

export function buildProgressionPreview(params) {
  const durationBars = Math.max(1, Number(params.durationBars || 1));
  const chordsPerBar = String(params.chordsPerBar || '1');
  const harmonyMode = params.harmonyMode || 'single';
  if (harmonyMode === 'single') {
    return null;
  }

  let romans = [];
  let variantStyle = 'triads';
  let preset = null;
  if (harmonyMode === 'progression_preset') {
    preset = getProgressionPresetById(params.progressionPresetId);
    romans = preset?.romans || [];
    variantStyle = params.progressionVariantId || 'triads';
  } else {
    romans = parseRomanSequence(params.progressionCustom || '');
    variantStyle = params.progressionCustomVariantStyle || 'triads';
  }

  const lengthBars = normalizeProgressionLength(params.progressionLength, preset, romans);
  const slotsPerBar = chordsPerBar === '2' ? 2 : 1;
  const slotsPerProgression = Math.max(1, Math.ceil(lengthBars * (chordsPerBar === '0.5' ? 0.5 : slotsPerBar)));
  const slotsTotal = Math.max(1, Math.ceil(durationBars * (chordsPerBar === '0.5' ? 0.5 : slotsPerBar)));
  const fillBehavior = params.fillBehavior || 'repeat';

  const slotRomans = [];
  for (let i = 0; i < slotsPerProgression; i += 1) {
    if (romans.length === 0) {
      slotRomans.push('');
    } else {
      slotRomans.push(romans[i % romans.length]);
    }
  }

  const key = parseKeySignature(params.key || 'C major');
  const bars = [];
  for (let barIndex = 0; barIndex < durationBars; barIndex += 1) {
    const barRomans = [];
    const barChords = [];
    if (chordsPerBar === '2') {
      for (let slot = 0; slot < 2; slot += 1) {
        const slotIndex = barIndex * 2 + slot;
        const roman = resolveSlotRoman(slotIndex, slotRomans, slotsPerProgression, fillBehavior);
        barRomans.push(roman || '—');
        barChords.push(roman ? chordNameFromRoman(key, roman, variantStyle) : '—');
      }
    } else {
      const slotIndex = chordsPerBar === '0.5' ? Math.floor(barIndex / 2) : barIndex;
      const roman = resolveSlotRoman(slotIndex, slotRomans, slotsPerProgression, fillBehavior);
      barRomans.push(roman || '—');
      barChords.push(roman ? chordNameFromRoman(key, roman, variantStyle) : '—');
    }
    bars.push({
      index: barIndex + 1,
      romans: barRomans,
      chords: barChords,
    });
  }

  return {
    bars,
    variantStyle,
  };
}

function resolveSlotRoman(slotIndex, slotRomans, slotsPerProgression, fillBehavior) {
  if (slotIndex < slotsPerProgression) {
    return slotRomans[slotIndex];
  }
  if (fillBehavior === 'repeat') {
    return slotRomans[slotIndex % slotsPerProgression];
  }
  if (fillBehavior === 'hold_last') {
    return slotRomans[slotsPerProgression - 1];
  }
  return '';
}

export function resolveChordPitchClasses(params, romanSymbol) {
  const key = parseKeySignature(params.key || 'C major');
  const variantStyle = params.harmonyMode === 'progression_custom'
    ? (params.progressionCustomVariantStyle || 'triads')
    : (params.progressionVariantId || 'triads');
  return resolveRomanChord(key, romanSymbol, variantStyle);
}
