/**
 * scripts/test_pattern_variety_role_motion.mjs
 *
 * Samples resolver outputs across roles/motions to prevent "everything becomes 3 arps".
 *
 * This is a heuristic test: tune thresholds as the catalog grows.
 */

import path from 'path';

const ROOT = process.cwd();
const resolverPath = path.join(ROOT, 'frontend', 'src', 'music', 'styleResolver.js');
const { resolveThoughtStyle } = await import(resolverPath);

const CASES = [
  { styleId: 'pop', moodId: 'default', role: 'bass', motionId: 'walking' },
  { styleId: 'pop', moodId: 'default', role: 'harmony', motionId: 'punchy' },
  { styleId: 'classical_film', moodId: 'default', role: 'lead', motionId: 'flowing' },
];

const SAMPLES = 30;
const MIN_UNIQUE = 6;
const MAX_ARP_RATIO_BASS_HARM = 0.35;

function isArp(id) {
  return String(id || '').startsWith('arp-');
}

let failures = [];

for (const c of CASES) {
  const ids = [];
  for (let seed = 1; seed <= SAMPLES; seed++) {
    const res = resolveThoughtStyle({
      styleId: c.styleId,
      styleSeed: seed,
      moodId: c.moodId,
      nodeId: `test-${seed}`,
      locks: {},
      overrides: {},
      modes: {},
      // These fields must be added by Phase 03:
      role: c.role,
      motionId: c.motionId,
    });
    ids.push(res.notePatternId || '');
  }

  const unique = new Set(ids.filter(Boolean));
  if (unique.size < MIN_UNIQUE) {
    failures.push(`${c.styleId}/${c.role}/${c.motionId}: unique=${unique.size} < ${MIN_UNIQUE}`);
  }

  if (c.role === 'bass' || c.role === 'harmony') {
    const arpCount = ids.filter(isArp).length;
    const ratio = arpCount / ids.length;
    if (ratio > MAX_ARP_RATIO_BASS_HARM) {
      failures.push(`${c.styleId}/${c.role}/${c.motionId}: arpRatio=${ratio.toFixed(2)} > ${MAX_ARP_RATIO_BASS_HARM}`);
    }
  }
}

if (failures.length) {
  console.error('test_pattern_variety_role_motion failed:');
  for (const f of failures) console.error(`- ${f}`);
  process.exit(1);
}

console.log('test_pattern_variety_role_motion OK');
