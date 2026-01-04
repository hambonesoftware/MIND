# Phase 05 — Backend Compiler for Custom Melody (Events + Holds/Ties)

**Agent reference (assumed to exist):** `agentsV9.5/Phase_05_CustomMelody_BackendCompiler_Agent.md`

## Purpose
Make Custom Melody actually produce note events so Moonlight treble melody can be heard.

## Scope
- Backend: interpret `customMelody.grid`, `customMelody.bars[i].rhythm`, `customMelody.bars[i].notes`
- Emit events with accurate timing and holds/ties
- Add tests for correctness

## Interpretation rules (minimal, deterministic)
Given:
- bar duration = 4 beats (BEATS_PER_BAR)
- grid step count is derived:
  - `1/16` → 16 steps per bar
  - `1/12` → 12 steps per bar
  - (add other grids if you already support them)

Rhythm token meanings:
- `9` = start a note at this step (consume next pitch from notes list)
- `-` = extend the previous note by 1 step (tie/hold)
- `.` = no note (rest)

Algorithm per bar:
1) Convert rhythm string into step tokens (length must match steps-per-bar; if not, diagnostic error).
2) For each step:
   - On `9`: start new note, compute its duration by counting following `-` tokens until next non-`-`.
   - Emit note-on at step time, note-off at step time + duration.
3) Ignore `-` if there is no active note (diagnostic warning).

## Event fields (recommended)
Emit events with:
- `lane: 'note'`
- pitch/note info (whatever your engine expects)
- `tBeat` within bar (0..4)
- `durationBeats` OR note-off equivalent (depending on existing event schema)
- `sourceNodeId` (for Phase 07 glow highlighting)

## Diagnostics
If rhythm length mismatch:
- return a diagnostic error for the thought/bar
- produce no events for that bar

If notes list is too short:
- diagnostic warning/error
- remaining `9` steps become rests

## Files to change
- `backend/mind_api/mind_core/stream_runtime.py` (or wherever thought compilation to events occurs)
- Potential helper module (optional): `backend/mind_api/mind_core/custom_melody.py` (new)
- Tests: `backend/tests/test_custom_melody_compile.py` (new)

## Success checklist
- [ ] A custom melody bar with a simple pattern produces correct note-on/off times.
- [ ] Holds (`-`) extend duration correctly.
- [ ] Rhythm length mismatch returns diagnostics.
- [ ] Events include `sourceNodeId`.

## Required tests
- [ ] `pytest -q` passes.
- [ ] Add test cases:
  - one bar `1/16` with 2 notes and holds
  - `-` without a prior `9`
  - notes list shorter than number of `9`s
