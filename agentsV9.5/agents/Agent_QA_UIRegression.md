# Agent_QA_UIRegression

## Purpose
Run focused regression checks to ensure the new editor doesn’t break existing node editing, selection, or connections.

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
1) Select/move nodes; connect ports; delete nodes/edges.
2) Verify inspector still works for other node types.
3) Verify transport play/stop still functions.
4) Save/load a graph and confirm no corruption.

## Files you are allowed to touch (expected)
- docs/v9.5/phase-5/ui-regression.md

## Commands to run (edit for repo reality)
cd frontend
npm run dev

## Success checklist
- [ ] No regressions in node move/connect
- [ ] Inspector works for other nodes
- [ ] Save/load stable

## Artifacts to attach under docs/v9.5
- docs/v9.5/phase-5/ui-regression.md

## Common failure modes + fixes
- If regression exists: fix before Phase 6.
