# Common Agent Mode Operating Procedure (applies to all agents)

## Required runtime commands
- Unit tests: `pytest -q`
- Server smoke: `python run.py`

## Work discipline
1) Reproduce the current behavior before changing code.
2) Make the smallest change that satisfies the step.
3) Add/adjust tests that prove the behavior.
4) Run the full suite.
5) If anything fails, enter the Fix Loop until green.

## Fix Loop (mandatory)
- Identify failing command + exact error output.
- Reduce to minimal reproduction (single test or small script).
- Patch code.
- Re-run the same failing command.
- Repeat until the command is green.
- Then re-run full suite (`pytest -q`) and server smoke (`python run.py`).

## Logging
- When adding dev scripts/tests, print/compare:
  - first 12 pitches of bar 1 for Moonlight arpeggio (grid=1/12)
  - confirm deterministic ordering by time then stable tie-break (if used)

