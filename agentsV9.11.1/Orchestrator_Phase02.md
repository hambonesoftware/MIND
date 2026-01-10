# Orchestrator — Phase 02: Intent/Compiled + Back-Compat + Truncation Test

## Read first
- Plan file: `planV9.11.1/Phase02_ThoughtIntentCompiled_BackCompat.md`

## Execution steps (minimal, exact)
1) Open the plan file and execute the **Changes** section top-to-bottom.
2) Copy templates exactly where instructed (no edits unless the plan requires).
3) Implement code deltas with small, separable commits if needed.
4) Run the required tests below **verbatim**.
5) Validate the success checklist (must be all ✅).
6) Commit: `v9.11.1 Phase02: Intent/Compiled + Back-Compat + Truncation Test`

## Required tests (must pass)
- `node scripts/test_no_truncated_preset_strings.mjs`
- `node scripts/audit_contracts.mjs`
- `node scripts/audit_immutables.mjs`
- `node scripts/audit_no_placeholders.mjs`
- `MAX_LINES=5000 node scripts/audit_file_lengths.mjs`
- `node scripts/test_style_resolver.mjs`
- `cd backend && python -m pytest -q`

## Success checklist
- ☐ Thought schema includes intent+compiled
- ☐ Old graphs still load and resolve
- ☐ No truncated preset strings remain

## Notes / common failure modes
- If any test fails, do not proceed. Fix and re-run.
- Keep new UI/audio code modular to avoid Phase08 file-length surprises.
