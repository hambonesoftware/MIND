# PHASE_02 — Frontend compile payload changes (send node graph with Render/Theory)

Agent reference (assumed to exist):
- `agents/phase_02_frontend_payload_graph.md`

## Goal
Change the compile request payload so the backend can understand nesting:
- Send multiple nodes for the NOTE lane workspace
- Include `kind` and `childId` for render blocks
- Include structured render settings

## Scope
Frontend changes only, but you will also add a temporary compatibility layer:
- If backend does not yet support graph payload, you can fall back to current NOTE lane single-text behavior behind a flag.
- Prefer to ship graph payload and then implement backend support in Phase 03/04.

## Files to change / create (frontend)
### Modify
- `frontend/src/api/client.js`
- `frontend/src/main.js`
- `frontend/src/state/store.js`
- `frontend/src/state/session.js` (if compile session snapshot is stored)

## Implementation steps
### 1) Define payload shape (frontend)
Extend the node payload objects to include:
- `id: string`
- `kind: "theory" | "render"`
- `enabled: boolean`
- `text?: string` (theory)
- `childId?: string` (render)
- `render?: { strum?: {...}, perc?: {...} }` (render)

### 2) Update the compile request assembly
Wherever you build the payload for `/api/compile` (often in `client.js` or `main.js`):
- Replace NOTE lane single node with the workspace nodes list.
- Continue sending kick/snare/hat as they are today (single node per lane) to reduce scope.

So the outgoing payload becomes:
- `nodes: []` containing:
  - existing drum nodes (kind defaults to theory for now; text still present)
  - NOTE lane workspace blocks (theory + render)

### 3) Ensure stable ordering / determinism
Before sending:
- Sort nodes by `id` or by creation order
- Avoid depending on DOM order

### 4) Backward compatibility toggle (optional)
Add a config flag in `frontend/src/config.js`:
- `USE_NODE_GRAPH = true`
If false:
- build the old payload

## Success checklist
- [ ] `/api/compile` request includes multiple nodes (not just 4 lanes)
- [ ] Render nodes include `childId` and `render` settings
- [ ] Theory nodes include `text`
- [ ] Kick/snare/hat lanes still behave as before
- [ ] NOTE lane can now be expressed as multiple blocks

## Unit testing / verification
### Manual verification
- Use DevTools Network tab
- Confirm compile payload JSON includes the expected nodes

### Optional automated (Node test runner)
Create `frontend/tests/test_compile_payload.mjs` that:
- builds a mock store state
- runs the “payload builder” function
- asserts:
  - it includes render nodes
  - childId relationships are present
  - no missing text for theory nodes

To make this possible, refactor payload building into a pure function:
- `frontend/src/state/compilePayload.js` (new file) exporting `buildCompilePayload(state)`
Then tests can import and validate it.
