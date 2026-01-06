# Phase 0 — Baseline & Safety Harness

- Branch: `v9.6-thought-style-seed`.
- Backend baseline: `cd backend && pytest -q` (see `backend_test_log.txt` for full output).
- UI smoke: `python run.py` launched FastAPI/uvicorn cleanly; terminated after 5s without startup errors.

## Success checklist
- [x] Branch created
- [x] Backend tests pass
- [x] App runs locally (launch + clean shutdown)
- [x] Baseline artifacts saved in `docs/v9.6/phase-0/`
