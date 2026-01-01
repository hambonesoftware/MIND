You are ChatGPT in Agent Mode with full repo-edit + local execution capability.

PHASE: 08 — End-to-end integrate equation solving into compile + render wrappers
REF: plan.zip → PHASE_08_EndToEnd_Integrate_Equation_Render.md

PRIMARY GOALS
1) When a theory node contains equation(...), compile uses solver instead of beat compiler.
2) Render wrappers apply post-processors to child events.
3) End-to-end: UI → /api/compile → audio plays equation+render.

FILES TO MODIFY
- backend/mind_api/mind_core/compiler.py
- backend/mind_api/mind_core/parser.py (if needed)
- frontend/src/main.js
- frontend/src/api/client.js

TESTS TO CREATE (REQUIRED)
- backend/tests/test_end_to_end_compile_equation_render.py

IMPLEMENTATION PLAN
A) Parser dispatch
- equation(...) -> EquationAST
- beat(...) -> Beat AST

B) Compiler theory branch
- If AST kind equation: solve_equation_bar(ast, barIndex, bpm) -> events
- Else: existing beat compilation

C) Compiler render branch
- compile child first
- apply render chain with bpm and render spec

D) Deterministic sorting
- sort output events by (tBeat, lane, firstPitch)

SUCCESS CHECKLIST
- [ ] equation node plays in the browser
- [ ] render wrapper changes playback (strum/perc)
- [ ] legacy beat nodes still play
- [ ] tests pass

RUN
- python -m pytest -q
- python run.py (manual listen test)
