# PHASE 03 — Stream Runtime Engine (Tokens + State + Quantized Scheduling)

Agent: `AGENT_V9_PHASE03_STREAM_RUNTIME` (assumed to exist in agentsV9.0.zip)

## Objective
Replace the V8 “static reachable plan” compiler with a V9 **token-executed Stream runtime** that:
- maintains state across bars (counters/joins/switch decisions)
- activates musical Thoughts per bar
- returns events + next runtime state + debug trace

## Current V8 anchors
- Backend compile logic: `backend/mind_api/mind_core/compiler.py`
  - currently hard-errors on cycles (“Cycle detected …”)
- Frontend transport: `frontend/src/audio/transport.js`
- Compile payload builder: `frontend/src/state/compilePayload.js`
- Execution UI: `frontend/src/ui/executionsPanel.js`

## V9 runtime contract (high level)
Each bar tick:
INPUT:
- `graph` (V9)
- `barIndex`
- `runtimeState` (opaque JSON, owned by runtime)
OUTPUT:
- `events` (scheduled notes)
- `nextRuntimeState`
- `debugTrace` (tokens, branch decisions, join waiting)

## Instructions
1. Introduce a dedicated runtime module in backend (do NOT keep piling into V8 compiler):
   - new file (suggested): `backend/mind_api/mind_core/stream_runtime.py`
   - keep V8 compiler for legacy, but V9 uses runtime
2. Define runtime state shape (stable JSON):
   - active tokens (locations)
   - active musical thoughts (if a Thought spans multiple bars)
   - counters: {counterId: value}
   - joins: {joinId: arrivedInputEdgeIds[]}
   - last switch routes (for UI highlight)
   - safety counters (node firings per bar)
3. Implement bar-step algorithm conceptually:
   - determine which tokens fire this bar
   - resolve zero-time logic nodes immediately (Start/Counter/Switch/Join)
   - activate musical Thought nodes (which produce events for this bar)
   - advance active musical thoughts toward completion
   - emit tokens to downstream edges when nodes complete
   - quantize new activations to the next bar boundary (default)
4. Implement safety caps:
   - max node firings per bar
   - max tokens created per bar
   - if exceeded: return diagnostics + halt progression for that bar
5. Wire the runtime into an API endpoint used by frontend transport:
   - update `backend/mind_api/routes.py` to call V9 runtime for V9 graphs
6. Update frontend transport loop to send/receive `runtimeState`:
   - `frontend/src/audio/transport.js` should carry the state forward each bar
   - do not rely on backend session memory
7. Update executions panel to show debugTrace per bar.

## Files to change/create
Backend:
- CREATE: `backend/mind_api/mind_core/stream_runtime.py` (or folder `stream_runtime/`)
- CHANGE: `backend/mind_api/routes.py` (new compile endpoint behavior)
- CHANGE: `backend/mind_api/models.py` (request/response models include runtimeState + debugTrace)

Frontend:
- CHANGE: `frontend/src/audio/transport.js` (carry runtimeState; call V9 compile)
- CHANGE: `frontend/src/state/compilePayload.js` (include runtimeState + barIndex)
- CHANGE: `frontend/src/ui/executionsPanel.js` (render debugTrace)

## Completion checklist
- [ ] Cycles no longer hard-error by default (runtime allows loops)
- [ ] Linear chain plays in sequence across bars
- [ ] Fan-out starts multiple Thoughts in parallel
- [ ] OR-merge works (node can be activated by either predecessor)
- [ ] runtimeState is passed round-trip and is sufficient to continue playback
- [ ] debugTrace is populated and visible in UI

## Required tests
- [ ] `python run.py` starts
- [ ] Build a 3-Thought chain and confirm A then B then C
- [ ] Build a fan-out (A→B and A→C) and confirm B and C run together
- [ ] Build a simple loop (A→Switch→A) and confirm runtime does not crash; safety cap works

