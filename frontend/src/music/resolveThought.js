import { resolveThoughtStyle } from './styleResolver.js';
import { normalizeThoughtIntent } from './thoughtIntentNormalize.js';
import { RESOLVER_VERSION } from './immutables.js';

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

export function resolveMusicThought(canon, { nodeId = 'node' } = {}) {
  const style = canon.style || {};
  const mood = style.mood || {};
  const resolution = style.resolution || {};
  const intent = normalizeThoughtIntent(canon);
  const resolvedStyle = resolveThoughtStyle({
    styleId: intent.styleId,
    styleSeed: intent.seed,
    nodeId,
    locks: intent.locks || resolution.locks || {},
    overrides: resolution.overrides || {},
    modes: resolution.modes || {},
    moodMode: mood.mode || 'override',
    moodId: intent.moodId,
    role: intent.role,
    motionId: intent.motionId,
  });

  const harmonyMode = normalizeHarmonyMode(resolvedStyle.harmonyMode);
  const resolvedHarmony = {
    ...canon.harmony,
    mode: harmonyMode,
    preset: {
      ...canon.harmony.preset,
      id: resolvedStyle.progressionPresetId ?? canon.harmony.preset.id,
      variantId: resolvedStyle.progressionVariantId ?? canon.harmony.preset.variantId,
      chordsPerBar: resolvedStyle.chordsPerBar ?? canon.harmony.preset.chordsPerBar,
      fill: resolvedStyle.fillBehavior ?? canon.harmony.preset.fill,
      length: resolvedStyle.progressionLength ?? canon.harmony.preset.length,
    },
    custom: {
      ...canon.harmony.custom,
      roman: resolvedStyle.progressionCustom ?? canon.harmony.custom.roman,
      variantStyle: resolvedStyle.progressionCustomVariantStyle ?? canon.harmony.custom.variantStyle,
      chordsPerBar: resolvedStyle.chordsPerBar ?? canon.harmony.custom.chordsPerBar,
      fill: resolvedStyle.fillBehavior ?? canon.harmony.custom.fill,
      length: resolvedStyle.progressionLength ?? canon.harmony.custom.length,
    },
  };

  const resolvedPattern = {
    ...canon.pattern,
    mode: 'generated',
    generated: {
      ...canon.pattern.generated,
      id: resolvedStyle.notePatternId ?? canon.pattern.generated.id,
    },
  };

  const resolvedFeel = {
    ...canon.feel,
    mode: 'manual',
    manual: {
      ...canon.feel.manual,
      grid: resolvedStyle.rhythmGrid ?? canon.feel.manual.grid,
      syncopation: resolvedStyle.syncopation ?? canon.feel.manual.syncopation,
      warp: resolvedStyle.timingWarp ?? canon.feel.manual.warp,
      intensity: resolvedStyle.timingIntensity ?? canon.feel.manual.intensity,
    },
  };

  const resolvedVoice = {
    ...canon.voice,
    preset: resolvedStyle.instrumentPreset ?? canon.voice.preset,
    register: {
      ...canon.voice.register,
      min: resolvedStyle.registerMin ?? canon.voice.register.min,
      max: resolvedStyle.registerMax ?? canon.voice.register.max,
    },
  };

  const resolved = {
    ...canon,
    style: {
      ...canon.style,
      id: resolvedStyle.styleId ?? canon.style.id,
      seed: resolvedStyle.styleSeed ?? canon.style.seed,
      mood: {
        ...canon.style.mood,
        id: resolvedStyle.moodId ?? canon.style.mood.id,
      },
    },
    harmony: resolvedHarmony,
    pattern: resolvedPattern,
    feel: resolvedFeel,
    voice: resolvedVoice,
  };

  const compiled = {
    resolverVersion: RESOLVER_VERSION,
    notePatternId: resolvedStyle.notePatternId,
    rhythmGrid: resolvedStyle.rhythmGrid,
    syncopation: resolvedStyle.syncopation,
    timingWarp: resolvedStyle.timingWarp,
    timingIntensity: resolvedStyle.timingIntensity,
    instrumentPreset: resolvedStyle.instrumentPreset,
    registerMin: resolvedStyle.registerMin,
    registerMax: resolvedStyle.registerMax,
    presetCode: canon.compiled?.presetCode ?? canon.compiledPresetCode ?? canon.presetCode ?? '',
    artifact: canon.compiled?.artifact ?? canon.compiledArtifact ?? {},
  };

  return {
    resolved,
    flat: {
      styleId: resolvedStyle.styleId,
      styleSeed: resolvedStyle.styleSeed,
      moodId: resolvedStyle.moodId,
      harmonyMode: resolvedStyle.harmonyMode,
      progressionPresetId: resolvedStyle.progressionPresetId,
      progressionVariantId: resolvedStyle.progressionVariantId,
      progressionLength: resolvedStyle.progressionLength,
      chordsPerBar: resolvedStyle.chordsPerBar,
      fillBehavior: resolvedStyle.fillBehavior,
      progressionCustom: resolvedStyle.progressionCustom,
      progressionCustomVariantStyle: resolvedStyle.progressionCustomVariantStyle,
      notePatternId: resolvedStyle.notePatternId,
      patternType: resolvedStyle.patternType,
      rhythmGrid: resolvedStyle.rhythmGrid,
      syncopation: resolvedStyle.syncopation,
      timingWarp: resolvedStyle.timingWarp,
      timingIntensity: resolvedStyle.timingIntensity,
      instrumentPreset: resolvedStyle.instrumentPreset,
      registerMin: resolvedStyle.registerMin,
      registerMax: resolvedStyle.registerMax,
    },
    intent,
    compiled,
  };
}
