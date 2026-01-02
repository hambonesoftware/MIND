# Phase 00 — Baseline Snapshot

Agent: `agents/00_baseline_runner.md`  
Goal: Capture the current v7.1 baseline metrics and persist them as artifacts for later comparison.

## Scope
- No code changes (unless required to make baseline tooling run).
- Capture raw outputs from the two baseline commands.
- Record counts for onset diffs and timing mismatches.

## Steps
1. Run comparison summary:
   - `PYTHONPATH=backend python backend/mind_api/mind_core/_dev_verify_moonlight.py --compare`
2. Run JSON report output:
   - `PYTHONPATH=backend python -m mind_api.mind_core.reporting.moonlight_report --json`
3. Save artifacts:
   - Create `backend/mind_api/mind_core/reporting/_baseline_moonlight_v7_1.txt`
     - Include command lines used
     - Include the comparison summary counts (onset diffs, timing mismatches)
     - Include any notable warnings/errors
   - Create `backend/mind_api/mind_core/reporting/_baseline_moonlight_v7_1.json`
     - Save the JSON output exactly (no edits)

## Success checklist
- [ ] Baseline text file exists and includes:
  - [ ] both command lines
  - [ ] onset diffs count
  - [ ] timing mismatches count
- [ ] Baseline JSON file exists and is valid JSON.
- [ ] No unintended repo changes.

## Notes
These baseline files are used as the “before” reference in Phase 05 and Phase 08.
