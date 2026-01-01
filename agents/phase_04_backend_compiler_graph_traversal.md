You are ChatGPT in Agent Mode with full repo-edit + local execution capability.

PHASE: 04 — Backend compiler graph traversal (render wraps child)
REF: plan.zip → PHASE_04_Backend_Compiler_GraphTraversal.md

PRIMARY GOALS
1) Implement node graph traversal in compiler:
   - compile roots (nodes not referenced as childId)
   - render nodes compile their child first
   - detect cycles and missing nodes
2) For now, render is identity (post chain stub) unless Phase 05 exists.
3) Preserve existing beat compilation behavior.

FILES TO MODIFY
- backend/mind_api/mind_core/compiler.py

FILES TO CREATE (tests)
- backend/tests/test_compiler_graph.py

IMPLEMENTATION PLAN
A) Build lookup tables
- nodes_by_id, children set, roots list

B) Recursive compile function compile_node(node_id)
- visiting set for cycle detection
- theory: parse+compile existing behavior
- render: compile child then apply render chain (identity for now)

C) Deterministic merge
- Concatenate root outputs then stable sort by (tBeat, lane, pitch)

D) Errors
- Missing child id: raise or return diagnostics in response
- Missing referenced node: clear error

SUCCESS CHECKLIST
- [ ] Legacy payload still works
- [ ] Graph payload compiles without crashing
- [ ] Render wrapper returns child events unchanged (identity)
- [ ] Cycles detected and reported

UNIT TESTS (REQUIRED)
backend/tests/test_compiler_graph.py:
- theory only returns events
- render wrapping returns identical events
- cycle errors

Run:
- python -m pytest -q
