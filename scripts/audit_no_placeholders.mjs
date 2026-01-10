/**
 * scripts/audit_no_placeholders.mjs
 *
 * Fails if placeholder-only files or ellipsis-only lines exist in key source folders.
 * NOTE: This audit intentionally avoids flagging legitimate JS spread/rest operators.
 */

import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const SCAN_DIRS = [
  'frontend/src/music',
  'frontend/src/state',
  'frontend/src/ui',
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

function isTextFile(filePath) {
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
    if (!isTextFile(file)) continue;
    const content = fs.readFileSync(file, 'utf8');
    const trimmed = content.trim();
    if (trimmed === '...' || trimmed === '// placeholder' || trimmed === '# placeholder') {
      offenders.push({ file, reason: 'placeholder-only file content' });
      continue;
    }
    const lines = content.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^\s*\.\.\.\s*$/.test(line)) {
        offenders.push({ file, reason: `ellipsis-only line at ${i + 1}` });
        break;
      }
      if (/^\s*(TODO|FIXME)\s*:\s*placeholder\s*$/i.test(line)) {
        offenders.push({ file, reason: `explicit placeholder TODO at ${i + 1}` });
        break;
      }
    }
  }
}

if (offenders.length) {
  console.error('audit_no_placeholders failed. Offenders:');
  for (const o of offenders) {
    console.error(`- ${o.file}: ${o.reason}`);
  }
  process.exit(1);
}

console.log('audit_no_placeholders OK');
