# Phase 00 — Baseline Integrity + Audits (non-blocking)

## Objective
Establish a repeatable baseline before UX/engine changes:
- Install audits (placeholders, file length) without enforcing new limits yet
- Add a canary graph and compile/runtime checks so regressions are visible

## Changes

### A) Install audits from templates
1) Copy these templates into your repo (same paths):
- `planV9.11.1/templates/scripts/audit_no_placeholders.mjs` → `scripts/audit_no_placeholders.mjs`
- `planV9.11.1/templates/scripts/audit_file_lengths.mjs` → `scripts/audit_file_lengths.mjs`

2) Do **not** change thresholds in this phase. We will enforce the strict 1000-line limit later.

### B) Add a canary graph for Thought compilation
Create:
- `docs/demos/v9.11/canary_thought_minimal.json`

This file should contain a minimal graph:
- Start → Thought → End
- The Thought should use *existing* V9.10 fields (do not add Intent yet).

### C) Add a backend test that compiles the canary graph
Create:
- `backend/tests/test_v9_11_canary_compile.py`

Test behavior:
- Load the JSON canary graph
- Call the compiler/graph runtime used by existing tests (reuse helpers from `test_compiler_graph.py` if present)
- Assert compilation succeeds and returns events for the Thought duration

## Tests that must be run (and pass)
From repo root:

1) Audits (smoke mode):
- `node scripts/audit_no_placeholders.mjs`
- `MAX_LINES=5000 node scripts/audit_file_lengths.mjs`

2) Frontend existing tests:
- `node scripts/test_style_catalog_coverage.mjs`
- `node scripts/test_style_resolver.mjs`

3) Backend tests:
- `cd backend && python -m pytest -q`

## Success checklist
- ✅ Canary JSON exists and is committed
- ✅ Canary backend test exists and passes
- ✅ Audits run successfully (file length in MAX_LINES=5000 mode)
