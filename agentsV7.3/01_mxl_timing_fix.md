# Agent: Phase 01 — MusicXML Timing Fix (<backup>/<forward>/<chord/>)

Role
- Fix the MusicXML timing model so measure-relative onsets are correct.
- Add unit tests that lock this behavior.

Scope
- Work only in the reporting/parser area (and tests).
- Do not implement tie merging (Phase 02).
- Do not modify solver/music generation logic (later phases).

Primary target file (likely)
- `backend/mind_api/mind_core/reporting/mxl_parser.py`

Required semantics
1) Maintain a cursor in MusicXML duration units (ticks / divisions) while parsing a measure.
2) `<backup><duration>` subtracts from cursor.
3) `<forward><duration>` adds to cursor.
4) `<note>` onset is cursor at time of placement.
5) `<note><chord/>` keeps onset equal to the previous note’s onset (do not advance before placing chord tones).
6) Advance cursor by note duration at appropriate time (commonly after non-chord note placement; chord tones share onset).

Important: divisions
- Respect `<attributes><divisions>`.
- If divisions can change mid-piece, handle per-measure updates.

Unit tests (required)
Goal: prove correctness using tiny fixtures.
- Add tests for:
  - two voices in one measure using `<backup>`
  - chord stack using `<chord/>`
  - optional `<forward>`
- You may embed XML strings or read fixture files:
  - `Fixtures/mxl_two_voice_backup.xml`
  - `Fixtures/mxl_chord_stack.xml`

Test runner discovery
- If repo uses pytest, add tests in its convention and run `pytest -q`.
- Else create `backend/tests/test_mxl_parser_timing.py` using `unittest` and run:
  `python -m unittest discover -s backend/tests -p "test_*.py"`

Gates
- [ ] Tests pass.
- [ ] Re-run: `PYTHONPATH=backend python -m mind_api.mind_core.reporting.moonlight_report --json`
- [ ] Confirm no obviously-invalid in-bar onsets (like 12/24/36 in a 12-step bar) due solely to timing cursor bugs.
  - If feasible, add a diagnostic assertion/test that normalized onsets for a single measure stay within the measure’s step span.

Required notes artifact
- Write: `backend/mind_api/mind_core/reporting/_phase_01_mxl_timing_fix_notes.txt`
  Include:
  - What changed
  - How tests are run
  - Any assumptions about cursor advancement and chord grouping
