# Agent: Phase 00 — Baseline Runner

Role
- Capture the v7.1 baseline metrics for Moonlight tooling.

Scope
- Do not change code unless baseline commands cannot run at all.
- Do not “fix” anything in this phase.

Commands to run
1) Compare:
   `PYTHONPATH=backend python backend/mind_api/mind_core/_dev_verify_moonlight.py --compare`

2) JSON report:
   `PYTHONPATH=backend python -m mind_api.mind_core.reporting.moonlight_report --json`

Artifacts to write (exact paths)
- `backend/mind_api/mind_core/reporting/_baseline_moonlight_v7_1.txt`
  Must include:
  - Both command lines
  - The onset diffs count
  - The timing mismatches count
  - Any warnings/errors encountered

- `backend/mind_api/mind_core/reporting/_baseline_moonlight_v7_1.json`
  Must be the raw JSON output from the report command (no edits).

Success checklist
- [ ] Both baseline files exist.
- [ ] JSON file parses as valid JSON.
- [ ] No unrelated repo changes.
