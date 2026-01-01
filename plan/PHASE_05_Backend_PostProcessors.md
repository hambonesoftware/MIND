# PHASE_05 — Post-processors: strum + perc + render chain

Agent reference (assumed to exist):
- `agents/phase_05_backend_postprocessors.md`

## Goal
Implement render transforms that operate on compiled events:
- STRUM: turn chord events into staggered note onsets (gesture)
- PERC: generate drum events from masks (gesture)
- Render chain: apply transforms in order

## Scope
Backend only. Frontend already sends `render` specs; backend now uses them.

## Files to change / create (backend)
### Create folder
- `backend/mind_api/mind_core/post/`

### Create
- `backend/mind_api/mind_core/post/__init__.py`
- `backend/mind_api/mind_core/post/chain.py`
- `backend/mind_api/mind_core/post/strum.py`
- `backend/mind_api/mind_core/post/perc.py`

### Modify
- `backend/mind_api/mind_core/compiler.py` (call render chain in render node branch)

## Implementation details (MVP)
### STRUM transform
Input event (chord):
- `tBeat`, `durationBeats`, `pitches: [Int]` length >= 2

Output:
- Replace with N events, one per pitch
- Offsets in beats computed from spread_ms:
  - `spread_beats = (spread_ms / 1000.0) * (bpm / 60.0)`
  - `per_note = spread_beats / max(1, (N-1))`
- Direction:
  - Down: low→high (sort pitches ascending)
  - Up: high→low

Duration policy (MVP):
- Keep original durationBeats for each note, but reduce slightly by offset so it doesn’t exceed bar end:
  - `note_duration = max(0.0, original_duration - offset)`

### PERC transform
Given `PercSpec` with `grid`, and masks `kick/snare/hat` strings containing:
- `x` = hit
- `.` = rest

Compute steps_per_bar from grid.
For each step with `x`, emit an event in the appropriate lane:
- Kick: GM note 36
- Snare: GM note 38
- Hat: GM note 42

Emit as short duration events (e.g. 0.05–0.15 beats) or a fixed duration in steps.

### Render chain
`apply_render_chain(events, renderSpec, context)`:
- Start with original events
- If renderSpec.strum.enabled: apply strum
- If renderSpec.perc.enabled: append perc events (do not delete note events)
- Return final list

## Success checklist
- [ ] Strum changes the timing of chord pitches (multiple onsets)
- [ ] Perc adds drum events at expected steps
- [ ] With render disabled, events unchanged
- [ ] Render chain is deterministic (same input → same output)
- [ ] App plays without crashes; you can hear strummed chords and drum groove

## Unit testing / verification
### Create
- `backend/tests/test_post_strum.py`
- `backend/tests/test_post_perc.py`
- `backend/tests/test_post_chain.py`

### Strum tests
- Input: one chord event with 4 pitches, bpm=120, spread_ms=60, down direction
- Assert:
  - 4 output events
  - tBeat offsets are strictly increasing
  - pitches are in ascending order for down strum

### Perc tests
- Input: grid 1/8, hat="xxxxxxxx", kick="x...x...", snare="..x...x."
- Assert:
  - 8 hat events at correct tBeat positions
  - 2 kick events at correct positions
  - 2 snare events at correct positions

Run:
- `python -m pytest -q`
