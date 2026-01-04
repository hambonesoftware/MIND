# Agent_QA_BackendEventTests

## Purpose
Add backend tests for custom melody compilation, including holds and sourceNodeId tagging.

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
1) Create `backend/tests/test_custom_melody_compile.py`.
2) Create a custom Thought with:
   - grid 1/16
   - rhythm includes holds
   - notes list
3) Compile one bar.
4) Assert:
   - events count
   - durations reflect holds (or at least ordering/tie intent)
   - sourceNodeId matches thought id

## Files you are allowed to touch (expected)
- backend/tests/test_custom_melody_compile.py (new)

## Commands to run (edit for repo reality)
pytest -q

## Success checklist
- [ ] Tests pass
- [ ] Tests fail if holds/source tagging removed

## Artifacts to attach under docs/v9.5
- docs/v9.5/phase-4/test-output.txt (optional)

## Common failure modes + fixes
- If engine event format hides duration: assert tie continuity or computed end times instead.
