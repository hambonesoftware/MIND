# Agent_QA_BackendTests

## Purpose
Create/extend backend tests that lock Thought fan-out semantics and document Start behavior.

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
1) Add test file `backend/tests/test_fanout_semantics.py` (or match existing test layout).
2) Build a minimal flow graph:
   - Start → ThoughtA
   - ThoughtA → ThoughtB
   - ThoughtA → ThoughtC
3) Simulate enough runtime steps/bars to cause propagation.
4) Assert both ThoughtB and ThoughtC become active and contribute events.

## Files you are allowed to touch (expected)
- backend/tests/test_fanout_semantics.py (new)

## Commands to run (edit for repo reality)
pytest -q

## Success checklist
- [ ] Fan-out test passes
- [ ] Test fails if fan-out changes in future

## Artifacts to attach under docs/v9.5
- docs/v9.5/phase-2/test-output.txt (optional)
- docs/v9.5/phase-2/notes.md

## Common failure modes + fixes
- If tests are hard to write due to runtime interface: create a thin harness helper (tests only), keep it scoped.
