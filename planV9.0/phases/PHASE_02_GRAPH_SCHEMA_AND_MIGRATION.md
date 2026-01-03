# PHASE 02 — V9 Graph Schema + Persistence + V8→V9 Migration

Agent: `AGENT_V9_PHASE02_GRAPH_SCHEMA` (assumed to exist in agentsV9.0.zip)

## Objective
Upgrade the stored graph format so:
- nodes have explicit V9 types and params
- edges connect typed ports
- V8 saved graphs can be migrated (best-effort) into V9 Streams

## Current V8 anchors
Frontend state & persistence:
- `frontend/src/state/flowGraph.js`
- `frontend/src/state/graphStore.js`
- `frontend/src/state/nodeRegistry.js`

Backend API contract:
- `backend/mind_api/models.py`
- `backend/mind_api/routes.py`

## Key V9 requirements
- Node types include:
  - Musical: `thought`
  - Logic: `start`, `counter`, `switch`, `join`
  - (Optional sinks later): `output`, `mixer`, `fx`
- Every musical Thought stores its instrument selection:
  - soundfont id/path + preset (bank/program), supporting sf2/sf3
- Ports are explicit so Switch branches can be labeled and wired.

## Instructions
1. Define the V9 graph JSON shape (frontend canonical) and update persistence version:
   - `graphVersion: 9`
   - `nodes`: { id, type, params, ui }
   - `ports`: either in node definition or computed from node type+params
   - `edges`: { id, from: {nodeId, portId}, to: {nodeId, portId} }
2. Update `frontend/src/state/nodeRegistry.js` to register V9 nodes:
   - Musical Thought node template
   - Start / Counter / Switch / Join templates (with default params)
3. Update `frontend/src/state/flowGraph.js` (and/or `graphStore.js`) to:
   - read/write graphVersion 9
   - include a migration function for V8 graphs:
     - V8 Start → V9 Start
     - V8 Theory → V9 Thought (best-effort mapping of params)
     - V8 Render → drop (prefer) or map to optional Output/Sink node
     - preserve layout positions in `ui`
     - preserve edges if possible
4. Update backend request/response models to accept the V9 graph payload.
   - Keep V8 endpoints temporarily if needed, but V9 should be primary.
5. Add validation for obvious authoring errors (frontend + backend):
   - missing Start
   - Switch with zero branches
   - edges with missing ports

## Files to change/create
Frontend (expected):
- CHANGE: `frontend/src/state/nodeRegistry.js`
- CHANGE: `frontend/src/state/flowGraph.js`
- CHANGE: `frontend/src/state/graphStore.js`
- CHANGE: `frontend/src/state/compilePayload.js` (payload shape updates)
- OPTIONAL: add `frontend/src/state/migrations/v8_to_v9.js`

Backend (expected):
- CHANGE: `backend/mind_api/models.py`
- CHANGE: `backend/mind_api/routes.py`

## Completion checklist
- [ ] Graph persistence writes `graphVersion: 9`
- [ ] V9 node templates exist in palette and can be placed on canvas
- [ ] Edges connect port-to-port (Switch branches are distinct ports)
- [ ] A V8 project can be opened and migrated without crashing
- [ ] Backend accepts V9 compile payload (even if runtime not implemented yet)
- [ ] Validation errors are readable (toast/diagnostics panel), not silent

## Required tests
- [ ] Start server: `python run.py`
- [ ] Create a new V9 Stream, save/reload; nodes+edges persist
- [ ] Load a known V8 graph and confirm migration result renders on canvas
- [ ] Confirm no console errors on load/save

