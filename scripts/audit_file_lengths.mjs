/**
 * scripts/audit_file_lengths.mjs
 *
 * Usage:
 *   MAX_LINES=5000 node scripts/audit_file_lengths.mjs   (smoke)
 *   node scripts/audit_file_lengths.mjs                  (strict, default 1000)
 *
 * Scans source folders and fails if any file exceeds MAX_LINES.
 */

import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const MAX_LINES = Number(process.env.MAX_LINES || '1000');

const SCAN_DIRS = [
  'frontend/src',
  'backend/mind_api',
  'scripts',
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

function isCounted(filePath) {
  return (
    filePath.endsWith('.js') ||
    filePath.endsWith('.mjs') ||
    filePath.endsWith('.ts') ||
    filePath.endsWith('.css') ||
    filePath.endsWith('.svelte') ||
    filePath.endsWith('.py') ||
    filePath.endsWith('.json') ||
    filePath.endsWith('.md')
  );
}

const offenders = [];
for (const relDir of SCAN_DIRS) {
  const dir = path.join(ROOT, relDir);
  const files = [];
  walk(dir, files);
  for (const file of files) {
    if (!isCounted(file)) continue;
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split(/\r?\n/).length;
    if (lines > MAX_LINES) offenders.push({ file, lines });
  }
}

offenders.sort((a, b) => b.lines - a.lines);

if (offenders.length) {
  console.error(`audit_file_lengths failed. MAX_LINES=${MAX_LINES}`);
  for (const o of offenders.slice(0, 50)) {
    console.error(`- ${o.lines} lines: ${o.file}`);
  }
  if (offenders.length > 50) {
    console.error(`...and ${offenders.length - 50} more`);
  }
  process.exit(1);
}

console.log(`audit_file_lengths OK (MAX_LINES=${MAX_LINES})`);
