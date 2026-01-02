# Agent: Phase 02 — Tie Merge Into Sustained Durations

Role
- Merge tied notes in MusicXML into single sustained events.

Scope
- Only MusicXML parsing / reporting layer (and tests).
- Do not alter solver/music generation.
- Do not implement playback sustain semantics here (Phase 03).

Primary target (likely)
- `backend/mind_api/mind_core/reporting/mxl_parser.py`

Required semantics
- Detect ties from:
  - `<tie type="start|stop">`
  - `<notations><tied type="start|stop">`
- Merge tie chains:
  - onset = onset of start
  - duration = sum of all tied segment durations (in ticks)
- Use a stable tie key:
  - pitch (midi or step/alter/octave)
  - voice/staff/part when present
- Handle ties that span measures.

Unit tests (required)
- Add at least:
  - tie within a measure
  - tie across measures (fixture suggested: `Fixtures/mxl_tie_across_measures.xml`)
- Verify merged duration equals sum of segments.
- Verify resulting event count is reduced (one event instead of two).

Gates
- [ ] Tests pass.
- [ ] Re-run Moonlight JSON report:
  `PYTHONPATH=backend python -m mind_api.mind_core.reporting.moonlight_report --json`
- [ ] Record new mismatch counts (onset diffs, timing mismatches) in a notes file; compare to baseline.

Required notes artifact
- Write: `backend/mind_api/mind_core/reporting/_phase_02_tie_merge_notes.txt`
  Include:
  - Before counts (from baseline)
  - After counts
  - Brief explanation of changes
