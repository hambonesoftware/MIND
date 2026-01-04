# Agent_QA_BaselineHarness

## Purpose
Reproduce current playback/compile/engine issues quickly and consistently; capture logs and screenshots needed to prove improvements.

## Inputs you must gather
- Repo root path
- Current branch name + commit hash
- Whether the user is running backend + frontend locally
- Any required environment variables already used by the project

## Scope boundaries
- Only touch files required for this phase.
- Do not refactor unrelated modules.
- Keep diffs minimal and reviewable.
- Add tests when requested by the phase plan.

## Execution steps (Codex-friendly)
1) Create folder `docs/v9.5/phase-0/`.
2) Start backend; confirm health endpoint (or any existing endpoint) responds.
3) Start frontend; open in Chrome with DevTools open.
4) Follow standardized repro:
   - hard refresh
   - wait 3 seconds without clicking
   - record console output
   - click Play once; wait 10 seconds; Stop
   - repeat Play/Stop 3 times
5) Save:
   - console log as text
   - screenshot of canvas + executions panel
6) Summarize observed errors and when they occur (load vs play).

## Files you are allowed to touch (expected)
- docs/v9.5/phase-0/*
- (No source code changes required)

## Commands to run (edit for repo reality)
# Backend (use your repo's actual commands)
python -m venv .venv
# activate venv...
pip install -r backend/requirements.txt
python backend/run.py  # or uvicorn ...

# Frontend
cd frontend
npm install
npm run dev

## Success checklist
- [ ] Baseline repro completed
- [ ] Console log saved
- [ ] At least one screenshot saved (optional but recommended)
- [ ] notes.md includes exact steps and results

## Artifacts to attach under docs/v9.5
- docs/v9.5/phase-0/console.log.txt
- docs/v9.5/phase-0/screenshot.png (optional)
- docs/v9.5/phase-0/notes.md

## Common failure modes + fixes
- If repro is inconsistent: disable caching, hard refresh, and ensure the same URL each run.
- If backend fails: record stack trace and stop; do not proceed to Phase 1.
