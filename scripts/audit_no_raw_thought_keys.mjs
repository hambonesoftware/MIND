/**
 * scripts/audit_no_raw_thought_keys.mjs
 *
 * Enforces: wizard code must not contain raw string literals for the Intent/Compiled keys.
 * Scope is intentionally limited to the wizard folder to avoid massive refactors.
 */

import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const WIZ_DIR = path.join(ROOT, 'frontend', 'src', 'ui', 'thoughtWizard');

const FORBIDDEN_LITERALS = [
  "'intent'", '"intent"',
  "'compiled'", '"compiled"',
  "'goal'", '"goal"',
  "'role'", '"role"',
  "'styleId'", '"styleId"',
  "'moodId'", '"moodId"',
  "'motionId'", '"motionId"',
  "'density'", '"density"',
  "'harmonyBehavior'", '"harmonyBehavior"',
  "'soundColor'", '"soundColor"',
  "'seed'", '"seed"',
  "'locks'", '"locks"',
  "'resolverVersion'", '"resolverVersion"',
  "'notePatternId'", '"notePatternId"',
];

function walk(dir, out) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full, out);
    else out.push(full);
  }
}

const files = [];
walk(WIZ_DIR, files);

if (!files.length) {
  console.log('audit_no_raw_thought_keys OK (no wizard files yet)');
  process.exit(0);
}

const offenders = [];
for (const file of files) {
  if (!file.endsWith('.js') && !file.endsWith('.mjs')) continue;
  const content = fs.readFileSync(file, 'utf8');
  for (const lit of FORBIDDEN_LITERALS) {
    if (content.includes(lit)) {
      offenders.push({ file, lit });
      break;
    }
  }
}

if (offenders.length) {
  console.error('audit_no_raw_thought_keys failed:');
  for (const o of offenders) console.error(`- ${o.file}: contains ${o.lit}`);
  console.error('Use imports from frontend/src/music/immutables.js instead.');
  process.exit(1);
}

console.log('audit_no_raw_thought_keys OK');
