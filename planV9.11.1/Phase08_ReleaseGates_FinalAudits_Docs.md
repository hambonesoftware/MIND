# Phase 08 — Release Gates: Enforce Audits + Final Refactors

## Objective
Flip the quality gates to “strict”:
- Enforce max file length 1000 lines repo-wide
- Ensure no raw Intent/Compiled keys in wizard code
- Ensure contracts + immutables audits always pass
- Finish any remaining refactors (e.g., `frontend/src/main.js` if still too large)

## Changes

### A) Final refactors for file length
Run:
- `node scripts/audit_file_lengths.mjs`

Any file > 1000 lines must be split into multiple files based on separation of concerns.
Common offenders to address:
- `frontend/src/main.js`
- any remaining monolithic UI modules

### B) Lock in audits
Ensure these are all clean:
- contracts
- immutables
- no raw thought keys (wizard)
- no placeholders/truncation
- file lengths

## Tests that must be run (and pass)
From repo root:

- `node scripts/audit_contracts.mjs`
- `node scripts/audit_immutables.mjs`
- `node scripts/audit_no_raw_thought_keys.mjs`
- `node scripts/audit_no_placeholders.mjs`
- `node scripts/audit_file_lengths.mjs`
- `node scripts/test_style_catalog_coverage.mjs`
- `node scripts/test_style_resolver.mjs`
- `node scripts/test_pattern_variety_role_motion.mjs`
- `cd backend && python -m pytest -q`

## Success checklist
- ✅ No file in enforced scan paths exceeds 1000 lines
- ✅ Guided modal + preview works end-to-end
- ✅ Protocol export/import is stable and documented
- ✅ All audits/tests pass from a clean checkout
