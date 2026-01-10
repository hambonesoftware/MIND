# Phase 01 — Contracts + Immutables Foundation (with templates)

## Objective
Install the **Contracts + Immutables** system so the guided builder + protocol are stable, minimal, and exact.

This phase creates:
- Versioned contracts in `docs/contracts/`
- Canonical key maps (immutables) in frontend + backend
- Audits to keep them synchronized and to prevent raw-string drift

## Changes

### A) Copy contract templates
Copy the entire folder:
- `planV9.11.1/templates/contracts/` → `docs/contracts/`

You must end up with:
- `docs/contracts/README.md`
- `docs/contracts/mind_thought_intent.contract.v1.json`
- `docs/contracts/mind_thought_compiled.contract.v1.json`
- `docs/contracts/mind_pattern.contract.v1.json`
- `docs/contracts/mind_protocol_root.contract.v1.json`

### B) Copy immutables templates
Copy:
- `planV9.11.1/templates/immutables/frontend/src/music/immutables.js` → `frontend/src/music/immutables.js`
- `planV9.11.1/templates/immutables/backend/mind_api/mind_core/immutables.py` → `backend/mind_api/mind_core/immutables.py`

Important:
- Do not rename keys. If you need new keys later, add them in a forward-compatible way and update the contracts deliberately.

### C) Add audits from templates
Copy:
- `planV9.11.1/templates/scripts/audit_contracts.mjs` → `scripts/audit_contracts.mjs`
- `planV9.11.1/templates/scripts/audit_immutables.mjs` → `scripts/audit_immutables.mjs`
- `planV9.11.1/templates/scripts/audit_no_raw_thought_keys.mjs` → `scripts/audit_no_raw_thought_keys.mjs`

## Tests that must be run (and pass)
From repo root:

1) Contract + immutables audits:
- `node scripts/audit_contracts.mjs`
- `node scripts/audit_immutables.mjs`

2) Baseline tests (repeat):
- `node scripts/audit_no_placeholders.mjs`
- `MAX_LINES=5000 node scripts/audit_file_lengths.mjs`
- `node scripts/test_style_catalog_coverage.mjs`
- `node scripts/test_style_resolver.mjs`
- `cd backend && python -m pytest -q`

## Success checklist
- ✅ All contract files exist and parse as JSON
- ✅ Both immutables files exist and include Intent/Compiled key maps
- ✅ `audit_contracts` and `audit_immutables` pass
