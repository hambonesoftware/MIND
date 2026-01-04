# Agent_Frontend_StepLatchUI

## Purpose
Implement the graphical step-strip (PLC latch vibe) to edit rhythm strings without typing 9/./-.

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
1) Build step strip rendering N steps based on grid.
2) States:
   - Off
   - On (note start)
   - Hold (tie)
3) Interactions:
   - click toggles On/Off
   - secondary gesture toggles Hold (define consistent rule)
4) Serialize to the rhythm string (canonical).
5) Add clear/copy/paste for the current bar.

## Files you are allowed to touch (expected)
- frontend/src/ui/stepStrip.js (new or existing)
- frontend/styles.css

## Commands to run (edit for repo reality)
cd frontend
npm run dev

## Success checklist
- [ ] Step strip edits rhythm correctly
- [ ] Holds can be created and saved
- [ ] Copy/paste works

## Artifacts to attach under docs/v9.5
- docs/v9.5/phase-5/stepstrip-notes.md

## Common failure modes + fixes
- If hold is confusing: restrict holds to steps after an On.
