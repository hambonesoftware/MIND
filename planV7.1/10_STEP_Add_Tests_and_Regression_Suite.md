# Step 10 — Add full regression suite (TestHarnessAgent)

## Goal
Add tests that lock in:
- backward compatibility for old equation strings
- new capabilities: chord symbols, beat ranges, mode=tones, moonlight voicing

## Agents
- TestHarnessAgent (primary)
- RegressionFixAgent

## Files (suggested)
- Add: `backend/tests/test_moonlight_bar1.py`
- Add: `backend/tests/test_harmony_plan_beats.py` (if not already)
- Add: `backend/tests/test_chord_symbols.py` (if not already)
- Ensure existing: `backend/tests/test_solver_smoke.py` remains green

## Instructions
1) Add Moonlight bar 1 test:
   - Build an EquationAST for C# minor
   - Use harmony containing `C#m/G#` at least for bar 1
   - Use motions with `mode=tones` and `voicing=moonlight`
   - Compile bar 0 and assert first 12 pitches match expected sequence.
2) Add “old behavior” regression test:
   - Use the exact equation from `test_solver_smoke.py`
   - Assert it still returns non-empty and deterministic ordering.
3) Run full test suite.

## Success checklist
- [ ] All tests pass
- [ ] Moonlight bar 1 test passes
- [ ] Old solver smoke tests still pass

## Must-run tests
- `pytest -q`

## Fix loop (if errors occur)
- When failures happen:
  - Add the smallest regression test that captures the intended behavior
  - Fix code, rerun, repeat until green
