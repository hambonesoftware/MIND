# Agent_Frontend_TemplateBuilder

## Purpose
Implement an “Insert Moonlight Treble (Bars 1–16)” template that creates nodes/edges and initializes custom melody fields.

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
1) Add template action in UI.
2) Create nodes:
   - Intro Bars 1–4
   - Triplets bed Bars 5–16
   - Melody Bars 5–16 (custom)
3) Connect:
   - Start → Intro
   - Intro → Triplets
   - Intro → Melody
4) Guard against duplicate insertion or suffix names.

## Files you are allowed to touch (expected)
- frontend/src/templates/moonlightTreble.js (new recommended)
- frontend/src/state/flowGraph.js (node/edge helpers)
- frontend/src/ui/* (template menu)

## Commands to run (edit for repo reality)
cd frontend
npm run dev

## Success checklist
- [ ] Template inserts correctly
- [ ] Fan-out edges created
- [ ] Melody node ready for custom editing

## Artifacts to attach under docs/v9.5
- docs/v9.5/phase-7/notes.md

## Common failure modes + fixes
- If UI disallows multiple outgoing edges: implement Split node UX workaround and document it.
