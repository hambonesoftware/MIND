# Phase 4 — Backend: Compile Custom Melody to Events (+ Source Tagging)

## Objective
When a Thought is in `melodyMode="custom"`:
- Convert the custom rhythm+notes into note events for the scheduled bar window
- Support holds/ties (extended durations)
- Tag events with `sourceNodeId` for later UI glow/highlight

This enables accurate Moonlight treble melody.

## Agent(s) (from agentsV9.5.zip)
- `Agent_Backend_CustomMelodyCompiler`
- `Agent_QA_BackendEventTests`

## Files to change/create
- `backend/mind_api/mind_core/stream_runtime.py`
- `backend/tests/test_custom_melody_compile.py` (new)

## Implementation steps
1) Identify the function that compiles a Thought into events for a bar (per barIndex).
2) If Thought is custom melody:
   - Determine step count from grid:
     - 1/16 in 4/4 → 16 steps per bar
     - 1/12 in 4/4 → 12 steps per bar (triplets)
   - Parse `rhythm` string to identify:
     - note starts
     - rests
     - holds
   - Consume notes from `notes` (explicit pitches) in order of note starts.
   - For each note start, compute duration:
     - base step duration + any hold steps that follow
3) Emit events:
   - include lane/preset/channel consistent with your engine
   - include absolute time (tBeat or audioTime depending on your model)
4) Add `sourceNodeId` field to each event created from this Thought.
5) Maintain backward compatibility:
   - generated mode still works
   - missing/empty custom data yields diagnostics, not crashes

## Diagnostics behavior
- If not enough notes for note-on steps:
  - emit a runtime diagnostic (warning or error)
  - either silence missing notes OR loop last note (choose one and document)
- If rhythm string invalid length:
  - diagnostic + silence the bar for that thought

## Tests (minimum)
- One bar with a known rhythm:
  - expected number of note-on events
  - expected durations for holds
- Ensure `sourceNodeId` exists and matches the thought id

## Success checklist
- [ ] Custom melody produces audible notes at expected times
- [ ] Holds extend durations (no rapid retrigger)
- [ ] Bad custom input yields diagnostics (no crash)
- [ ] Events include `sourceNodeId`

## Stop / Hold criteria
Stop if:
- Event timing drifts or notes are placed in wrong bar
- Holds are ignored or produce stuck notes
- Custom mode breaks generated mode

