# Phase 05 — Moonlight Demo Update to Use Musical Elements (Not Transcription)

Agent: `agents/05_moonlight_demo_update.md`  
Goal: Update the Moonlight demo to use the new elements so it sounds more accurate without copying the score.

## Scope
- Create a new Moonlight example file:
  - `docs/examples/moonlight_v7_3.txt`
- Update the demo/verification path so Moonlight v7.3 uses elements-based generation.
- Add phrase shaping + controlled variation.
- Add minimal top-voice or held-tone layer derived from harmony rules, not literal note extraction.

## Musical targets (non-transcription)
- Left hand: triplet broken chord texture archetype with sustain (pedal/hold-until-change).
- Phrase shaping: subtle changes over bars (density, register, accent).
- Right hand: minimal held-tone/top-voice layer:
  - derived from chord tones
  - stepwise preference
  - longer durations than arpeggio attacks

## Implementation steps
1. Add the v7.3 example file with clear parameters.
2. Ensure the verify tool reads the v7.3 file (or add a switch).
3. Run both report commands and persist after-change artifacts.

## Required artifacts
- `backend/mind_api/mind_core/reporting/_moonlight_after_elements_v7_3.txt`
- `backend/mind_api/mind_core/reporting/_moonlight_after_elements_v7_3.json`

Each should include:
- command lines used
- onset diffs and timing mismatches counts
- a short explanation of what improved and why

## Gates
- [ ] Reports run with no errors.
- [ ] Onset diffs and timing mismatches improve significantly vs baseline, while staying non-transcription.
- [ ] Output is deterministic.
