# Agent_Frontend_SchemaAndPayload

## Purpose
Add minimal Thought fields for custom melody mode and ensure compile payload includes them and they persist through save/load.

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
1) Update Thought schema in node registry:
   - add `melodyMode` default `generated`
   - add `customMelody` defaults (grid + bars)
2) Ensure serialization layer keeps these fields.
3) Ensure compile payload includes these fields for flowGraph path.
4) Manual persistence check: save → reload → fields still present.

## Files you are allowed to touch (expected)
- frontend/src/state/nodeRegistry.js
- frontend/src/state/compilePayload.js
- frontend/src/state/flowGraph.js (if needed)

## Commands to run (edit for repo reality)
cd frontend
npm run dev

## Success checklist
- [ ] Existing graphs load unchanged
- [ ] New fields persist after reload
- [ ] Payload includes new fields

## Artifacts to attach under docs/v9.5
- docs/v9.5/phase-3/notes.md

## Common failure modes + fixes
- If backend rejects payload: run Agent_Backend_SchemaValidation next.
