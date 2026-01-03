# PHASE 07 — n8n-Style UX Polish + Playback Visualization

Agent: `AGENT_V9_PHASE07_UI_POLISH` (assumed to exist in agentsV9.0.zip)

## Objective
Make the V9 authoring + playback experience feel like a polished n8n-style flow editor:
- clear node categories (Musical vs Logic)
- labeled ports (Switch)
- live execution glow for nodes/edges
- improved ergonomics for wiring, selection, and readability

## Current V8 anchors
- Canvas: `frontend/src/ui/flowCanvas.js`
- Node palette: `frontend/src/ui/nodeStack.js`
- Transport bar: `frontend/src/ui/transportBar.js`
- Execution panel: `frontend/src/ui/executionsPanel.js`
- Toasts: `frontend/src/ui/toast.js`

## Instructions
1. Palette organization:
   - Split into sections: Musical Thoughts / Logic Thoughts / (Optional) Outputs/FX
2. Node visuals:
   - Musical Thought cards show instrument chip + rhythm/pattern summary
   - Logic nodes have distinct iconography (Start, Counter, Switch, Join)
3. Port labeling:
   - Switch output ports render the branch label next to the port
   - Join shows waiting badge while running
4. Playback visualization:
   - Highlight active nodes and traversed edges per bar
   - Use debugTrace output from runtime to drive highlights
5. Interaction ergonomics:
   - Better edge hit targets
   - Quick duplicate node
   - Snap-to-grid optional (off by default)
   - Collapse/expand node details on canvas (keep graphs readable)

## Files to change/create
Frontend:
- CHANGE: `frontend/src/ui/flowCanvas.js`
- CHANGE: `frontend/src/ui/nodeStack.js`
- CHANGE: `frontend/src/ui/executionsPanel.js`
- CHANGE: CSS under `frontend/` (where styles live)

## Completion checklist
- [ ] Node palette is categorized and searchable
- [ ] Switch ports are labeled clearly on the canvas
- [ ] Active execution path highlights during playback
- [ ] Graph remains readable at 20+ nodes (collapse behavior works)
- [ ] No major performance regressions while highlighting

## Required tests
- [ ] Build a 15-node graph; ensure canvas interactions remain smooth
- [ ] Run playback and confirm highlighting follows debugTrace
- [ ] Validate that labels remain readable at various zoom levels (if zoom exists)

