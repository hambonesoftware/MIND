# Phase 05 — Modal Preview Playback Bar (Top of Modal; Full Thought)

## Objective
Add a playback bar at the **top of the Thought wizard modal** that:
- Plays the full Thought (durationBars)
- Updates preview when the user changes steps (debounced)
- Stops/cleans up on modal close

## Changes

### A) Add a dedicated preview module (separation of concerns)
Create:
- `frontend/src/audio/thoughtPreview/`
  - `index.js` (public API)
  - `buildPreviewGraph.js` (Start→Thought→End mini-graph)
  - `schedulePreview.js` (engine scheduling + loop handling)

Keep wizard UI free of audio scheduling logic.

### B) Wire into the wizard modal
Edit:
- `frontend/src/ui/thoughtWizard/thoughtWizardModal.js`

Behavior:
- Play/Stop controls at top
- When playing, any committed step change triggers:
  - recompile
  - restart loop with updated compiled result
- Use Thought durationBars, not a fixed 2-bar loop.

### C) Add a preview-shape unit test
Create:
- `frontend/src/audio/thoughtPreview/__tests__/test_buildPreviewGraph.mjs` (node-run test)
and add a runner script:
- `scripts/test_thought_preview_shape.mjs`

Test:
- BuildPreviewGraph returns a valid graph object with Start/Thought/End and correct wiring.

## Tests that must be run (and pass)
From repo root:

- `node scripts/test_thought_preview_shape.mjs`
- `node scripts/audit_no_raw_thought_keys.mjs`
- `cd backend && python -m pytest -q`

## Success checklist
- ✅ Preview bar is at top of modal
- ✅ Plays full thought duration
- ✅ Clean stop on modal close (no hanging notes)
