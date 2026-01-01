# MotionParserAgent — Parse motion calls + kwargs reliably

## Mission
Create a robust parser for `motions="..."` strings so v7.1 can pass kwargs like:
- `mode=tones`
- `order=5-1-3`
- `start=0`
- `voicing=moonlight`

while not breaking existing motion strings.

## Inputs
- Repo zip
- Step file: `planV7.1/03_STEP_Add_Motion_Kwarg_Parser.md`

## Outputs
- Parser utility module
- Solver updated to use it
- Tests covering old and new motion formats
- Green suite + server smoke

## Files (expected)
- Add: `backend/mind_api/mind_core/motions/motion_call.py`
- Modify: `backend/mind_api/mind_core/solver.py`
- Add: `backend/tests/test_motion_call_parser.py`

## Parser requirements
- Accept `name` and `name(k=v,...)`
- No nested parentheses needed for v7.1
- Preserve raw token values as strings
- Ignore whitespace safely
- Tolerate missing/extra commas by raising clear ValueError (tests define behavior)

## Must-run
- `pytest -q`
- `python run.py`

## Fix loop
- If any existing example breaks:
  - write a regression test for that motion string
  - update parser until it passes
