# Phase 00 — Foundation

**Agent reference (assumed to exist):** `agentsV9.5/Phase_00_Foundation_Agent.md`

## Purpose
Create a safe baseline for V9.5 work: branch, tooling, reproducible test commands, and a “known good” snapshot.

## Scope
- No behavioral changes (except tiny fixes needed to run tests).
- Establish baseline recordings/logs for later comparison.

## Steps

### 0.1 Create branch + baseline tag
1. Create a new branch: `mind-v9.5-moonlight`
2. Create a local tag for baseline: `v9.4-baseline` (or equivalent)

### 0.2 Confirm dev commands
Confirm these work (adjust if your scripts differ):
- Frontend install/build:
  - `cd frontend`
  - `npm install`
  - `npm run dev`
  - `npm run build`
- Backend install/run:
  - `cd backend`
  - create/activate venv
  - `pip install -r requirements.txt`
  - run API (whatever your existing command is)

### 0.3 Baseline tests
Run whatever tests already exist:
- Frontend unit tests (if any): `npm test` / `npm run test`
- Backend tests (if any): `pytest -q`

Capture baseline outputs:
- Save console output to `docs/v9.5/baseline_frontend.log`
- Save console output to `docs/v9.5/baseline_backend.log`

### 0.4 Add V9.5 docs folder
Create:
- `docs/v9.5/`
- `docs/v9.5/decisions.md`
- `docs/v9.5/test_matrix.md`

Populate **decisions.md** with:
- Audio init policy: “AudioContext is created/resumed only after user gesture.”
- Playback highlight policy: “Glow is driven by scheduled events tagged with source node id(s).”
- Custom melody policy: “Custom Melody is a Thought mode that stores per-bar rhythm+notes.”

Populate **test_matrix.md** with:
- Browsers: Chrome desktop, Chrome mobile
- Smoke: play/stop, insert moonlight template, edit melody bar, confirm glow

## Files to change/create
Create:
- `docs/v9.5/baseline_frontend.log`
- `docs/v9.5/baseline_backend.log`
- `docs/v9.5/decisions.md`
- `docs/v9.5/test_matrix.md`

## Success checklist
- [ ] Branch created and isolated from main.
- [ ] Frontend dev server runs.
- [ ] Backend server runs.
- [ ] Baseline logs captured.
- [ ] Docs folder exists with decisions + test matrix.

## Required tests
- [ ] Existing test suite runs without new failures.
