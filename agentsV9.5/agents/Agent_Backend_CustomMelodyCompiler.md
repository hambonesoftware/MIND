# Agent_Backend_CustomMelodyCompiler

## Purpose
Implement custom melody compilation into note events, including holds/ties and `sourceNodeId` tagging.

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
1) Find Thought compilation path for a bar window.
2) When `melodyMode == "custom"`:
   - determine step count from grid
   - convert rhythm steps into note starts/rest/holds
   - map note starts to notes list
   - compute durations across holds
3) Emit events with `sourceNodeId`.
4) Emit diagnostics for:
   - rhythm length mismatch
   - insufficient notes

## Files you are allowed to touch (expected)
- backend/mind_api/mind_core/stream_runtime.py

## Commands to run (edit for repo reality)
pytest -q

## Success checklist
- [ ] Custom melody produces events
- [ ] Holds extend durations
- [ ] sourceNodeId present
- [ ] Bad input yields diagnostics

## Artifacts to attach under docs/v9.5
- docs/v9.5/phase-4/notes.md

## Common failure modes + fixes
- If timing is wrong: re-check absoluteBeat↔barIndex mapping and loop math.
