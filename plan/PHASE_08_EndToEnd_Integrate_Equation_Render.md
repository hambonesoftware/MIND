# PHASE_08 — Integrate equation solving into compile endpoint + render wrappers

Agent reference (assumed to exist):
- `agents/phase_08_integrate_equation_and_render.md`

## Goal
End-to-end support for:
- Theory nodes containing `equation(...)` text
- Render nodes wrapping theory nodes
- `/api/compile` produces final events:
  - equation → solver → events
  - render wrapper → post-process → events

## Files to change / create
### Modify
- `backend/mind_api/mind_core/compiler.py`
- `backend/mind_api/mind_core/parser.py` (if not already dispatching equation)
- `frontend/src/main.js` (ensure payload is correct)
- `frontend/src/api/client.js` (payload serialization)

### Uses (created earlier)
- `backend/mind_api/mind_core/solver.py`
- `backend/mind_api/mind_core/post/chain.py`

## Implementation steps
1) Ensure parser dispatch works
   - If text starts with `equation(`, parse EquationAST
   - Else, parse beat AST

2) In compiler theory branch
   - If AST kind == beat: existing compile path
   - If AST kind == equation: call `solve_equation_bar(ast, barIndex, bpm)`

3) In compiler render branch
   - Compile child first (recursive)
   - Apply render chain with the node’s render spec

4) Determinism and sorting
   - Stable sort events by `tBeat`, then by pitch, then by lane
   - Ensure render transforms preserve determinism

5) Debug support
   - If request.debug:
     - include `debugText` summarizing:
       - root nodes, traversal order
       - number of events pre/post render

## Success checklist
- [ ] A theory `equation(...)` node plays (events produced) in the browser
- [ ] Wrapping it in a render node changes playback (strum/perc)
- [ ] Legacy beat nodes still play
- [ ] No crashes when render node has no child (returns clear error)
- [ ] Debug mode prints helpful traversal + counts

## Unit testing / verification
### Create
- `backend/tests/test_end_to_end_compile_equation_render.py`

Test:
- Build a CompileRequest with:
  - theory node: equation with simple harmony
  - render node: wraps theory, strum enabled
- Call compiler function directly
- Assert:
  - event count after render != before render (for chord events)
  - perc adds drum events when enabled
