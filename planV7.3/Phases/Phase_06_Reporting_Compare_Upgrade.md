# Phase 06 — Reporting Comparison Upgrades (Sounding-State Mode)

Agent: `agents/06_reporting_compare_upgrade.md`  
Goal: Improve reporting so it can compare musical equivalence more meaningfully for sustain-based output.

## Background
When one representation uses sustained tones and the other uses repeated attacks (or vice versa),
note-on comparisons can overcount diffs. A “sounding-state” comparison evaluates the set of active pitches per step.

## Scope
- Add optional compare modes to Moonlight report tooling:
  - `note_on` mode (existing behavior)
  - `sounding_state` mode (new): compare active pitches per step after applying durations
- Add unit tests using tiny fixtures (not full Moonlight).

## Likely files
- `backend/mind_api/mind_core/reporting/moonlight_report.py`
- Any comparison helpers and normalization layers.

## Implementation requirements
1. Sounding-state builder
- For each step, compute active pitches based on onset+duration.
2. Comparison output
- Report diffs per bar/step, and summary counts.
- Keep JSON stable; add new fields under a new key if needed.
3. Tests
- A small fixture where sustained tone should count as active across multiple steps.
- A fixture where retriggers should still be musically equivalent under sounding-state.

## Gates
- [ ] Tests pass.
- [ ] The report can run with `--mode sounding_state` (or similar) and produces output.
- [ ] Default behavior remains unchanged unless mode is explicitly selected.

## Output artifacts
- `backend/mind_api/mind_core/reporting/_phase_06_reporting_upgrade_notes.txt`
