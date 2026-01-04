# Agent_Backend_SchemaValidation

## Purpose
Update backend validation/models to accept new Thought custom melody fields (even if runtime ignores them until Phase 4).

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
1) Locate backend request schema for compile sessions.
2) Extend validation to allow:
   - melodyMode
   - customMelody.grid
   - customMelody.bars[*].rhythm
   - customMelody.bars[*].notes
3) Ensure missing fields have sane defaults.

## Files you are allowed to touch (expected)
- backend models/validation files
- backend tests (optional)

## Commands to run (edit for repo reality)
pytest -q

## Success checklist
- [ ] Backend accepts payload with custom melody fields
- [ ] Invalid shape yields diagnostic (not 500)

## Artifacts to attach under docs/v9.5
- docs/v9.5/phase-3/backend-acceptance-notes.md

## Common failure modes + fixes
- If validation is too strict: loosen only for these fields; do not disable validation globally.
