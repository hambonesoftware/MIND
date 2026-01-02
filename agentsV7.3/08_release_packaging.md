# Agent: Phase 08 — Regression + Release Packaging (mindv7.3.zip)

Role
- Run full regression, record final metrics, and package the repo into mindv7.3.zip.

Scope
- No new features unless required to fix failing tests/packaging.
- Ensure artifacts exist and are correct.

Required commands
1) Run tests
- Use project test runner (pytest if present; else unittest discover).

2) Start server
- `python run.py`
- Confirm no startup errors.

3) Moonlight verify + report
- `PYTHONPATH=backend python backend/mind_api/mind_core/_dev_verify_moonlight.py --compare`
- `PYTHONPATH=backend python -m mind_api.mind_core.reporting.moonlight_report --json`

Required artifact
- `backend/mind_api/mind_core/reporting/_final_moonlight_v7_3_metrics.txt`
Must include:
- baseline counts (from `_baseline_moonlight_v7_1.txt`)
- final counts
- percent improvements
- note: remaining diffs are expected because demo is non-transcription

Packaging requirements
- Create `mindv7.3.zip` from repo root
- Exclude:
  - `.git/`
  - `__pycache__/`
  - `.pytest_cache/`
  - `.mypy_cache/`
  - `node_modules/`
  - `dist/`
  - `build/`
  - `.venv/` and `venv/`

Gate
- [ ] Tests pass.
- [ ] Server starts.
- [ ] Final metrics file exists.
- [ ] mindv7.3.zip exists and unpacks cleanly.
