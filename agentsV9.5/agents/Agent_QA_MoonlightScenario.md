# Agent_QA_MoonlightScenario

## Purpose
Validate end-to-end Moonlight treble: template insertion, authoring a few bars, playback, concurrency, and glow.

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
1) Insert template.
2) Edit melody bars with presets and notes.
3) Play:
   - Intro plays bars 1–4
   - At bar 5, Triplets + Melody run concurrently
   - Both glow during playback
4) Save/reload and replay.

## Files you are allowed to touch (expected)
- docs/v9.5/phase-7/validation.md

## Commands to run (edit for repo reality)
cd frontend
npm run dev

## Success checklist
- [ ] Intro then concurrent branches at bar 5
- [ ] Glow works concurrently
- [ ] Save/load preserves custom melody

## Artifacts to attach under docs/v9.5
- docs/v9.5/phase-7/validation.md

## Common failure modes + fixes
- If concurrency fails: re-check Phase 2 semantics and whether compile merges events from both branches.
