# PHASE 09 — Hardening: Tests, Diagnostics, Release Packaging (V9.0)

Agent: `AGENT_V9_PHASE09_HARDENING` (assumed to exist in agentsV9.0.zip)

## Objective
Make V9 stable and shippable:
- automated tests for runtime semantics
- diagnostics for safety caps + stuck joins
- documentation updates
- version bump and release notes

## Current V8 anchors
- Backend tests folder: `backend/tests`
- Baseline docs: `README.md`, `baseline_report.md`, `docs/`

## Instructions
1. Automated tests (backend):
   - Add unit tests for:
     - OR merge semantics
     - fan-out parallel activation
     - Counter pre-increment
     - Switch first-match routing
     - Join AND waiting behavior + reset
     - loop safety cap triggers
2. Diagnostics:
   - Ensure runtime emits readable diagnostics for:
     - exceeded safety caps
     - Switch with no match and no default (if configured to warn/error)
     - Join waiting forever (if timeout configured)
3. Frontend regression checks:
   - No silent failures when backend returns diagnostics
   - Execution panel surfaces diagnostics clearly
4. Docs:
   - Update `README.md` with V9 concepts:
     - Stream graph execution
     - Thought authoring + Rivulet
     - Demo loader
5. Versioning:
   - Update any visible version strings to “V9.0”
   - Add `docs/RELEASE_NOTES_V9.0.md`

## Files to change/create
Backend:
- ADD/CHANGE: `backend/tests/test_v9_runtime_*.py`
- CHANGE: `backend/mind_api/mind_core/stream_runtime.py` (diagnostic coverage)

Frontend:
- CHANGE: `frontend/src/ui/executionsPanel.js` (diagnostics UX)
- CHANGE: `frontend/src/ui/toast.js` (surface critical errors)

Docs:
- CHANGE: `README.md`
- CREATE: `docs/RELEASE_NOTES_V9.0.md`

## Completion checklist
- [ ] Automated tests pass locally
- [ ] Runtime diagnostics cover common failure modes
- [ ] Demos run end-to-end without warnings
- [ ] README reflects V9 architecture and usage
- [ ] Release notes exist and describe breaking changes vs V8

## Required tests
- [ ] `python run.py`
- [ ] Run backend unit tests (existing test runner approach in repo)
- [ ] Load and run all acceptance demos

