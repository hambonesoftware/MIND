# PHASE_07 — Lattice + harmony theory + solver (equation → events)

Agent reference (assumed to exist):
- `agents/phase_07_lattice_solver_theory.md`

## Goal
Make equation nodes produce real events without listing every note:
- Implement `Lattice` as canonical truth for a bar
- Implement minimal tonal theory:
  - Key parsing
  - Roman numerals → chord tones
  - Bar-range harmony plan
  - Deterministic voicing policy (map chord to MIDI notes)
- Implement motions:
  - `sustain(chord)` (long notes across segment length)
  - `arpeggiate(...)` (fill grid with chord-tone traversal)
- Solve a single bar at a time for `/api/compile` (compatible with your scheduler)

## Files to change / create (backend)
### Create
- `backend/mind_api/mind_core/lattice.py`
- `backend/mind_api/mind_core/solver.py`
- `backend/mind_api/mind_core/theory/__init__.py`
- `backend/mind_api/mind_core/theory/key.py`
- `backend/mind_api/mind_core/theory/roman.py`
- `backend/mind_api/mind_core/theory/harmony_plan.py`
- `backend/mind_api/mind_core/theory/voicing.py`
- `backend/mind_api/mind_core/motions/__init__.py`
- `backend/mind_api/mind_core/motions/sustain.py`
- `backend/mind_api/mind_core/motions/arpeggiate.py`
- `backend/mind_api/mind_core/_dev_verify_moonlight.py` (dev-only verifier)

### Modify
- `backend/mind_api/mind_core/compiler.py` (wire equation kind to solver in Phase 08)
- `backend/mind_api/mind_core/notes.py` (optional helpers)

## Implementation steps
### 1) Lattice
Implement:
- steps_per_bar from grid string (reuse existing grid parsing logic if available)
- `add_onset(step, pitches, velocity, dur_steps)`
- `to_events(lane, preset)`

### 2) Harmony plan
Parse `harmony="1-2:i;3-4:V;..."` into segments:
- segment: {startBar, endBar, symbol}
Expose:
- `get_symbol(bar)`
- `get_segment_start(bar)`
- `get_segment_length(bar)`

### 3) Roman numeral resolution (MVP)
Support triads in major/minor:
- i, iv, v, VI, VII, V (and optionally V7)
In minor, allow `V` to be major (harmonic minor leading tone) for classical correctness.
Return pitch classes relative to key root.

### 4) Voicing policy (deterministic)
Define fixed MIDI ranges:
- low: 36–52
- mid: 48–64
- high: 60–76
For Moonlight, you will likely use low/mid.

Map chord pitch classes into a chosen range:
- pick the closest chord tones within range
- ensure stable ordering

### 5) Motions
`sustain(chord)`:
- If bar is segment start: emit chord onset at step 0 with dur_steps spanning segment_length * steps_per_bar
- Else: emit nothing (because it is already sustained from prior segment start)

`arpeggiate(...)`:
- Emit onsets at a specified density:
  - For grid 1/12, “continuous” means 12 onsets per bar
- Choose pattern:
  - Example: low-mid-high-mid over chord tones
- For each step, choose a single pitch (or sometimes two) depending on texture rules

### 6) Solver
`solve_equation_bar(ast, bar_index, bpm)`:
- steps_per_bar
- resolve harmony symbol for bar
- resolve voiced chord
- create lattice
- apply motions (sustain, arpeggiate)
- return lattice events for this bar, BUT allow long durations that extend past bar end

### 7) Dev verifier
`_dev_verify_moonlight.py` should:
- build an EquationAST for Moonlight bars 1–16
- solve each bar and print a readable summary:
  - bar, event_count, first few events, max durationBeats
This is how you prove “it fills notes”.

## Success checklist
- [ ] Solver produces deterministic events for an equation node
- [ ] `sustain(chord)` generates long-duration events only at segment starts
- [ ] `arpeggiate` produces stable number of onsets per bar
- [ ] Moonlight verifier produces consistent results across runs
- [ ] No regressions to beat compilation

## Unit testing / verification
### Create
- `backend/tests/test_lattice.py`
- `backend/tests/test_theory_roman.py`
- `backend/tests/test_theory_harmony_plan.py`
- `backend/tests/test_solver_moonlight_smoke.py`

### Tests
- Lattice: add_onset → to_events correctness
- Roman: C# minor i yields pitch classes {C#,E,G#}
- Harmony plan: bar mapping correct
- Solver smoke: for a simple equation with sustain + arpeggiate, event_count > 0 and deterministic

Run:
- `python -m pytest -q`
