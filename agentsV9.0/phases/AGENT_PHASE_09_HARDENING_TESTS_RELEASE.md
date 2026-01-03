# AGENT PHASE 09 — Hardening: Tests, Diagnostics, Release Packaging

Plan reference: `phases/PHASE_09_HARDENING_TESTS_RELEASE.md`

## Goal
Harden V9 with safety limits, diagnostics, and repeatable tests; then package MINDV9.0 for release.

## Primary touch-points (MINDV8.0)
Backend:
- tests under `backend/tests/`
- runtime modules (add unit tests for switch/counter/join semantics)
Frontend:
- optional lightweight test scripts
Packaging:
- root-level zip build scripts (or `scripts/`)

## Step-by-step actions
1) Add safety limits:
   - max tokens per bar
   - max node firings per bar
   - max loop traversals per tick
2) Add diagnostics surfaced in UI (toast + executions panel).
3) Add tests:
   - counter pre-increment
   - switch first-match
   - join AND behavior
   - OR merge behavior
4) Verify startup:
   - `python run.py` no errors
5) Package deliverable:
   - `mindV9.0.zip` containing full repo state (excluding venv)

## Evidence to capture
- Test output logs
- Screenshot: UI shows diagnostic when safety limit triggers (optional)
- Final zip artifact produced

## Completion checklist (must be explicit)
- [ ] Safety limits prevent runaway graphs without crashing
- [ ] Backend tests cover core semantics and pass
- [ ] `python run.py` starts cleanly
- [ ] `mindV9.0.zip` produced and includes required assets


## Notes / Decisions (append as you work)
- 
