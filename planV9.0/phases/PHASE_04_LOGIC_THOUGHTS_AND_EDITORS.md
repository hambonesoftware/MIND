# PHASE 04 — Logic Thoughts (Start, Counter, Switch, Join) + Editors

Agent: `AGENT_V9_PHASE04_LOGIC_THOUGHTS` (assumed to exist in agentsV9.0.zip)

## Objective
Implement the four Logic Thought types end-to-end:
- runtime semantics
- inspector UI editors
- canvas ports + labels
- debug visualization hooks

This phase assumes Phase 03 runtime exists and can execute tokens.

## Logic Thought semantics (must match docs)
### Start
- purely notational entry point
- on Play: emits one token to each outgoing edge (parallel fan-out)

### Counter
- pre-increment: first hit reads 1
- increment on ENTER (token arrival)
- resets on Play (default)
- exposes value by id for Switch conditions

### Switch
- branch table editor UI
- output ports per branch, labeled
- modes:
  - First match (default)
  - All matches (optional)
- condition sources (V9 minimum):
  - Counter compare
  - BarIndex compare
  - Manual selector
  - Random seeded
  - Always true/false
- default branch behavior supported

### Join (Barrier)
- explicit AND
- waits for all connected inputs (V1)
- shows waiting status (e.g., 1/2)
- fires output once, then resets

## UI anchors in current V8
- Canvas: `frontend/src/ui/flowCanvas.js`
- Node stack/palette: `frontend/src/ui/nodeStack.js`
- Node inspectors likely in `frontend/src/ui/*` (plus registry metadata)

## Instructions
1. Node definitions (registry)
   - Ensure each logic node type declares its ports:
     - Start: 0/1 input, 1+ outputs
     - Counter: 1 input, 1 output
     - Switch: 1 input, N outputs (dynamic)
     - Join: N inputs, 1 output
2. Implement inspector UIs:
   - Switch Condition Editor per our spec:
     - mode, quantize, no-match behavior
     - branch table with labels + condition builder
     - “Add branch” creates a new port
   - Join editor:
     - shows required inputs (all incomers)
     - quantize setting
     - optional timeout section (can be stubbed)
   - Counter editor:
     - name/id, start value, step
     - reset mode (default reset on Play)
3. Runtime integration:
   - implement the logic node behaviors in runtime (if not already)
   - ensure pre-increment semantics for Counter
   - ensure Join cycle reset after firing
4. Canvas visuals:
   - Show port labels on Switch outputs
   - Show Join waiting badge while playing
   - Highlight last-taken Switch branch in playback

## Files to change/create
Frontend:
- CHANGE: `frontend/src/state/nodeRegistry.js` (ports + params)
- CHANGE: `frontend/src/ui/flowCanvas.js` (ports, labels, visuals)
- CHANGE: `frontend/src/ui/app.js` / inspector components (wherever node config UI lives)
- CHANGE: `frontend/src/ui/executionsPanel.js` (render branch decisions + join waits)

Backend:
- CHANGE: `backend/mind_api/mind_core/stream_runtime.py` (logic node semantics)
- CHANGE: `backend/mind_api/models.py` (debugTrace enriched)

## Completion checklist
- [ ] Start node triggers playback correctly
- [ ] Counter increments 0→1 on first token arrival and shows value
- [ ] Switch condition editor can create/edit/delete branches
- [ ] Switch output ports are labeled and connectable
- [ ] Join waits for all incomers and displays waiting count
- [ ] OR merges still work (no accidental implicit AND on multi-in)
- [ ] DebugTrace includes: switch decision + counter values + join arrival set

## Required tests
- [ ] Loop N times then exit:
  Start → Thought → Counter → Switch(loop back / exit)
- [ ] Parallel + Join:
  Start fan-out → ThoughtA and ThoughtB → Join → ThoughtC
- [ ] Manual switch:
  Manual selector changes which branch fires

