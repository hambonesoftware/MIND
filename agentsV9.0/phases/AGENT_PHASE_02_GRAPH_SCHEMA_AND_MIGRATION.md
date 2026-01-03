# AGENT PHASE 02 — Graph Schema v9 + V8→V9 Migration

Plan reference: `phases/PHASE_02_GRAPH_SCHEMA_AND_MIGRATION.md`

## Goal
Define and implement the V9 graph schema (nodes/ports/edges/params) across frontend + backend and provide a migration path so existing V8 projects can be opened in V9 without breaking.

## Primary touch-points (MINDV8.0)
Frontend:
- `frontend/src/state/*` (graph model + persistence)
- `frontend/src/ui/flowCanvas.js` (ports/edges rendering)
- `frontend/src/ui/flowInspector.js` (node editing)
- `frontend/src/ui/flowPalette.js` (node creation)

Backend:
- `backend/mind_api/models.py` (or equivalent) for request payload validation
- `backend/mind_api/routes.py` (compile endpoint contract)

Data:
- Saved graph JSON format (version bump)

## Step-by-step actions
1) Introduce a versioned graph schema (e.g., `graph.version = 9`).
2) Schema must support:
   - Node `id`, `type`, `params`, `ui` (position/size/collapsed)
   - Port definitions (input/output ports with ids + labels)
   - Edge `id`, `fromNode`, `fromPort`, `toNode`, `toPort`
3) Add node types:
   - `start`, `thought`, `counter`, `switch`, `join`
4) Implement migration:
   - V8 Start/Render/Theory graphs → V9 Stream graph where possible
   - Render nodes become optional or mapped to `thought`/`output` semantics as defined in docs
5) Validation rules at load-time:
   - Allow cycles (do not reject)
   - Merge semantics are OR by default (no implicit AND)
6) Ensure backend accepts the new payload without breaking existing server startup.

## Evidence to capture
- Example migrated project JSON saved to disk
- Screenshot: migrated graph visible on canvas with correct node types
- Backend logs: accepts compile payload shape (even if runtime not yet implemented)

## Completion checklist (must be explicit)
- [ ] Graph schema version bumped and persisted
- [ ] Migration runs automatically when opening V8 graphs
- [ ] V9 node types appear in palette/inspector
- [ ] Cycles are permitted at validation/load time
- [ ] Backend accepts the V9 payload shape (no 4xx/5xx)


## Notes / Decisions (append as you work)
- 
