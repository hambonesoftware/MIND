# HarmonyPlanAgent — beat-aware harmony ranges

## Mission
Upgrade HarmonyPlan parsing to support beat-level ranges:
- `4.2:G#7`
- `4.2-4.4:G#7`
while keeping old bar ranges compatible.

## Inputs
- Repo zip
- Step file: `planV7.1/06_STEP_Add_Beat_Aware_HarmonyPlan.md`

## Outputs
- Updated harmony plan parser + APIs
- Tests for beat mapping + backward compatibility
- Green suite + server smoke

## Files (expected)
- Modify: `backend/mind_api/mind_core/theory/harmony_plan.py`
- Add: `backend/tests/test_harmony_plan_beats.py`

## Behavioral contract
- `get_symbol(bar)` still works (bar-level)
- Add `get_symbol_at_step(bar, step, steps_per_bar)`:
  - assumes 4/4; requires steps_per_bar divisible by 4
  - maps step → beat (1..4)
  - returns correct symbol for beat segments

## Must-run
- `pytest -q`
- `python run.py`

## Fix loop
- Any grid mismatch:
  - raise clear ValueError OR fallback to bar-level (choose + document)
  - add test for chosen behavior
