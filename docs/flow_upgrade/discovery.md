# Flow Upgrade Discovery

## Current entrypoints
- **Backend HTTP API**: `backend/mind_api/routes.py` defines the `/parse` and `/compile` endpoints. `/compile` calls `mind_api.mind_core.compiler.compile_request`, which is the main graph compile entrypoint.
- **Compiler core**: `backend/mind_api/mind_core/compiler.py` owns graph validation, traversal, and event generation. Supporting functions live in `mind_api.mind_core.parser` and `mind_api.mind_core.solver`.
- **Frontend runtime**: `frontend/src/main.js` wires the UI to the backend and instantiates the transport scheduler via `createTransportScheduler` from `frontend/src/audio/transport.js`.

## Compile model (backend)
- **Input**: A `CompileRequest` contains nodes, edges, and optional `startNodeIds` (`backend/mind_api/models.py`).
- **Validation** (`compile_request`):
  - Ensures edge endpoints exist and have compatible port types.
  - Enforces node-type constraints (e.g., render nodes only have one child edge).
  - Verifies start nodes and required inputs for reachable render/theory nodes.
  - Guards against cycles and excessive traversal depth.
- **Traversal**: Depth-first walk from entry nodes produces an execution plan of reachable nodes.
- **Output**: Each theory node is parsed and solved into events, render nodes apply post-processing chains, and start nodes aggregate children. The compiled response returns sorted events plus diagnostics.

## Audio scheduling model (frontend)
- **Transport scheduler** (`frontend/src/audio/transport.js`):
  - Maintains a loop window (default 16 bars) and a lookahead window (`LOOKAHEAD_SEC`).
  - On each tick, requests the next bar from `/compile`, records the events per bar, and calls `audioEngine.schedule` with bar-relative offsets.
  - Tracks the current bar/beat for the transport UI and clears prior bar events as the loop advances.
- **Audio engines**:
  - Each engine implements `schedule(events, whenSec)` for the current bar; SF2/Spessa engines use their own internal scheduler to enqueue events with a short lookahead.
  - `sampleEngine`, `nullEngine`, and `wasmEngine` provide lightweight/fallback scheduling that still records events for UI visualization.
