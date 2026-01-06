import assert from 'node:assert/strict';
import { resolveThoughtStyle } from '../frontend/src/music/styleResolver.js';
import { STYLE_CATALOG } from '../frontend/src/music/styleCatalog.js';

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

function runDeterminismTest() {
  const base = { styleId: STYLE_CATALOG[0].id, styleSeed: 42, nodeId: 'node-1' };
  const first = resolveThoughtStyle(base);
  for (let i = 0; i < 50; i += 1) {
    const next = resolveThoughtStyle(base);
    if (!deepEqual(first, next)) {
      printFailure('Resolver returned different outputs for identical inputs', stringify({ first, next }));
    }
  }
}

function runSeedVarianceTest() {
  const base = { styleId: STYLE_CATALOG[0].id, styleSeed: 100, nodeId: 'node-1' };
  const a = resolveThoughtStyle(base);
  const b = resolveThoughtStyle({ ...base, styleSeed: 101 });
  try {
    requireDifference(a, b, 'Outputs should differ when seeds change');
  } catch (error) {
    printFailure(error.message, stringify({ a, b }));
  }
}

function runLocksTest() {
  const base = { styleId: STYLE_CATALOG[1].id, styleSeed: 7, nodeId: 'node-lock' };
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
  const base = { styleId: STYLE_CATALOG[2].id, styleSeed: 3, nodeId: 'node-override' };
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

function main() {
  try {
    runDeterminismTest();
    runSeedVarianceTest();
    runLocksTest();
    runOverridesTest();
  } catch (error) {
    printFailure(error.message);
  }
  console.log('All style resolver tests passed');
}

main();
