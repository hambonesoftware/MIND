# Agent_Backend_RuntimeSemantics

## Purpose
Locate the exact code path that determines fan-out vs single-send and confirm intended behavior for Thought nodes.

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
1) Open backend runtime code (stream execution / token propagation).
2) Identify where outgoing edges are computed and traversed.
3) Confirm whether tokens are duplicated across all outgoing edges (fan-out).
4) Document exact file + function + line range in `docs/v9.5/phase-2/runtime-semantics.md`.

## Files you are allowed to touch (expected)
- backend/mind_api/mind_core/stream_runtime.py (or equivalent)
- docs/v9.5/phase-2/runtime-semantics.md

## Commands to run (edit for repo reality)
pytest -q

## Success checklist
- [ ] Exact fan-out decision location documented
- [ ] Semantics are unambiguous for Thought nodes

## Artifacts to attach under docs/v9.5
- docs/v9.5/phase-2/runtime-semantics.md

## Common failure modes + fixes
- If semantics differ from expectations: stop and flag immediately (Moonlight plan depends on fan-out).
