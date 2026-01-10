# Orchestrator — Phase 05: Modal Preview Playback Bar (full Thought)

## Read first
- Plan file: `planV9.11.1/Phase05_ModalThoughtPreviewPlaybackBar.md`

## Execution steps (minimal, exact)
1) Open the plan file and execute the **Changes** section top-to-bottom.
2) Copy templates exactly where instructed (no edits unless the plan requires).
3) Implement code deltas with small, separable commits if needed.
4) Run the required tests below **verbatim**.
5) Validate the success checklist (must be all ✅).
6) Commit: `v9.11.1 Phase05: Modal Preview Playback Bar (full Thought)`

## Required tests (must pass)
- `node scripts/test_thought_preview_shape.mjs`
- `node scripts/audit_no_raw_thought_keys.mjs`
- `cd backend && python -m pytest -q`

## Success checklist
- ☐ Playback bar sits at top of modal
- ☐ Plays full Thought duration
- ☐ Stops cleanly on modal close

## Notes / common failure modes
- If any test fails, do not proceed. Fix and re-run.
- Keep new UI/audio code modular to avoid Phase08 file-length surprises.
