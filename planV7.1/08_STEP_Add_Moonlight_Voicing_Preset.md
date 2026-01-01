# Step 08 — Add `voicing=moonlight` preset (TheoryVoicingAgent)

## Goal
Add a voicing mode that places the chord tones in a Moonlight-like register and inversion,
so the arpeggio feels correct (G#3–C#4–E4 for the opening).

## Agents
- TheoryVoicingAgent (primary)
- SolverIntegrationAgent
- TestHarnessAgent
- RegressionFixAgent

## Files
- Modify: `backend/mind_api/mind_core/theory/voicing.py`
- Modify: `backend/mind_api/mind_core/solver.py`
- Add tests: `backend/tests/test_moonlight_voicing.py`

## Instructions
1) Implement a new voicer, e.g.:
   - `voice_chord_moonlight(pitch_classes_ordered: list[int]) -> list[int]`
2) Contract:
   - Input is ordered (bass-first if slash used).
   - Output is a 3–4 note chord voiced into a stable register (prefer around MIDI 52–68 range).
   - For C#m/G#, the first three tones should land near:
     - G#3 (56), C#4 (61), E4 (64)
   - Keep behavior stable and deterministic.
3) Update solver:
   - If motion kwarg `voicing=moonlight`, use `voice_chord_moonlight` for mode=tones chord_by_step.
   - Otherwise default to existing `voice_chord(..., register=...)`.

## Success checklist
- [ ] Moonlight voicing yields expected opening register (unit test)
- [ ] No breaking changes to existing register voicing
- [ ] `pytest -q` passes

## Must-run tests
- `pytest -q`

## Fix loop (if errors occur)
- If voicing conflicts with existing assumptions, RegressionFixAgent must:
  - isolate moonlight voicing to only activate when explicitly requested
