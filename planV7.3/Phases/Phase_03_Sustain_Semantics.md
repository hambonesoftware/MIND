# Phase 03 — Sustain / Sounding-State Event Semantics

Agent: `agents/03_sustain_semantics.md`  
Goal: Allow the engine to represent held tones (durations > 1) instead of only 1-step note-on “spam”.

## Why this matters
Moonlight’s musical identity is not only repeated triplet attacks — it is also sustained harmony (often via pedal).
If the engine can represent sustained tones natively, both musical realism and report alignment improve.

## Scope
- Extend compiled event representation to include durations > 1 (in steps or ticks).
- Ensure playback respects duration (held tones sound continuously).
- Add sustain policies for generated textures:
  - `hold_until_change`
  - `pedal_hold` (accumulate tones while active, release on pedal lift marker)
- Add unit tests proving end-to-end correctness.

## Discovery steps (required)
Before editing, locate the canonical event type(s) and playback scheduling path:
- Search for event definitions:
  - `rg -n "class .*Event|dataclass.*Event|TypedDict.*Event" backend`
- Search for note scheduling and duration handling:
  - `rg -n "duration|gate|noteOff|note_off|noteOffTime|release" backend`
- Identify how grid steps map to time for playback.

Document findings in:
- `backend/mind_api/mind_core/reporting/_phase_03_event_discovery.txt`

## Implementation requirements
1. Event model
- Add duration field(s) without breaking older code.
- If older code uses a `note` field, keep it as an alias to the first pitch where applicable.
2. Playback scheduler
- If playback currently assumes duration=1, modify it to schedule note-off properly.
- Ensure chords (multiple pitches) can share the same onset and duration.
3. Sustain policies
- Implement `hold_until_change`: tones start at chord change and last until next change.
- Implement `pedal_hold`: tones may accumulate across steps; release when pedal lifts (explicit marker or harmony change boundary).

## Unit tests (required)
- A test that generates a held tone with duration > 1 and asserts playback scheduling contains a note-off later than note-on.
- A test that generates a chord with duration > 1.
- A test that `hold_until_change` produces exactly one sustained event per harmony block (not repeated hits).

## Gates
- [ ] All tests pass.
- [ ] A tiny dev demo can be run to prove a sustained tone sounds (or schedules) correctly.
- [ ] No unseeded randomness introduced.

## Output artifacts
- `backend/mind_api/mind_core/reporting/_phase_03_event_discovery.txt`
- `backend/mind_api/mind_core/reporting/_phase_03_sustain_semantics_notes.txt`
