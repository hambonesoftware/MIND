# Flow Upgrade Discovery

## Summary
- The compiler graph validation lives in `backend/mind_api/mind_core/compiler.py` and already enforces missing-node edges, type mismatches, render-child constraints, and cycle detection.
- Runtime scheduling in the frontend is managed in `frontend/src/main.js` via a lookahead window (currently 2 bars) and per-bar compilation.
- The UI is built with vanilla DOM manipulation and custom CSS in `frontend/styles.css`.

## Observations
- Graph traversal starts from `startNodeIds` when provided, otherwise falls back to explicit start nodes or nodes without incoming edges.
- Render blocks in the note workspace are the only configurable render chain elements in the current UI, making them the best place to surface "active render sinks" status.
- The playback loop already tracks bar index, bar start time, and lookahead bars, which can populate an execution/logs panel without additional backend changes.
