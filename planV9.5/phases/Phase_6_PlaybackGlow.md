# Phase 6 — “Now Playing” Thought Glow/Highlight (Audio-driven)

## Objective
When playback runs, the Thought(s) producing events in the current bar window should:
- visually “energize” (glow)
- support concurrency (two thoughts can glow together)
- be driven by scheduled events (not just compile/debug trace)

## Agent(s) (from agentsV9.5.zip)
- `Agent_Frontend_PlaybackHighlight`
- `Agent_Backend_EventSourceTagging` (if Phase 4 didn’t already add tagging)

## Files to change
Backend (if not done in Phase 4)
- `backend/mind_api/mind_core/stream_runtime.py` (ensure events carry `sourceNodeId`)

Frontend
- `frontend/src/audio/transport.js`
- `frontend/src/state/flowGraph.js`
- `frontend/src/ui/flowCanvas.js`
- `frontend/styles.css`

## Implementation steps
1) Collect “playing node ids”
- When `recordBarEvents()` stores events per bar, also compute a Set of `sourceNodeId` for that bar.
- Store this in flowStore runtime state each bar tick (e.g., `playingNodeIds`).

2) Render glow
- In flow canvas rendering, if node.id is in `playingNodeIds`, add CSS class:
  - `.node-playing` (glow)
- Ensure glow is distinct from:
  - selected node highlight
  - “compile active” indicator (debug trace)

3) Concurrency
- If both melody and triplet thoughts generate events, both should glow.

## Success checklist
- [ ] On playback, active thoughts glow
- [ ] Two concurrent thoughts glow simultaneously
- [ ] Glow follows bar transitions correctly
- [ ] Glow turns off on stop
- [ ] No major FPS drop due to excessive rerenders

## Stop / Hold criteria
Stop if:
- Glow flickers rapidly due to per-segment compile updates
- Highlight is based on debugTrace only (must be event-based)
- Performance degrades significantly

