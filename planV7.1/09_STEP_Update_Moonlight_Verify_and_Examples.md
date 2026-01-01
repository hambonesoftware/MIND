# Step 09 — Update Moonlight verifier + examples (ReleaseAgent)

## Goal
Update the dev verifier and provide a reference Moonlight equation string for v7.1.

## Agents
- ReleaseAgent (primary)
- TestHarnessAgent
- RegressionFixAgent

## Files
- Modify: `backend/mind_api/mind_core/_dev_verify_moonlight.py`
- Add or update docs/examples (choose one):
  - `docs/examples/moonlight_v7_1.txt` (new)
  - or add a section to your existing docs

## Instructions
1) Update `_dev_verify_moonlight.py`:
   - Replace the old motions with the new arpeggiate signature:
     - `motions="arpeggiate(pattern=low-mid-high,mode=tones,voicing=moonlight,order=5-1-3,start=0)"`
   - Set harmony to use `C#m/G#` for the opening so inversion is explicit.
2) Add a validation print for bar 1:
   - Print the first 12 pitches from events (sorted by tBeat) so it can be visually compared
     to `snippets/expected_bar1_pitches.txt`.
3) Optionally add a quick assert in the script (dev-only) that bar 1 matches the expected sequence.

## Success checklist
- [ ] `_dev_verify_moonlight.py` runs without exceptions
- [ ] Bar 1 output matches expected pitch contour
- [ ] `pytest -q` passes

## Must-run tests
- `pytest -q`
- `python backend/mind_api/mind_core/_dev_verify_moonlight.py`
