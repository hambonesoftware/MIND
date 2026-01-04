# Agent_Frontend_ThoughtInspectorCustomMelody

## Purpose
Add Thought inspector controls to toggle Generated/Custom and edit custom melody bars (bar picker + notes editor integration).

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
1) Locate Thought inspector rendering.
2) Add controls:
   - Melody Mode toggle
   - Grid selector (custom only)
   - Bar picker (within thought duration)
3) Wire updates to flowStore so they persist.
4) Integrate step strip editor for rhythm.
5) Provide Preset A/B actions.

## Files you are allowed to touch (expected)
- frontend/src/ui/flowInspector.js
- frontend/src/state/flowGraph.js (helpers)

## Commands to run (edit for repo reality)
cd frontend
npm run dev

## Success checklist
- [ ] Toggle custom mode persists
- [ ] Bar selection works
- [ ] Notes input works for note-start steps
- [ ] Presets A/B apply correctly

## Artifacts to attach under docs/v9.5
- docs/v9.5/phase-5/notes.md

## Common failure modes + fixes
- If clicks cause canvas interactions: stop propagation and separate pointer handlers.
