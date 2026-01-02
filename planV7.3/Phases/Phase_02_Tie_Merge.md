# Phase 02 — Tie Merging Into Sustained Durations

Agent: `agents/02_tie_merge.md`  
Goal: Merge tied notes into single sustained events so durations match musical reality.

## Scope
- Detect ties via:
  - `<tie type="start|stop">` and/or `<notations><tied type="start|stop">`
- Merge tie chains (including those spanning measures) into one logical note event.
- Add unit tests using small fixtures.

## Likely files
- `backend/mind_api/mind_core/reporting/mxl_parser.py`
- Possibly a post-processing step in normalization or reporting if that matches existing architecture.

## Implementation requirements
1. Tie identification:
- Support both `<tie>` and `<notations><tied>` representations.
2. Tie grouping key:
- Use stable identifiers for a tie chain:
  - pitch (step/alter/octave) OR midi pitch
  - voice and staff when present
  - part id if relevant
3. Merge behavior:
- On merge:
  - onset = onset of tie start
  - duration = sum of durations of tied segments
  - preserve staff/voice metadata when present

## Unit tests (required)
- A fixture with a tie inside a measure.
- A fixture with a tie spanning measures.
- Verify the merged event duration equals the summed durations.

Suggested fixture:
- `Fixtures/mxl_tie_across_measures.xml`

## Gates
- [ ] Unit tests pass.
- [ ] Re-run Moonlight JSON report and record the new mismatch counts in:
  - `backend/mind_api/mind_core/reporting/_phase_02_tie_merge_notes.txt`
Include before/after counts using Phase 00 baseline as reference.

## Output artifacts
- `backend/mind_api/mind_core/reporting/_phase_02_tie_merge_notes.txt`
