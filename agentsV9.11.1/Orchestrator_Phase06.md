# Orchestrator — Phase 06: Canvas + Inspector Polish + Refactors

## Read first
- Plan file: `planV9.11.1/Phase06_CanvasInspector_Polish.md`

## Execution steps (minimal, exact)
1) Open the plan file and execute the **Changes** section top-to-bottom.
2) Copy templates exactly where instructed (no edits unless the plan requires).
3) Implement code deltas with small, separable commits if needed.
4) Run the required tests below **verbatim**.
5) Validate the success checklist (must be all ✅).
6) Commit: `v9.11.1 Phase06: Canvas + Inspector Polish + Refactors`

## Required tests (must pass)
- `MAX_LINES=1500 node scripts/audit_file_lengths.mjs`
- `node scripts/audit_no_placeholders.mjs`
- `node scripts/test_style_resolver.mjs`
- `cd backend && python -m pytest -q`

## Success checklist
- ☐ Thought nodes show summary chips + Edit
- ☐ Inspector is no longer a parameter dump
- ☐ flowInspector.js is reduced or replaced by modules

## Notes / common failure modes
- If any test fails, do not proceed. Fix and re-run.
- Keep new UI/audio code modular to avoid Phase08 file-length surprises.
