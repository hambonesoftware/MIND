import { STYLE_METADATA_DEFAULTS } from '../state/nodeRegistry.js';

const LEGACY_DEFAULTS = {
  durationBars: 1,
  key: 'C# minor',
  chordRoot: 'C#',
  chordQuality: 'minor',
  chordNotes: '',
  harmonyMode: 'single',
  progressionPresetId: '',
  progressionVariantId: '',
  progressionLength: 'preset',
  chordsPerBar: '1',
  fillBehavior: 'repeat',
  progressionCustom: '',
  progressionCustomVariantStyle: 'triads',
  notePatternId: '',
  patternType: 'arp-3-up',
  rhythmGrid: '1/12',
  syncopation: 'none',
  timingWarp: 'none',
  timingIntensity: 0,
  registerMin: 48,
  registerMax: 84,
  instrumentSoundfont: '/assets/soundfonts/General-GS.sf2',
  instrumentPreset: 'gm:0:0',
  melodyMode: 'generated',
  customMelody: {
    grid: '1/16',
    bars: [],
  },
};

const isObject = (value) => Boolean(value && typeof value === 'object' && !Array.isArray(value));

const ensureArray = (value) => (Array.isArray(value) ? value : []);

const normalizeHarmonyMode = (mode) => {
  if (mode === 'progression_preset') {
    return 'preset';
  }
  if (mode === 'progression_custom') {
    return 'custom';
  }
  if (mode === 'preset' || mode === 'custom' || mode === 'single') {
    return mode;
  }
  return 'single';
};

const legacyHarmonyMode = (mode) => {
  if (mode === 'preset') {
    return 'progression_preset';
  }
  if (mode === 'custom') {
    return 'progression_custom';
  }
  return 'single';
};

