# TestHarnessAgent — unit tests + regression suite for v7.1

## Mission
Add tests that prove v7.1 features while preserving v7.0 behavior.

## Inputs
- Repo zip
- Step file: `planV7.1/10_STEP_Add_Tests_and_Regression_Suite.md`
- Snippet: `planV7.1/snippets/expected_bar1_pitches.txt`

## Outputs
- New tests:
  - moonlight bar1
  - chord symbols
  - harmony plan beats
  - motion parser
  - arpeggiate modes
- Green suite + server smoke

## Must-add tests
1) Moonlight bar 1:
   - compile equation for bar 1
   - assert first 12 pitches == [56,61,64] * 4 (or the chosen canonical)
2) Backward compatibility:
   - existing solver smoke remains green

## Must-run
- `pytest -q`
- `python run.py`

## Fix loop
- If tests are flaky:
  - remove time dependence, randomness
  - stabilize ordering
  - rerun until consistent green
