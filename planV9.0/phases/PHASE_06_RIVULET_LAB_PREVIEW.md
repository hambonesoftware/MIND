# PHASE 06 — Lab Preview “Rivulet” (Thought Bench Testing)

Agent: `AGENT_V9_PHASE06_RIVULET_LAB` (assumed to exist in agentsV9.0.zip)

## Objective
Add a compact Lab Preview UI (“Rivulet”) docked above the Stream canvas to audition the selected Thought before using/publishing it.

## Rivulet requirements (from spec)
- Docked strip above canvas; collapsible
- Shows selected Thought chip + Draft/Published badge
- Preview transport: play/stop/loop + bars selector
- Harness overrides (inherit by default):
  - tempo, key/chord source, bars, register, seed, soundfont + instrument
- Mini visualization: step strip + optional pitch contour
- Readiness checks (icons): in-range, in-key, no stuck notes, event spam, determinism
- Publish: Draft → Published + version tag (pinning)

## Current V8 anchors
UI:
- `frontend/src/ui/app.js`
- `frontend/src/ui/transportBar.js`
- `frontend/src/ui/stepStrip.js`
- `frontend/src/ui/flowCanvas.js`

State:
- `frontend/src/state/store.js` / `session.js` / `graphStore.js`

## Instructions
1. Add a new UI component (suggested):
   - `frontend/src/ui/rivuletLab.js`
   - Mounted above the canvas in `app.js`
2. Connect rivulet to selection:
   - When a Thought node is selected on canvas, rivulet targets it
   - Provide “Pin” to keep target stable
3. Implement preview pipeline:
   - Rivulet requests a preview compile for ONLY the selected Thought using harness overrides
   - It should NOT require wiring into the full graph to audition
   - Preview uses the same audio engine, but an isolated scheduling lane
4. Implement readiness checks:
   - Basic validations can run in backend runtime or in frontend (depending on available data)
   - Keep the first version simple and deterministic
5. Implement Draft/Published and version tags:
   - Store Thought metadata (status + version)
   - Publish action records a version note

## Files to change/create
Frontend:
- CREATE: `frontend/src/ui/rivuletLab.js`
- CHANGE: `frontend/src/ui/app.js` (layout)
- CHANGE: `frontend/src/state/store.js` / selection state plumbing
- CHANGE: `frontend/src/audio/transport.js` (preview mode hook OR separate preview scheduler)
- OPTIONAL: `frontend/src/ui/stepStrip.js` reuse for visualization

Backend (optional, if readiness checks need server support):
- CHANGE: `backend/mind_api/routes.py` (preview endpoint)
- CHANGE: `backend/mind_api/models.py` (preview response includes checks/stats)

## Completion checklist
- [ ] Rivulet shows when a Thought is selected
- [ ] Play/stop/loop previews only that Thought
- [ ] Harness overrides work (tempo/key/instrument)
- [ ] Mini visualization updates with changes
- [ ] Readiness checks show pass/warn/fail
- [ ] Publish toggles Draft→Published and persists version tag

## Required tests
- [ ] Preview Moonlight Opening Arp Thought in rivulet without wiring it into graph
- [ ] Change instrument in rivulet and confirm audio changes
- [ ] Publish Thought and confirm it remains published after reload

