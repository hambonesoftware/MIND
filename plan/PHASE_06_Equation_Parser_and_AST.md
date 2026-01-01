# PHASE_06 — Theory node language: equation(...) parse → EquationAST

Agent reference (assumed to exist):
- `agents/phase_06_equation_parser_ast.md`

## Goal
Add a new script form:
- `equation(...)` parses to an `EquationAST` (intent-only)
- Keep `beat(...)` parsing unchanged

## Scope
Parsing + AST only. No solving yet (Phase 07/08).

## Files to change / create (backend)
### Modify
- `backend/mind_api/models.py` (add EquationAST union if not already done)
- `backend/mind_api/mind_core/parser.py` (dispatch based on script prefix)

### Create
- `backend/mind_api/mind_core/equation_parser.py`

## Proposed MVP equation grammar (string-based for now)
Support a single top-level call:
```
equation(
  lane="note",
  grid="1/12",
  bars="1-16",
  preset="gm:0:0",
  key="C# minor",
  harmony="1-2:i;3-4:V;5-14:VI;15-16:i",
  motions="sustain(chord); arpeggiate(grid=1/12, pattern=low-mid-high-mid)"
)
```

MVP parse output (EquationAST fields):
- `lane, grid, bars, preset, key`
- `harmony` string preserved (parsed later)
- `motions` string preserved (parsed later)

This lets you ship the UI + graph traversal while solver work proceeds.

## Success checklist
- [ ] `/api/parse` accepts equation(...) and returns ast.kind == "equation"
- [ ] `/api/parse` continues to accept beat(...)
- [ ] Clear diagnostics for malformed equation strings
- [ ] No regression to existing nodes

## Unit testing / verification
### Create
- `backend/tests/test_equation_parser.py`

### Tests
- Valid equation parses
- Missing required kwarg fails
- Unknown kwarg warns or fails (choose one)
- Beat parsing still works (regression test)

Run:
- `python -m pytest -q`
