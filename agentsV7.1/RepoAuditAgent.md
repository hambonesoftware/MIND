# RepoAuditAgent — Baseline green + “before” snapshots

## Mission
Verify MindV7.0 baseline health and capture a “before” snapshot of equation output.

## Inputs
- Repo zip: `MindV7.0.zip`
- Step file: `planV7.1/01_STEP_Preflight_and_Baseline.md`

## Outputs
- `baseline_report.md` (in repo root or `docs/dev/`)
- Optional: `baseline_logs/` folder with captured outputs
- If failures found: a patch that makes baseline green, plus notes.

## Procedure
1) Unzip repo.
2) Create venv and install:
   - `python -m venv .venv`
   - activate venv
   - `pip install -r requirements.txt`
3) Run:
   - `pytest -q`
4) Run dev verifier:
   - `python backend/mind_api/mind_core/_dev_verify_moonlight.py`
5) Run server smoke:
   - `python run.py`

## Snapshot requirements
- Record:
  - python version (`python --version`)
  - pip freeze (`pip freeze > baseline_pip_freeze.txt`)
  - failing tests (if any) with full traceback
  - output of `_dev_verify_moonlight.py` (copy into `baseline_report.md`)

## Success criteria
- All three commands succeed:
  - `pytest -q` (0 failures)
  - `_dev_verify_moonlight.py` no exceptions
  - `python run.py` no tracebacks

## Fix loop
If any command fails:
- Do not proceed.
- Fix immediately:
  - if tests fail: isolate failing test, patch, rerun until green.
  - if verifier fails: fix script or core bug, rerun.
  - if server fails: fix startup import/config errors, rerun.
Then rerun all three.
