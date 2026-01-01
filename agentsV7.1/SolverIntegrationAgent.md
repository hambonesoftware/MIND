# SolverIntegrationAgent — step-wise harmony + chord_by_step plumbing

## Mission
Update solver to support:
- step-wise harmony resolution when `mode=tones`
- caching of chord resolutions
- passing motion kwargs through to arpeggiate

## Inputs
- Repo zip
- Step file: `planV7.1/07_STEP_Solver_Stepwise_Harmony.md`

## Outputs
- Solver updated
- arpeggiate receives chord_by_step
- Tests for stepwise harmony
- Green suite + server smoke

## Files (expected)
- Modify: `backend/mind_api/mind_core/solver.py`
- Possibly modify: `backend/mind_api/mind_core/motions/arpeggiate.py`
- Add: `backend/tests/test_solver_stepwise_harmony.py`

## Implementation contract
- Default (no mode=tones) behavior unchanged
- When `mode=tones`:
  - build chord_by_step for the bar by:
    - plan.get_symbol_at_step(...)
    - resolve chord (chord symbols or roman)
    - voice chord (moonlight preset if requested)
  - call apply_arpeggiate(mode=tones, chord_by_step=..., order=..., start=...)

## Must-run
- `pytest -q`
- `python run.py`

## Fix loop
- If outputs become nondeterministic:
  - ensure stable iteration ordering
  - ensure time sorting stable tie-break if needed
  - add regression test for determinism
