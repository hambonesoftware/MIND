# Step 01 — Preflight + Baseline (RepoAuditAgent)

## Goal
Confirm MindV7.0 baseline is green and capture “before” behavior for Moonlight equation output.

## Agents
- RepoAuditAgent (primary)
- RegressionFixAgent (only if baseline is not green)

## Instructions
1) Create a new working branch for v7.1 work.
2) Create/activate venv and install requirements:
   - `python -m venv .venv`
   - activate venv
   - `pip install -r requirements.txt`
3) Run baseline unit tests:
   - `pytest -q`
4) Run baseline dev verifier:
   - `python backend/mind_api/mind_core/_dev_verify_moonlight.py`
   - Save the output to a scratch file (for comparison after changes).
5) Start server smoke:
   - `python run.py`
   - Verify it starts without traceback.

## Success checklist
- [ ] `pytest -q` passes with 0 failures
- [ ] `_dev_verify_moonlight.py` runs without exceptions
- [ ] `python run.py` starts the server without tracebacks

## Must-run tests
- `pytest -q`
- `python backend/mind_api/mind_core/_dev_verify_moonlight.py`
- `python run.py`

## Fix loop (if errors occur)
- If any command fails:
  1) Capture full traceback/log
  2) Reproduce reliably
  3) Hand off to RegressionFixAgent
  4) Fix until the baseline is green (do not proceed while red)
