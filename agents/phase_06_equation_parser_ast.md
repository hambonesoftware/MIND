You are ChatGPT in Agent Mode with full repo-edit + local execution capability.

PHASE: 06 — equation(...) parsing to EquationAST
REF: plan.zip → PHASE_06_Equation_Parser_and_AST.md

PRIMARY GOALS
1) Add a new script form `equation(...)` to parse into EquationAST.
2) Keep existing `beat(...)` parsing unchanged.
3) Provide clear diagnostics on invalid equation input.

FILES TO CREATE
- backend/mind_api/mind_core/equation_parser.py

FILES TO MODIFY
- backend/mind_api/models.py (add EquationAST + union type if not present)
- backend/mind_api/mind_core/parser.py (dispatch based on script prefix)

TEST FILES (REQUIRED)
- backend/tests/test_equation_parser.py

IMPLEMENTATION NOTES
- Start MVP: parse kwargs as strings; preserve `harmony` and `motions` as raw strings.
- Do not attempt to solve here; that’s Phase 07/08.
- Ensure /api/parse returns ast.kind == 'equation'.

SUCCESS CHECKLIST
- [ ] equation(...) parses and returns EquationAST
- [ ] beat(...) still parses
- [ ] Invalid equation returns helpful diagnostics
- [ ] Tests pass

RUN
- python -m pytest -q
- python run.py and paste an equation(...) into a theory block to confirm parse success (even if compile is not yet wired)
