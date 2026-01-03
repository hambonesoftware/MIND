# AGENT PHASE 00 — Baseline Audit + V8 Behavior Snapshot

Plan reference: `phases/PHASE_00_BASELINE_AUDIT.md`

## Goal
Create a reproducible baseline snapshot of MINDV8.0 so that V9 changes can be verified against real behavior and regressions can be detected quickly.

## Primary touch-points (MINDV8.0)
- Top-level: `README.md`, `run.py`, `requirements.txt`
- Backend: `backend/mind_api/mind_core/compiler.py` (existing cycle detection behavior)
- Frontend: `frontend/src/ui/flowCanvas.js`, `frontend/src/audio/transport.js`
- Assets: `assets/soundfonts/`

## Step-by-step actions
1) Unzip MINDV8.0 into a clean working folder.
2) Create and activate a Python venv; install requirements.
3) Run `python run.py`.
4) Open the frontend in browser. Confirm the app loads and the flow canvas renders.
5) Confirm audio engine initialization (Spessa engine presence) and verify at least one SoundFont loads (or identify current expected behavior).
6) Export/save a simple V8 project (one Start → Render → Theory style graph) and capture:
   - the saved graph JSON payload
   - the compile request payload (if visible)
7) Record baseline console logs for:
   - app startup
   - audio engine init
   - any compile calls
8) Confirm current compiler rejects cycles (capture error path and message).

## Evidence to capture
- Terminal output of `python run.py`
- Browser dev console logs (startup + audio init)
- Screenshot of V8 canvas with at least one working graph
- Copy of a saved graph JSON (baseline)

## Completion checklist (must be explicit)
- [ ] `python run.py` starts without exceptions
- [ ] Frontend loads and renders flow canvas
- [ ] Audio engine init behavior documented (success or current failure mode)
- [ ] Baseline saved graph JSON exported
- [ ] Cycle rejection behavior captured (exact error text + where it originates)


## Notes / Decisions (append as you work)
- 
