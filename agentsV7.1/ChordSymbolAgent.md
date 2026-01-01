# ChordSymbolAgent — chord symbol parsing + slash bass + solver integration

## Mission
Add chord symbol support for `harmony=` entries and integrate into solver:
- `C#m`, `C#m/G#`, `G#7`, `G#7sus4`, `Bmaj7`, `Gdim7`, etc.

## Inputs
- Repo zip
- Step file: `planV7.1/05_STEP_Add_Chord_Symbols_and_Slash_Bass.md`

## Outputs
- New module: chord symbol parser
- Solver updated to recognize chord symbols
- Tests for parsing + ordering (slash bass first)
- Green suite + server smoke

## Files (expected)
- Add: `backend/mind_api/mind_core/theory/chord_symbols.py`
- Modify: `backend/mind_api/mind_core/solver.py`
- Add: `backend/tests/test_chord_symbols.py`

## Parsing rules
- Root note: A–G + optional #/b
- Quality:
  - major(default), minor(m), dim(dim), aug(aug), sus4
- Extensions:
  - 7, maj7, dim7
- Slash bass:
  - `/X` forces bass pitch-class to be first in ordered list

## Integration rules
- If harmony token starts with [A-G], treat as chord symbol
- Else treat as Roman numeral

## Must-run
- `pytest -q`
- `python run.py`

## Fix loop
- If ambiguity arises (B# vs C):
  - lock mapping in tests and code
  - keep consistent “sharp-key preference” internally
