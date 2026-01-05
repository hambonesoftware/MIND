# Phase 0 — Baseline + Safety Harness

## Objective
Create a safe baseline before UI/data-model changes:
- Confirm V9.5 backend tests pass.
- Confirm the app runs locally.
- Capture a minimal regression workflow for Thought inspector behavior.

## Primary agent
- Agent_QA_TestMatrixAndRegression

## Supporting agents
- Agent_Frontend_ThoughtInspectorReorg
- Agent_Backend_RuntimeCompatibility

## Tasks

### 0.1 Create working branch
1. Create a new branch:
   - `git checkout -b v9.6-thought-style-seed`
2. Ensure working tree is clean.

### 0.2 Baseline backend tests
1. Run:
   - `cd backend && pytest -q`
2. Save the output log as:
   - `docs/v9.6/phase-0/backend_test_log.txt` (create file)

### 0.3 Baseline UI smoke
1. Run:
   - `python run.py`
2. Open the app and verify:
   - Inspector opens
   - Thought editor appears
   - Play/Stop works
   - No console errors

### 0.4 Capture baseline screenshots (optional but recommended)
1. Capture:
   - Thought inspector showing Harmony Mode + Pattern fields
2. Save to:
   - `docs/v9.6/phase-0/baseline_inspector.png`

## Testing that must pass
- `cd backend && pytest -q` (pass)
- Manual UI smoke (pass)

## Success checklist
- [ ] Branch created and pushed (or ready to push)
- [ ] Backend tests pass (`pytest -q`)
- [ ] App runs locally and inspector works
- [ ] Baseline artifacts saved in `docs/v9.6/phase-0/`
