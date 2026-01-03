# AGENT PHASE 03 — Stream Runtime Engine (Token Execution + State Round-trip)

Plan reference: `phases/PHASE_03_STREAM_RUNTIME.md`

## Goal
Replace V8 static DAG compilation with a token-based Stream runtime that advances in quantized time (bars) and returns explicit nextState + debug trace. Stream is the only transport owner.

## Primary touch-points (MINDV8.0)
Frontend:
- `frontend/src/audio/transport.js` (master clock; per-bar stepping)
- `frontend/src/api/*` (compile calls)
- `frontend/src/ui/executionsPanel.js` (display debug trace)
Backend:
- `backend/mind_api/mind_core/compiler.py` (V8) → new `stream_runtime` module
- `backend/mind_api/routes.py` (compile endpoint returns events + nextState + trace)

## Step-by-step actions
1) Define `StreamRuntimeState` structure:
   - `barIndex`
   - `activeTokens` (or active nodes)
   - `nodeState` maps: counters, joins, switches (as needed)
   - optional `seed` and `lastTrace`
2) Implement runtime step:
   - input: `{graph, state, now(bar), settings}`
   - output: `{events, nextState, trace}`
3) Enforce canonical semantics:
   - fan-out parallel, merge OR, join explicit AND, cycles allowed
4) Transport:
   - frontend calls compile per bar (or per chunk) and schedules returned events
   - ensure single clock for the entire Stream
5) Provide developer trace:
   - “token moved A→B→Switch(branch=Loop)”
   - join waiting counts
6) Confirm that V9 runtime can run a simple linear chain with stable timing.

## Evidence to capture
- Console logs showing per-bar compile cycle
- Trace output visible in executions panel
- A recorded run: Start → ThoughtA → ThoughtB plays in sequence

## Completion checklist (must be explicit)
- [ ] `StreamRuntimeState` exists and round-trips each bar
- [ ] Linear chain executes in order without drift
- [ ] Fan-out executes in parallel (two thoughts active same bar)
- [ ] Merge starts on any incoming activation (OR)
- [ ] Trace is produced and visible in UI


## Notes / Decisions (append as you work)
- 
