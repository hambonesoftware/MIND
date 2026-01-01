# TESTING.md — How to prove each phase is operational

This file aggregates the test commands referenced by the phase docs.

## Backend (pytest)
Recommended setup:
- Add `pytest` to requirements
- Create `backend/tests/`

Run:
- From repo root: `python -m pytest -q`

If your working directory is different, run:
- `python -m pytest -q backend/tests`

## Frontend (manual + optional Node tests)
Manual checks are primary (workspace drag/drop is UI heavy).

Optional Node test runner:
- Node 18+ supports `node --test`
- Create `frontend/tests/*.mjs` and run:
  - `node --test frontend/tests`

## Playwright (optional)
If you choose to add Playwright:
- Add dev dependency and create `frontend/playwright/`
- Run headless smoke tests in CI or locally.

## Suggested CI gate (future)
- Phase 03+: `pytest`
- Phase 05+: `pytest` including post-processors
- Phase 08+: end-to-end compile test
