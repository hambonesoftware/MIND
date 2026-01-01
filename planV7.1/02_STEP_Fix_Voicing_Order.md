# Step 02 — Fix chord-tone ordering in voicing (TheoryVoicingAgent)

## Goal
Stop `voice_chord()` from sorting pitch classes, so inversions and chord-tone intent are preserved.
This is required for Moonlight (and for correct dominant chords like G#7).

## Agents
- TheoryVoicingAgent (primary)
- TestHarnessAgent
- RegressionFixAgent

## Files
- Modify: `backend/mind_api/mind_core/theory/voicing.py`
- Modify/Add tests: `backend/tests/test_theory_voicing.py` (new file recommended)

## Instructions
1) Update `voice_chord(pitch_classes, register)`:
   - Preserve **input order** of `pitch_classes`.
   - Keep range logic intact, but iterate `for pc in pitch_classes` (not `sorted(...)`).
2) Add a unit test that proves ordering is preserved:
   - Given `pitch_classes=[8,1,4]` (G#(8), C#(1), E(4)) and `register="mid"`,
     the returned voiced chord should keep that relative order (not reorder to [1,4,8]).
   - Add at least one test for a dominant 7 chord spelling where sorting is harmful.
3) Run tests.

## Success checklist
- [ ] `voice_chord()` preserves chord-tone order (no sorting)
- [ ] New unit tests cover the ordering behavior
- [ ] `pytest -q` is green

## Must-run tests
- `pytest -q`

## Fix loop (if errors occur)
- If tests fail, RegressionFixAgent must:
  - identify which callsites expect sorted order (if any)
  - update those callsites or adjust tests to match *explicitly intended* behavior
  - keep backward compatibility for existing equation scripts
