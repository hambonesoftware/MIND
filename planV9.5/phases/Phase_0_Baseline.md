# Phase 0 — Baseline + Repro Harness

## Objective
Create a clean baseline that:
- reproduces the current errors reliably
- captures logs/screenshots needed to confirm fixes
- establishes “done when” criteria for playback + compile loop

## Agent(s) (from agentsV9.5.zip)
- `Agent_QA_BaselineHarness`
- `Agent_Frontend_Runbook`

## Preconditions
- You are on the **MINDV9.4** code baseline (or whichever commit you are upgrading from).
- You can run backend + frontend locally.

## What to capture (before changes)
1) Browser console log that includes:
   - “AudioContext was not allowed to start…”
   - “WorkerSynthesizer isReady timed out” (if it occurs)
   - Any transport compile errors (e.g., `windowStartBeat is not defined`)
2) A screenshot of:
   - the flow canvas
   - the transport / executions panel state
3) A short screen recording (optional but valuable):
   - page load → click play → observe behavior

## Setup steps
1) Create branch: `v9.5/phase-0-baseline`
2) Install deps (frontend + backend) per repo README.
3) Start backend.
4) Start frontend.
5) Open the app with DevTools open.

## Repro steps (standard)
1) Refresh page (hard refresh).
2) Do NOT click anywhere for 3 seconds.
3) Observe console: record any autoplay/gesture warnings.
4) Click Play (global transport play or node play if available).
5) Let it run ~10 seconds.
6) Stop.
7) Repeat Play/Stop 3 times.

## Baseline acceptance criteria (must be recorded)
- Whether AudioContext warnings appear on load or on play
- Whether WorkerSynthesizer timeouts appear and whether fallback to Worklet occurs
- Whether transport scheduler attempts compile windows without throwing ReferenceErrors
- Whether any events are scheduled

## Success checklist
- [ ] Baseline logs captured and saved to `docs/baseline/` (or your chosen location)
- [ ] Baseline screenshots captured
- [ ] Baseline runbook documented (commands + URLs)
- [ ] You can reproduce the current problem in ≤ 2 minutes

## Stop / Hold criteria
Stop and do not proceed if:
- You cannot run backend + frontend locally
- Console errors differ wildly between runs (nondeterministic baseline)
- You cannot reproduce the playback/compile path at all

