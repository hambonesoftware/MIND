# Loop handling in graph compilation

When compiling a node graph, the backend traverses edges starting from the
provided start nodes (or inferred roots when none are provided). Cycles can
exist in a graph, so the compiler includes a **LoopGuard** to ensure traversal
terminates safely and the server does not hang.

## What the LoopGuard does

- Tracks the current recursion stack and reports a diagnostic if a node is
  revisited in the same traversal (cycle detected).
- Enforces a maximum traversal depth (`MAX_GRAPH_DEPTH`) as a secondary safety
  net. If the depth limit is exceeded, compilation stops for that branch and an
  error diagnostic is emitted.

## Practical implications

- Cyclic graphs compile without freezing, but the cyclic branch will not emit
  events once the guard triggers.
- Fix cycles by inserting a `Start` node and ensuring render chains remain
  acyclic.
- If you intentionally need deep graphs, update the `MAX_GRAPH_DEPTH` constant
  in `backend/mind_api/mind_core/compiler.py`.
