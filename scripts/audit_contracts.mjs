/**
 * scripts/audit_contracts.mjs
 *
 * Ensures docs/contracts JSON files exist and are parseable.
 */

import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const CONTRACT_DIR = path.join(ROOT, 'docs', 'contracts');

const REQUIRED_FILES = [
  'mind_thought_intent.contract.v1.json',
  'mind_thought_compiled.contract.v1.json',
  'mind_pattern.contract.v1.json',
  'mind_protocol_root.contract.v1.json',
];

const offenders = [];

for (const f of REQUIRED_FILES) {
  const p = path.join(CONTRACT_DIR, f);
  if (!fs.existsSync(p)) {
    offenders.push(`missing: ${p}`);
    continue;
  }
  try {
    const obj = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (!obj.contract || typeof obj.version !== 'number') {
      offenders.push(`invalid header fields: ${p}`);
    }
  } catch (err) {
    offenders.push(`invalid json: ${p} (${err.message})`);
  }
}

if (offenders.length) {
  console.error('audit_contracts failed:');
  for (const o of offenders) console.error(`- ${o}`);
  process.exit(1);
}

console.log('audit_contracts OK');
