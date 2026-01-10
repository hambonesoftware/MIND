# RUNBOOK_Codex.md — Orchestrated execution of planV9.11.1

## Global rules (must follow)
1) **Use templates** from `planV9.11.1/templates/` exactly (copy first, then edit only if required).
2) **No raw Intent/Compiled key strings** inside the wizard folder:
   - Use `frontend/src/music/immutables.js`
3) **Contracts are immutable**:
   - Never rename/remove keys in contract JSON
   - Only add optional fields or extend enums when required, and update audits accordingly
4) **Separation of concerns**:
   - Wizard step = one file per step (target <300 LOC each)
   - Audio preview logic lives in `frontend/src/audio/thoughtPreview/*`
5) **Stop on red**:
   - If a phase test fails, fix it before moving on.

## Standard execution pattern per phase
- Open the phase plan file in planV9.11.1/
- Apply code changes
- Run the phase test commands verbatim
- Verify success checklist
- Commit with message: `v9.11.1 PhaseXX: <short summary>`

## Standard commands
From repo root:
- `node scripts/audit_no_placeholders.mjs`
- `MAX_LINES=5000 node scripts/audit_file_lengths.mjs` (smoke)
- `node scripts/audit_contracts.mjs`
- `node scripts/audit_immutables.mjs`
- `node scripts/audit_no_raw_thought_keys.mjs`
- `node scripts/test_style_catalog_coverage.mjs`
- `node scripts/test_style_resolver.mjs`
- `cd backend && python -m pytest -q`
