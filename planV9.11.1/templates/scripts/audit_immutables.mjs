/**
 * scripts/audit_immutables.mjs
 *
 * Compares frontend immutables to backend immutables via a Python subprocess.
 * Fails if key sets diverge.
 */

import path from 'path';
import { spawnSync } from 'child_process';

const ROOT = process.cwd();

// Frontend immutables (ESM import)
const immPath = path.join(ROOT, 'frontend', 'src', 'music', 'immutables.js');
const imm = await import(immPath);

function getFrontendSnapshot() {
  return {
    PROTOCOL_VERSION: imm.PROTOCOL_VERSION,
    GRAPH_VERSION: imm.GRAPH_VERSION,
    RESOLVER_VERSION: imm.RESOLVER_VERSION,
    THOUGHT_INTENT_KEYS: imm.THOUGHT_INTENT_KEYS,
    THOUGHT_COMPILED_KEYS: imm.THOUGHT_COMPILED_KEYS,
  };
}

function getBackendSnapshot() {
  const py = [
    'python',
    '-c',
    [
      "import sys, json",
      "sys.path.insert(0, 'backend')",
      "from mind_api.mind_core.immutables import dump_immutables",
      "print(json.dumps(dump_immutables(), sort_keys=True))",
    ].join('; ')
  ];
  const res = spawnSync(py[0], py.slice(1), { encoding: 'utf8' });
  if (res.status !== 0) {
    console.error(res.stderr || res.stdout);
    throw new Error('backend immutables dump failed');
  }
  return JSON.parse(res.stdout);
}

function stableStringify(obj) {
  return JSON.stringify(obj, Object.keys(obj).sort(), 2);
}

const fe = getFrontendSnapshot();
const be = getBackendSnapshot();

const diffs = [];

for (const k of ['PROTOCOL_VERSION', 'GRAPH_VERSION', 'RESOLVER_VERSION']) {
  if (String(fe[k]) !== String(be[k])) diffs.push(`${k} mismatch: fe=${fe[k]} be=${be[k]}`);
}

function compareKeyMap(name) {
  const feMap = fe[name];
  const beMap = be[name];
  const feKeys = Object.keys(feMap).sort();
  const beKeys = Object.keys(beMap).sort();
  if (stableStringify(feKeys) !== stableStringify(beKeys)) {
    diffs.push(`${name} key-set mismatch`);
    return;
  }
  for (const kk of feKeys) {
    if (String(feMap[kk]) !== String(beMap[kk])) {
      diffs.push(`${name}.${kk} mismatch: fe=${feMap[kk]} be=${beMap[kk]}`);
    }
  }
}

compareKeyMap('THOUGHT_INTENT_KEYS');
compareKeyMap('THOUGHT_COMPILED_KEYS');

if (diffs.length) {
  console.error('audit_immutables failed:');
  for (const d of diffs) console.error(`- ${d}`);
  process.exit(1);
}

console.log('audit_immutables OK');
