/**
 * scripts/test_no_truncated_preset_strings.mjs
 *
 * Fails if any file contains a preset string starting with "MIND|" that also contains "..." (ellipsis).
 */

import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const SCAN_DIRS = [
  'frontend/src',
  'backend/mind_api',
];

const EXCLUDE_DIR_NAMES = new Set([
  'node_modules',
  'dist',
  'build',
  '__pycache__',
  '.venv',
  'venv',
  '.git',
]);

function shouldExclude(p) {
  const parts = p.split(path.sep);
  return parts.some(part => EXCLUDE_DIR_NAMES.has(part));
}

function walk(dir, out) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (shouldExclude(full)) continue;
    if (ent.isDirectory()) walk(full, out);
    else out.push(full);
  }
}

const offenders = [];
const re = /MIND\|[^\r\n]*\.\.\./;

for (const rel of SCAN_DIRS) {
  const dir = path.join(ROOT, rel);
  const files = [];
  walk(dir, files);
  for (const file of files) {
    if (!file.endsWith('.js') && !file.endsWith('.mjs') && !file.endsWith('.py')) continue;
    const content = fs.readFileSync(file, 'utf8');
    if (re.test(content)) offenders.push(file);
  }
}

if (offenders.length) {
  console.error('test_no_truncated_preset_strings failed. Offenders:');
  for (const f of offenders) console.error(`- ${f}`);
  process.exit(1);
}

console.log('test_no_truncated_preset_strings OK');
