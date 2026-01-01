# Step 11 — Final full run + packaging checks (ReleaseAgent)

## Goal
Confirm v7.1 is release-ready: tests green, server starts, dev verifier matches expected Moonlight contour.

## Agents
- ReleaseAgent (primary)
- RepoAuditAgent
- RegressionFixAgent

## Instructions
1) Run full unit test suite:
   - `pytest -q`
2) Run dev verifier:
   - `python backend/mind_api/mind_core/_dev_verify_moonlight.py`
3) Start server and verify startup:
   - `python run.py`
4) (Optional) Manual API smoke:
   - Use your UI or curl to compile the Moonlight equation and confirm it returns events.

## Success checklist
- [ ] `pytest -q` is green
- [ ] dev verifier runs and bar 1 matches expected
- [ ] server starts without tracebacks
- [ ] No new lints/format issues introduced (optional if you have tooling)

## Must-run tests
- `pytest -q`
- `python backend/mind_api/mind_core/_dev_verify_moonlight.py`
- `python run.py`

## Fix loop (if errors occur)
- RegressionFixAgent must:
  - reproduce the failure
  - isolate the cause
  - patch and rerun the *exact* failing command
  - repeat until all checks are green
