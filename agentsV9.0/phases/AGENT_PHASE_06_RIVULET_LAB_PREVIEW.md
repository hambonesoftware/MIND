# AGENT PHASE 06 — Rivulet Lab Preview UI (Docked Thought Lab)

Plan reference: `phases/PHASE_06_RIVULET_LAB_PREVIEW.md`

## Goal
Add the Rivulet Lab Preview UI physically above the Stream canvas to audition and validate a selected Thought before using it in operation.

## Primary touch-points (MINDV8.0)
Frontend:
- `frontend/src/ui/app.js` (layout)
- `frontend/src/ui/flowCanvas.js` (selection integration)
- `frontend/src/ui/executionsPanel.js` (optional trace)
- New: `frontend/src/ui/rivuletLab.js` (recommended)
Audio:
- `frontend/src/audio/transport.js` (preview transport mode)

## Step-by-step actions
1) Add docked strip above canvas with collapsed/expanded modes.
2) When a Thought is selected, populate:
   - play/stop, loop, preview bars
   - mini visualization (steps/contour)
   - harness overrides (tempo/key/chord/progression/register/seed/instrument)
3) Implement readiness checks:
   - in range, in key, no stuck notes, event count sane, deterministic if seed locked
4) Add “Draft/Published” and Publish action (lightweight):
   - draft badge, publish button enabled when checks pass or user overrides warnings
5) Ensure preview does not mutate Stream runtime state unless explicitly applied.

## Evidence to capture
- Screenshot: rivulet docked above canvas (collapsed + expanded)
- Screenshot: mini visualization showing onsets for Moonlight arp
- Proof: preview uses selected Thought and plays audio

## Completion checklist (must be explicit)
- [ ] Rivulet exists and is docked above Stream
- [ ] Selecting a Thought loads it into the rivulet
- [ ] Preview plays audio and updates visualization
- [ ] Readiness checks run and display pass/warn/fail
- [ ] Publish workflow exists (at least draft→published toggle + version note)


## Notes / Decisions (append as you work)
- 
