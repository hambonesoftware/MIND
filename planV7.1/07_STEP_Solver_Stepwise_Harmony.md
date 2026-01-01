# Step 07 — Solver: step-wise harmony (SolverIntegrationAgent)

## Goal
Update `solve_equation_bar()` so arpeggiate can follow harmony changes inside a bar
(using HarmonyPlan beat segments) when `mode=tones` is enabled.

## Agents
- SolverIntegrationAgent (primary)
- ArpeggiateAgent
- HarmonyPlanAgent
- ChordSymbolAgent
- TestHarnessAgent
- RegressionFixAgent

## Files
- Modify: `backend/mind_api/mind_core/solver.py`
- Modify: `backend/mind_api/mind_core/motions/arpeggiate.py` (if needed for chord_by_step)
- Add tests: `backend/tests/test_solver_stepwise_harmony.py`

## Instructions
1) In `solve_equation_bar()`:
   - Determine `steps_per_bar`
   - For arpeggiate motions:
     - if parsed kwargs include `mode=tones`:
       - Build `chord_by_step` list length `steps_per_bar`:
         - for each step:
           - symbol = plan.get_symbol_at_step(bar_number, step, steps_per_bar)
           - resolve chord pcs:
             - chord symbol parser if A–G root, else roman resolver
           - voice chord (voicing selected by kwarg; default mid)
           - store voiced chord for this step
       - Call `apply_arpeggiate(..., mode="tones", chord_by_step=..., order=..., start=...)`
     - else:
       - Keep existing bar-level chord behavior.
2) Add caching:
   - cache resolved/voiced chords per symbol so repeated steps are cheap.
3) Tests:
   - Create a mini equation with beat-level plan changes and assert that bar 1 has at least one step where pitch changes as expected.
   - Confirm old solver smoke test still passes.

## Success checklist
- [ ] Old behavior unchanged when mode is not provided (default registers)
- [ ] Step-wise harmony works when mode=tones and beat segments are provided
- [ ] `pytest -q` passes

## Must-run tests
- `pytest -q`

## Fix loop (if errors occur)
- If any determinism tests fail:
  - ensure caching is deterministic
  - ensure iteration order over dicts does not affect output ordering
