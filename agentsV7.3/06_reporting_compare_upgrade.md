# Agent: Phase 06 — Moonlight Reporting Compare Upgrade (Sounding-State Mode)

Role
- Improve reporting so it can compare musical equivalence when durations/sustain are used.

Scope
- Do not change solver/generation logic.
- Only reporting/comparison code + tests.

Goal
Add a new optional compare mode:
- existing: compare note-on events (default)
- new: compare “sounding state”:
  - for each step, compute active pitches given onset+duration
  - compare pitch sets step-by-step

Implementation requirements
1) CLI / API
- Add `--mode sounding_state` (or similar) to `moonlight_report`.
- Default remains current behavior.

2) Sounding-state builder
- Given events (pitches, onset, duration):
  - For each step in bar/range, compute active pitches.
- Ensure performance is acceptable (use sets; avoid O(steps * events) if possible).

3) Output schema
- Keep existing JSON keys stable.
- Add new summary fields under a new key (e.g., `compare_modes.sounding_state`).

Unit tests (required)
- A small fixture where a single sustained note is active across multiple steps.
- A fixture where repeated retriggers are equivalent to one sustain under sounding-state (if your logic chooses to treat them equivalent).
- Ensure tests are deterministic.

Gates
- [ ] Tests pass.
- [ ] `moonlight_report --mode sounding_state --json` runs.
- [ ] Default report output unchanged when no mode is specified.

Required notes artifact
- `backend/mind_api/mind_core/reporting/_phase_06_reporting_upgrade_notes.txt`
