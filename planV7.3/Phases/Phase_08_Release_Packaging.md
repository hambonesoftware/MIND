# Phase 08 — Regression + Release Packaging (mindv7.3.zip)

Agent: `agents/08_release_packaging.md`  
Goal: Finish v7.3 by running full regression, recording final metrics, and packaging the release zip.

## Scope
- Run all tests
- Start server successfully
- Run Moonlight verify/report and record final summary
- Ensure soundfont loading logs remain correct (if required by current version goals)
- Create a distributable zip: `mindv7.3.zip`

## Required commands
1. Unit tests (project standard runner)
2. Server start
   - `python run.py`
3. Moonlight verify + report
   - `PYTHONPATH=backend python backend/mind_api/mind_core/_dev_verify_moonlight.py --compare`
   - `PYTHONPATH=backend python -m mind_api.mind_core.reporting.moonlight_report --json`

## Required artifacts
- `backend/mind_api/mind_core/reporting/_final_moonlight_v7_3_metrics.txt`
  Must include:
  - baseline counts (copied from Phase 00)
  - final counts
  - percent improvement
  - note about remaining expected mismatch sources (non-transcription)

## Packaging requirements
- Include all repo files needed to run.
- Exclude transient build artifacts if your packaging convention does so.
- Name: `mindv7.3.zip`

## Gates
- [ ] Tests pass.
- [ ] Server starts without errors.
- [ ] Moonlight metrics recorded.
- [ ] Zip created and can be unpacked and run.
