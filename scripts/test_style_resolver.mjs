import assert from 'node:assert/strict';
import { resolveThoughtStyle, buildStyleOptionSets } from '../frontend/src/music/styleResolver.js';
import { STYLE_CATALOG } from '../frontend/src/music/styleCatalog.js';
import { getMoodsForStyle } from '../frontend/src/music/moodCatalog.js';

function deepEqual(a, b) {
  try {
    assert.deepStrictEqual(a, b);
    return true;
  } catch (error) {
    return false;
  }
}

function requireDifference(a, b, label) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of keys) {
    if (!deepEqual(a[key], b[key])) {
      return;
    }
  }
  throw new Error(label || 'Expected at least one differing field');
}

function printFailure(message, details) {
  console.error('\n[FAIL]', message);
  if (details) {
    console.error(details);
  }
  process.exit(1);
}

function stringify(obj) {
  return JSON.stringify(obj, null, 2);
}

function resolveBaseStyle(index = 0) {
  const style = STYLE_CATALOG.find(item => item.id !== 'legacy' && item.id) || STYLE_CATALOG[index];
  return style?.id;
}

function runDeterminismTest() {
  const base = { styleId: resolveBaseStyle(), styleSeed: 42, nodeId: 'node-1', moodMode: 'auto' };
  const first = resolveThoughtStyle(base);
  for (let i = 0; i < 50; i += 1) {
    const next = resolveThoughtStyle(base);
    if (!deepEqual(first, next)) {
      printFailure('Resolver returned different outputs for identical inputs', stringify({ first, next }));
    }
  }
}

function runSeedVarianceTest() {
  const base = { styleId: resolveBaseStyle(), styleSeed: 100, nodeId: 'node-1', moodMode: 'override', moodId: 'none' };
  const a = resolveThoughtStyle(base);
  const b = resolveThoughtStyle({ ...base, styleSeed: 101 });
  try {
    requireDifference(a, b, 'Outputs should differ when seeds change');
  } catch (error) {
    printFailure(error.message, stringify({ a, b }));
  }
}

function runLocksTest() {
  const base = { styleId: STYLE_CATALOG.find(style => style.id !== 'legacy')?.id, styleSeed: 7, nodeId: 'node-lock', moodMode: 'auto' };
  const initial = resolveThoughtStyle(base);
  const locks = {
    progressionPresetId: initial.progressionPresetId,
    progressionVariantId: initial.progressionVariantId,
    notePatternId: initial.notePatternId,
    patternType: initial.patternType,
    rhythmGrid: initial.rhythmGrid,
  };
  const reroll = resolveThoughtStyle({ ...base, styleSeed: 7007, locks });
  const lockedKeys = Object.keys(locks);
  for (const key of lockedKeys) {
    if (!deepEqual(initial[key], reroll[key])) {
      printFailure(`Lock did not hold for field ${key}`, stringify({ initial, reroll, key }));
    }
  }
}

function runOverridesTest() {
  const base = { styleId: STYLE_CATALOG.find(style => style.id !== 'legacy')?.id, styleSeed: 3, nodeId: 'node-override', moodMode: 'auto' };
  const overrides = {
    timingWarp: 'swing',
    timingIntensity: 0.75,
    registerMin: 44,
    registerMax: 92,
  };
  const first = resolveThoughtStyle({ ...base, overrides });
  const reroll = resolveThoughtStyle({ ...base, styleSeed: 999, overrides });
  for (const key of Object.keys(overrides)) {
    if (!deepEqual(first[key], overrides[key]) || !deepEqual(reroll[key], overrides[key])) {
      printFailure(`Override did not hold for field ${key}`, stringify({ first, reroll, key }));
    }
  }
}

function runMoodAutoTest() {
  const styleId = resolveBaseStyle();
  const base = { styleId, styleSeed: 22, nodeId: 'mood-auto', moodMode: 'auto' };
  const first = resolveThoughtStyle(base);
  const second = resolveThoughtStyle(base);
  if (first.moodId !== second.moodId || first.resolvedMoodId !== second.resolvedMoodId) {
    printFailure('Auto mood did not remain stable for identical seeds', stringify({ first, second }));
  }
  const variantSeed = resolveThoughtStyle({ ...base, styleSeed: 23 });
  if (!getMoodsForStyle(styleId).some(mood => mood.id === variantSeed.moodId)) {
    printFailure('Auto mood selection produced unknown mood', stringify({ variantSeed }));
  }
}

function runViewIndependenceTest() {
  const styleId = resolveBaseStyle();
  const moods = getMoodsForStyle(styleId).filter(mood => mood.id !== 'none');
  const targetMood = moods[0];
  const context = buildStyleOptionSets({ styleId, moodId: targetMood?.id, moodMode: 'override', styleSeed: 5, nodeId: 'view' });
  const allProgressions = context.optionSets.progressions.all || [];
  const recommendedIds = new Set((context.optionSets.progressions.recommended || []).map(item => item.id));
  const nonRecommended = allProgressions.find(item => !recommendedIds.has(item.id)) || allProgressions[0];
  const overrides = { progressionPresetId: nonRecommended?.id };
  const resolved = resolveThoughtStyle({ styleId, styleSeed: 5, nodeId: 'view', overrides, moodMode: 'override', moodId: targetMood?.id });
  if (nonRecommended && resolved.progressionPresetId !== nonRecommended.id) {
    printFailure('Override selection changed when using non-recommended option', stringify({ nonRecommended, resolved }));
  }
}

function main() {
  try {
    runDeterminismTest();
    runSeedVarianceTest();
    runLocksTest();
    runOverridesTest();
    runMoodAutoTest();
    runViewIndependenceTest();
  } catch (error) {
    printFailure(error.message);
  }
  console.log('All style resolver tests passed');
}

main();
