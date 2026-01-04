# Phase 07 — Playback Glow Highlighting (Event Source Tagging + UI Glow)

**Agent reference (assumed to exist):** `agentsV9.5/Phase_07_PlaybackGlow_Highlighting_Agent.md`

## Purpose
Make the currently-playing Thought(s) visually energized/glowing, especially when two treble voices run concurrently (melody + triplet bed).

## Key requirement
Glow must reflect **scheduled playback events**, not “compile debug trace churn.”

## Approach (recommended)
1) Backend tags each emitted event with `sourceNodeId` (already added in Phase 05).
2) Frontend aggregates “active nodes in current bar window” from scheduled events.
3) Flow canvas applies a glow class to those node ids.

## Implementation steps

### 7.1 Backend: ensure event.sourceNodeId is present
- For all thought-generated events (generated or custom), include source node id.
- If render nodes transform events, preserve `sourceNodeId`.

### 7.2 Frontend: track playingNodeIds
During scheduling:
- When `recordBarEvents(...)` stores events per bar, also store the set of sourceNodeIds.
- Update flow runtime state:
  - `flowStore.setRuntimeState({ playingNodeIds })`

### 7.3 Flow canvas glow
In `frontend/src/ui/flowCanvas.js`:
- When rendering a node, if node.id is in playingNodeIds, add class `node--playing` (or similar).
- Add a nice glow style in CSS (subtle, modern, not seizure-inducing).

### 7.4 Concurrency expectation
When fan-out triggers two thoughts:
- Both should glow simultaneously while their events are in the scheduled bar.

## Files to change
Backend:
- `backend/mind_api/mind_core/stream_runtime.py` (ensure tagging for all event paths)

Frontend:
- `frontend/src/audio/transport.js` (aggregate playingNodeIds)
- `frontend/src/state/flowGraph.js` (store runtime.playingNodeIds)
- `frontend/src/ui/flowCanvas.js` (apply class)
- `frontend/styles.css` (glow styles)

## Success checklist
- [ ] A playing thought visibly glows.
- [ ] When two thoughts play concurrently, both glow.
- [ ] Glow updates each bar and clears on stop.
- [ ] No heavy performance regression (no DOM thrash).

## Required tests
- [ ] Manual: play a simple graph with one thought → glows.
- [ ] Manual: create a fan-out thought to two thoughts → both glow.
