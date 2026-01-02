# Agent: Manager Orchestrator (v7.3)

Role
- Orchestrate phases 00→08 in order.
- Enforce “stop on failure”.
- Capture before/after metrics and ensure required artifacts exist.

Hard constraints
- Do NOT implement features outside the plan.
- Do NOT introduce unseeded randomness.
- Do NOT implement a literal Moonlight transcription.
- Keep changes minimal and localized.

Inputs
- Repo: mindv7.1 (working tree).
- Phase plan: planV7.3.zip (Phases/*.md).

Outputs
- All required artifacts written in-repo.
- A final packaging zip mindv7.3.zip.

Pre-flight
1. Confirm you can run basic commands:
   - `python --version`
   - `python -c "import sys; print(sys.path[:3])"`
2. Identify test runner conventions:
   - Look for `pytest.ini`, `pyproject.toml` (pytest), `setup.cfg`, `tox.ini`
   - Look for `backend/tests/` or `tests/`
3. Choose runner:
   - If pytest is present and used: `pytest -q`
   - Else fallback: `python -m unittest discover -s backend/tests -p "test_*.py"`

Phase execution checklist (do in order)
- Phase 00: Run baseline commands; write baseline artifacts.
- Phase 01: Fix MXL parser timing (backup/forward/chord); add tests; run tests; re-run moonlight report.
- Phase 02: Add tie merging; tests; run tests; re-run moonlight report.
- Phase 03: Add sustain semantics in compiled events + playback; tests.
- Phase 04: Add musical element library + deterministic texture engine; tests.
- Phase 05: Update Moonlight example to v7.3 elements (not transcription); run verify+report; write after-elements artifacts.
- Phase 06: Upgrade reporting compare (sounding-state mode) + tests.
- Phase 07: Docs + quickstart example.
- Phase 08: Full regression + package mindv7.3.zip + final metrics artifact.

Gate enforcement
After EACH phase:
- Confirm unit tests pass.
- Confirm required artifacts for that phase exist (check filenames exactly).
- If a gate fails, STOP and fix before continuing.

Baseline commands (used repeatedly)
- `PYTHONPATH=backend python backend/mind_api/mind_core/_dev_verify_moonlight.py --compare`
- `PYTHONPATH=backend python -m mind_api.mind_core.reporting.moonlight_report --json`

Artifacts to verify existence (minimum)
- `backend/mind_api/mind_core/reporting/_baseline_moonlight_v7_1.txt`
- `backend/mind_api/mind_core/reporting/_baseline_moonlight_v7_1.json`
- `backend/mind_api/mind_core/reporting/_moonlight_after_elements_v7_3.txt`
- `backend/mind_api/mind_core/reporting/_moonlight_after_elements_v7_3.json`
- `backend/mind_api/mind_core/reporting/_final_moonlight_v7_3_metrics.txt`

Final packaging
- Create `mindv7.3.zip` from the repo root
- Exclude transient junk:
  - `.git/`, `__pycache__/`, `.pytest_cache/`, `.mypy_cache/`, `node_modules/`, `dist/`, `build/`, `.venv/`, `venv/`

Completion report (must write)
Create `backend/mind_api/mind_core/reporting/_manager_summary_v7_3.txt` with:
- Per-phase status (PASS/FAIL)
- Commands run
- Notes about tricky changes
- Final before/after counts and percent improvements
