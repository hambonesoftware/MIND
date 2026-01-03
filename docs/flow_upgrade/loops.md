# Loop safety and scheduler behavior

## Loop safety rules (compiler)
The compiler treats the node graph as a directed graph and evaluates it from the entry nodes. Loop safety is enforced in `backend/mind_api/mind_core/compiler.py`:

- **Cycle detection**: The traversal tracks a recursion stack (`visiting`). If a node is re-entered, compilation records an error diagnostic (`Cycle detected at ...`) and stops expanding that branch.
- **Depth guard**: `MAX_GRAPH_DEPTH` caps recursion depth. If the limit is exceeded, compilation records an error (`Loop guard tripped ...`) and stops expanding that branch.
- **Schedule horizon**: `MAX_SCHEDULE_STEPS` caps total traversal steps. When exceeded, compilation emits a warning (`Scheduling horizon exceeded ...`) and stops expanding that branch.

These guards ensure that cyclic or excessively deep graphs never hang the compiler.

## Scheduler behavior (frontend)
`frontend/src/audio/transport.js` is the loop-aware scheduler used during playback:

- **Lookahead window**: The scheduler advances a window of `LOOKAHEAD_SEC` seconds and requests the next bar when the current window reaches the bar boundary.
- **Bar loop**: Bars are computed modulo `loopBars` (default 16) so playback wraps in a bounded loop.
- **Event ownership**: Each bar’s events are cached in `barEvents` and cleared when the transport advances to a new bar to avoid unbounded growth.
- **Engine integration**: The scheduler always calls `audioEngine.schedule(events, 0)` for the current bar, while the engine itself handles sub-bar lookahead and event timing.

Together, the backend loop guards and frontend lookahead windows keep playback deterministic and bounded even if the graph contains cycles.
