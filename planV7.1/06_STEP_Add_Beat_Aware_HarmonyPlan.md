# Step 06 — Beat-aware HarmonyPlan parsing (HarmonyPlanAgent)

## Goal
Extend `HarmonyPlan.parse()` to accept beat-level ranges:
- `4.2:G#7` (bar 4 beat 2)
- `4.2-4.4:G#7` (bar 4 beats 2–4)
- Keep bar ranges working: `1-2:i`

## Agents
- HarmonyPlanAgent (primary)
- SolverIntegrationAgent
- TestHarnessAgent
- RegressionFixAgent

## Files
- Modify: `backend/mind_api/mind_core/theory/harmony_plan.py`
- Add tests: `backend/tests/test_harmony_plan_beats.py`

## Instructions
1) Update the segment model to represent:
   - start_bar, start_beat
   - end_bar, end_beat
   - symbol
2) Parsing rules (backward compatible):
   - If the left side is `A-B`: treat as whole-bar range (beats 1–4)
   - If it is `A.X`: treat as a single beat range in one bar
   - If it is `A.X-B.Y`: treat as beat range (support same-bar first; cross-bar optional)
3) Add method(s):
   - `get_symbol_at_step(bar_number: int, step: int, steps_per_bar: int) -> str`
     - Assume 4/4 so steps_per_beat = steps_per_bar // 4 (must be exact)
     - beat = (step // steps_per_beat) + 1
   - Keep `get_symbol(bar_number)` for backward compatibility (return the whole-bar symbol)
4) Tests:
   - Confirm bar-range plans still parse and `get_symbol()` works.
   - Confirm beat-range plans parse and `get_symbol_at_step()` returns expected symbol changes.

## Success checklist
- [ ] Backward compatible bar ranges still work
- [ ] Beat ranges work for grids where steps_per_bar divisible by 4 (e.g. 1/12, 1/16, 1/24)
- [ ] `pytest -q` passes

## Must-run tests
- `pytest -q`

## Fix loop (if errors occur)
- If a grid does not divide evenly by 4, `get_symbol_at_step()` must:
  - raise a clear ValueError OR
  - fall back to bar-level behavior (document which one you choose)
