# PHASE_04 — Backend compiler: graph traversal (compile child then apply render)

Agent reference (assumed to exist):
- `agents/phase_04_backend_compiler_graph_traversal.md`

## Goal
Make `/api/compile` understand and execute node nesting:
- Render node wraps exactly one child node (`childId`)
- Compiler compiles the child first, then applies render transforms (post-processors)
- Roots are nodes not referenced as children
- Preserve existing behavior for non-graph payloads

## Scope
Compiler logic only. Post-processors can be stubbed as identity for now (Phase 05 implements real transforms).

## Files to change / create (backend)
### Modify
- `backend/mind_api/mind_core/compiler.py`

### Optional
- `backend/mind_api/mind_core/parser.py` (only if compiler currently parses inline and you want to refactor)

## Implementation steps
### 1) Build node lookup tables
In the compile entrypoint:
- `nodes_by_id = {node.id: node for node in req.nodes if node.enabled}`
- `children = {node.childId for node in nodes_by_id.values() if node.kind=="render" and node.childId}`
- `roots = [node for node in nodes_by_id.values() if node.id not in children]`

### 2) Add recursive compile function
Create an inner function:
- `compile_node(node_id: str) -> List[Event]`

Logic:
- If node.kind == "theory":
  - Use existing parse+compile path for its `text`
  - Return events
- If node.kind == "render":
  - Compile child first: `child_events = compile_node(node.childId)`
  - Apply render chain (for now, identity): `rendered = apply_render_chain(child_events, node.render, req)`
  - Return rendered

Cycle protection:
- Maintain a `visiting` set; if you see node_id twice, throw a clear error.

### 3) Preserve old behavior
If req.nodes are legacy (no kind), they default to theory from Phase 03 models.
So the compiler still compiles them as normal.

### 4) Keep event merge semantics stable
When multiple roots exist:
- compile each root and concatenate their events
- optionally stable-sort by `tBeat` then `pitch` for determinism

## Success checklist
- [ ] Legacy payload still compiles and plays
- [ ] Render wrapping works (even as identity)
- [ ] Missing childId produces a clear error (not a crash)
- [ ] Cycles are detected and reported
- [ ] Multiple roots compile deterministically

## Unit testing / verification
### Create
- `backend/tests/test_compiler_graph.py`

### Tests
- Compile a simple theory node returns events
- Compile a render node wrapping that theory returns identical events (identity)
- Two render nodes referencing same child: decide allowed or reject; test accordingly
- Cycle produces error

Test strategy:
- Use a minimal `CompileRequest` object with one bar and simple beat text.
- Assert returned event counts and that no exceptions occur unexpectedly.
