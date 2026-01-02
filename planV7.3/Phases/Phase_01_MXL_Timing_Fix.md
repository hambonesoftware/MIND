# Phase 01 — Fix MusicXML Timing (`<backup>/<forward>/<chord/>`)

Agent: `agents/01_mxl_timing_fix.md`  
Goal: Make Moonlight comparisons meaningful by correctly modeling MusicXML timing within measures.

## Background
Many piano MusicXML files use multiple voices and position notes using `<backup>` and `<forward>`.
If these are ignored, onsets incorrectly accumulate (e.g., 12, 24, 36…) within what should be a single bar.

## Scope
- Modify MusicXML parsing so onsets reflect true measure-relative timing.
- Add unit tests with small inline MusicXML fixtures proving correctness.
- Do not address ties yet (that is Phase 02).

## Likely files
- `backend/mind_api/mind_core/reporting/mxl_parser.py`
- Any helper modules it relies on for normalization or event structure.

## Implementation requirements
1. Maintain a per-measure cursor in MusicXML duration units (ticks/divisions).
2. Apply control elements:
   - `<backup><duration>`: subtract from cursor
   - `<forward><duration>`: add to cursor
3. Notes:
   - `<note>` onset is current cursor
   - `<note><chord/>` means: onset is the same as the previous note’s onset (do not advance cursor before placing)
   - Advance cursor by note duration only for non-chord notes (or after placing chord stacks, depending on implementation)
4. Support `<divisions>` from `<attributes>` to interpret durations.

## Unit tests (required)
Create unit tests that parse small XML strings and verify:
- Multi-voice measure with `<backup>` produces onsets that reset correctly (not cumulative beyond measure length).
- Chord stacks (`<chord/>`) share the same onset.
- Optional: `<forward>` increments the cursor as expected.

Suggested fixture names (see `Fixtures/`):
- `Fixtures/mxl_two_voice_backup.xml`
- `Fixtures/mxl_chord_stack.xml`

## Gates
- [ ] Unit tests pass.
- [ ] Diagnostic check: within a single bar after normalization, onsets do not explode to 12/24/36/… due to missing backup handling.
- [ ] Re-run:
  - `PYTHONPATH=backend python -m mind_api.mind_core.reporting.moonlight_report --json`
  and confirm the JSON output no longer contains clearly-invalid “in-bar” onset growth.

## Output artifacts
- Update notes in:
  - `backend/mind_api/mind_core/reporting/_phase_01_mxl_timing_fix_notes.txt`
Include:
- what changed
- how to run tests
- any new assumptions