export function normalizeMusicThoughtParams(rawParams = {}) {
  const params = rawParams || {};
  const durationBars = params.durationBars ?? LEGACY_DEFAULTS.durationBars;
  const key = params.key ?? LEGACY_DEFAULTS.key;

  const legacyCustomMelody = {
    grid: params.customMelody?.grid ?? LEGACY_DEFAULTS.customMelody.grid,
    bars: ensureArray(params.customMelody?.bars),
  };

  const styleFromLegacy = {
    id: params.styleId ?? STYLE_METADATA_DEFAULTS.styleId,
    seed: params.styleSeed ?? STYLE_METADATA_DEFAULTS.styleSeed,
    mood: {
      mode: params.moodMode ?? STYLE_METADATA_DEFAULTS.moodMode,
      id: params.moodId ?? STYLE_METADATA_DEFAULTS.moodId,
    },
    resolution: {
      modes: {
        ...(STYLE_METADATA_DEFAULTS.styleOptionModes || {}),
        ...(params.styleOptionModes || {}),
      },
      locks: { ...(params.styleOptionLocks || {}) },
      overrides: { ...(params.styleOptionOverrides || {}) },
    },
    ui: {
      dropdownViewPrefs: {
        ...(STYLE_METADATA_DEFAULTS.dropdownViewPrefs || {}),
        ...(params.dropdownViewPrefs || {}),
      },
    },
  };

  const styleInput = isObject(params.style) ? params.style : {};
  const style = {
    id: styleInput.id ?? styleFromLegacy.id,
    seed: styleInput.seed ?? styleFromLegacy.seed,
    mood: {
      mode: styleInput.mood?.mode ?? styleFromLegacy.mood.mode,
      id: styleInput.mood?.id ?? styleFromLegacy.mood.id,
    },
    resolution: {
      modes: {
        ...(styleFromLegacy.resolution.modes || {}),
        ...(styleInput.resolution?.modes || {}),
      },
      locks: {
        ...(styleFromLegacy.resolution.locks || {}),
        ...(styleInput.resolution?.locks || {}),
      },
      overrides: {
        ...(styleFromLegacy.resolution.overrides || {}),
        ...(styleInput.resolution?.overrides || {}),
      },
    },
    ui: {
      dropdownViewPrefs: {
        ...(styleFromLegacy.ui.dropdownViewPrefs || {}),
        ...(styleInput.ui?.dropdownViewPrefs || {}),
      },
    },
  };

  const harmonyFromLegacy = {
    mode: normalizeHarmonyMode(params.harmonyMode ?? LEGACY_DEFAULTS.harmonyMode),
    single: {
      root: params.chordRoot ?? LEGACY_DEFAULTS.chordRoot,
      quality: params.chordQuality ?? LEGACY_DEFAULTS.chordQuality,
      notesOverride: params.chordNotes ?? LEGACY_DEFAULTS.chordNotes,
    },
    preset: {
      id: params.progressionPresetId ?? LEGACY_DEFAULTS.progressionPresetId,
      variantId: params.progressionVariantId ?? LEGACY_DEFAULTS.progressionVariantId,
      chordsPerBar: params.chordsPerBar ?? LEGACY_DEFAULTS.chordsPerBar,
      fill: params.fillBehavior ?? LEGACY_DEFAULTS.fillBehavior,
      length: params.progressionLength ?? LEGACY_DEFAULTS.progressionLength,
    },
    custom: {
      roman: params.progressionCustom ?? LEGACY_DEFAULTS.progressionCustom,
      variantStyle: params.progressionCustomVariantStyle ?? LEGACY_DEFAULTS.progressionCustomVariantStyle,
      chordsPerBar: params.chordsPerBar ?? LEGACY_DEFAULTS.chordsPerBar,
      fill: params.fillBehavior ?? LEGACY_DEFAULTS.fillBehavior,
      length: params.progressionLength ?? LEGACY_DEFAULTS.progressionLength,
    },
  };

  const harmonyInput = isObject(params.harmony) ? params.harmony : {};
  const harmony = {
    mode: normalizeHarmonyMode(harmonyInput.mode ?? harmonyFromLegacy.mode),
    single: {
      ...harmonyFromLegacy.single,
      ...(harmonyInput.single || {}),
    },
    preset: {
      ...harmonyFromLegacy.preset,
      ...(harmonyInput.preset || {}),
    },
    custom: {
      ...harmonyFromLegacy.custom,
      ...(harmonyInput.custom || {}),
    },
  };

  const legacyPatternMode = (params.melodyMode ?? LEGACY_DEFAULTS.melodyMode) === 'custom'
    ? 'custom'
    : 'generated';
  const patternFromLegacy = {
    mode: legacyPatternMode,
    generated: {
      id: params.notePatternId ?? params.patternType ?? LEGACY_DEFAULTS.notePatternId,
    },
    custom: {
      grid: legacyCustomMelody.grid,
      bars: legacyCustomMelody.bars,
    },
  };
  const patternInput = isObject(params.pattern) ? params.pattern : {};
  const patternMode = patternInput.mode ?? patternFromLegacy.mode;
  const pattern = {
    mode: patternMode === 'custom' ? 'custom' : 'generated',
    generated: {
      ...patternFromLegacy.generated,
      ...(patternInput.generated || {}),
    },
    custom: {
      ...patternFromLegacy.custom,
      ...(patternInput.custom || {}),
    },
  };

  const feelFromLegacy = {
    mode: 'manual',
    presetId: '',
    manual: {
      grid: params.rhythmGrid ?? LEGACY_DEFAULTS.rhythmGrid,
      syncopation: params.syncopation ?? LEGACY_DEFAULTS.syncopation,
      warp: params.timingWarp ?? LEGACY_DEFAULTS.timingWarp,
      intensity: params.timingIntensity ?? LEGACY_DEFAULTS.timingIntensity,
    },
  };
  const feelInput = isObject(params.feel) ? params.feel : {};
  const feel = {
    mode: feelInput.mode ?? feelFromLegacy.mode,
    presetId: feelInput.presetId ?? feelFromLegacy.presetId,
    manual: {
      ...feelFromLegacy.manual,
      ...(feelInput.manual || {}),
    },
  };

  if (pattern.mode === 'custom' && feel.mode === 'manual' && !feel.manual.grid) {
    feel.manual.grid = pattern.custom?.grid || feel.manual.grid;
  }

  const voiceFromLegacy = {
    soundfont: params.instrumentSoundfont ?? LEGACY_DEFAULTS.instrumentSoundfont,
    preset: params.instrumentPreset ?? LEGACY_DEFAULTS.instrumentPreset,
    register: {
      min: params.registerMin ?? LEGACY_DEFAULTS.registerMin,
      max: params.registerMax ?? LEGACY_DEFAULTS.registerMax,
    },
  };
  const voiceInput = isObject(params.voice) ? params.voice : {};
  const voice = {
    soundfont: voiceInput.soundfont ?? voiceFromLegacy.soundfont,
    preset: voiceInput.preset ?? voiceFromLegacy.preset,
    register: {
      ...voiceFromLegacy.register,
      ...(voiceInput.register || {}),
    },
  };

  const activeHarmonySet = harmony.mode === 'custom' ? harmony.custom : harmony.preset;
  const rhythmGrid = feel.mode === 'manual'
    ? feel.manual.grid
    : (params.rhythmGrid ?? LEGACY_DEFAULTS.rhythmGrid);
  const syncopation = feel.mode === 'manual'
    ? feel.manual.syncopation
    : (params.syncopation ?? LEGACY_DEFAULTS.syncopation);
  const timingWarp = feel.mode === 'manual'
    ? feel.manual.warp
    : (params.timingWarp ?? LEGACY_DEFAULTS.timingWarp);
  const timingIntensity = feel.mode === 'manual'
    ? feel.manual.intensity
    : (params.timingIntensity ?? LEGACY_DEFAULTS.timingIntensity);

  return {
    durationBars,
    key,
    style,
    harmony,
    pattern,
    feel,
    voice,
    label: params.label ?? 'Thought',
    chordRoot: harmony.single.root ?? LEGACY_DEFAULTS.chordRoot,
    chordQuality: harmony.single.quality ?? LEGACY_DEFAULTS.chordQuality,
    chordNotes: harmony.single.notesOverride ?? LEGACY_DEFAULTS.chordNotes,
    harmonyMode: legacyHarmonyMode(harmony.mode),
    progressionPresetId: harmony.preset.id ?? LEGACY_DEFAULTS.progressionPresetId,
    progressionVariantId: harmony.preset.variantId ?? LEGACY_DEFAULTS.progressionVariantId,
    progressionLength: activeHarmonySet.length ?? LEGACY_DEFAULTS.progressionLength,
    chordsPerBar: activeHarmonySet.chordsPerBar ?? LEGACY_DEFAULTS.chordsPerBar,
    fillBehavior: activeHarmonySet.fill ?? LEGACY_DEFAULTS.fillBehavior,
    progressionCustom: harmony.custom.roman ?? LEGACY_DEFAULTS.progressionCustom,
    progressionCustomVariantStyle: harmony.custom.variantStyle ?? LEGACY_DEFAULTS.progressionCustomVariantStyle,
    notePatternId: pattern.generated.id ?? LEGACY_DEFAULTS.notePatternId,
    // Legacy: patternType remains internal for compatibility.
    patternType: params.patternType ?? pattern.generated.id ?? LEGACY_DEFAULTS.patternType,
    rhythmGrid: rhythmGrid ?? LEGACY_DEFAULTS.rhythmGrid,
    syncopation: syncopation ?? LEGACY_DEFAULTS.syncopation,
    timingWarp: timingWarp ?? LEGACY_DEFAULTS.timingWarp,
    timingIntensity: timingIntensity ?? LEGACY_DEFAULTS.timingIntensity,
    registerMin: voice.register.min ?? LEGACY_DEFAULTS.registerMin,
    registerMax: voice.register.max ?? LEGACY_DEFAULTS.registerMax,
    instrumentSoundfont: voice.soundfont ?? LEGACY_DEFAULTS.instrumentSoundfont,
    instrumentPreset: voice.preset ?? LEGACY_DEFAULTS.instrumentPreset,
    melodyMode: pattern.mode === 'custom' ? 'custom' : 'generated',
    customMelody: {
      grid: pattern.custom?.grid ?? legacyCustomMelody.grid,
      bars: ensureArray(pattern.custom?.bars),
    },
    thoughtStatus: params.thoughtStatus ?? 'draft',
    thoughtVersion: params.thoughtVersion ?? 1,
    styleId: style.id,
    styleSeed: style.seed,
    moodMode: style.mood.mode,
    moodId: style.mood.id,
    styleOptionModes: style.resolution.modes,
    styleOptionLocks: style.resolution.locks,
    styleOptionOverrides: style.resolution.overrides,
    dropdownViewPrefs: style.ui.dropdownViewPrefs,
    styleResolvedSignature: params.styleResolvedSignature ?? '',
  };
}
