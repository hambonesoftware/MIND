# TheoryVoicingAgent — Preserve chord-tone order + Moonlight voicing preset

## Mission
1) Remove harmful chord-tone sorting in `voice_chord()`.
2) Add `voice_chord_moonlight()` preset used only when explicitly requested.

## Inputs
- Repo zip
- Step file(s):
  - `planV7.1/02_STEP_Fix_Voicing_Order.md`
  - `planV7.1/08_STEP_Add_Moonlight_Voicing_Preset.md`

## Outputs
- Updated source files
- New/updated tests
- Green test suite + server smoke

## Files (expected)
- `backend/mind_api/mind_core/theory/voicing.py`
- tests:
  - `backend/tests/test_theory_voicing.py`
  - `backend/tests/test_moonlight_voicing.py`

## Implementation detail (ordering fix)
- In `voice_chord()`:
  - Do NOT sort pitch classes.
  - Iterate in input order.
  - Keep octave placement logic deterministic.

## Implementation detail (moonlight preset)
- Implement `voice_chord_moonlight(pcs_ordered: list[int]) -> list[int]`
- Rules:
  - deterministic, no randomness
  - prefers register producing:
    - for C#m/G# => approx [56, 61, 64] for first 3 tones (G#3, C#4, E4)
  - if 4-tone chord (7th), include the 7th above, but keep texture stable.

## Must-run tests
- `pytest -q`

## Must-run smoke
- `python run.py`

## Fix loop
- Any regression:
  - isolate if existing scripts depended on sorted order
  - adjust only those callsites explicitly (avoid silent behavior changes)
  - add regression test for that script if needed
  - repeat until green
