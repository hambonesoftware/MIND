# Orchestrator — Phase 08: Release Gates: strict audits + file length <= 1000

## Read first
- Plan file: `planV9.11.1/Phase08_ReleaseGates_FinalAudits_Docs.md`

## Execution steps (minimal, exact)
1) Open the plan file and execute the **Changes** section top-to-bottom.
2) Copy templates exactly where instructed (no edits unless the plan requires).
3) Implement code deltas with small, separable commits if needed.
4) Run the required tests below **verbatim**.
5) Validate the success checklist (must be all ✅).
6) Commit: `v9.11.1 Phase08: Release Gates: strict audits + file length <= 1000`

## Required tests (must pass)
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
- ☐ No file exceeds 1000 lines in scan paths
- ☐ All audits/tests pass from clean checkout
- ☐ Guided modal + full-thought preview works end-to-end
- ☐ Protocol export/import documented and stable

## Notes / common failure modes
- If any test fails, do not proceed. Fix and re-run.
- Keep new UI/audio code modular to avoid Phase08 file-length surprises.
