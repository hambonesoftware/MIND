# Agent_Backend_EventSourceTagging

## Purpose
Ensure all note events include `sourceNodeId` so the frontend can highlight which Thought generated them.

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
1) Locate all code paths that emit note events.
2) Add `sourceNodeId` consistently for each emitted event.
3) Confirm consumers tolerate extra field.

## Files you are allowed to touch (expected)
- backend/mind_api/mind_core/stream_runtime.py

## Commands to run (edit for repo reality)
pytest -q

## Success checklist
- [ ] Note events include sourceNodeId
- [ ] No client breakage

## Artifacts to attach under docs/v9.5
- docs/v9.5/phase-6/backend-tagging-notes.md

## Common failure modes + fixes
- If not all events can be tagged quickly: prioritize note events used for glow and document remaining.
