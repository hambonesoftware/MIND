# Orchestrator — Phase 04: Guided Thought Wizard Modal (Option B)

## Read first
- Plan file: `planV9.11.1/Phase04_GuidedThoughtWizardModal.md`

## Execution steps (minimal, exact)
1) Open the plan file and execute the **Changes** section top-to-bottom.
2) Copy templates exactly where instructed (no edits unless the plan requires).
3) Implement code deltas with small, separable commits if needed.
4) Run the required tests below **verbatim**.
5) Validate the success checklist (must be all ✅).
6) Commit: `v9.11.1 Phase04: Guided Thought Wizard Modal (Option B)`

## Required tests (must pass)
- `node scripts/audit_no_raw_thought_keys.mjs`
- `node scripts/audit_contracts.mjs`
- `node scripts/audit_immutables.mjs`
- `node scripts/test_style_resolver.mjs`
- `cd backend && python -m pytest -q`

## Success checklist
- ☐ Insert Thought opens wizard modal
- ☐ Wizard commits valid intent
- ☐ Edit Thought reopens wizard
- ☐ No raw key strings in wizard files

## Notes / common failure modes
- If any test fails, do not proceed. Fix and re-run.
- Keep new UI/audio code modular to avoid Phase08 file-length surprises.
