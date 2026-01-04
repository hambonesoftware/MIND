# Agent_Frontend_Runbook

## Purpose
Document the canonical local run commands/URLs and the user-gesture policy for audio.

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
1) Create `docs/v9.5/runbook.md`.
2) Write exact commands to run backend + frontend locally.
3) Document which UI action is the canonical “user gesture” that must start/resume audio.
4) Document how to collect console logs and where to save them.

## Files you are allowed to touch (expected)
- docs/v9.5/runbook.md

## Commands to run (edit for repo reality)
# Documentation-only

## Success checklist
- [ ] Runbook exists and is accurate
- [ ] Includes “gesture starts audio” rule
- [ ] Includes log capture steps

## Artifacts to attach under docs/v9.5
- docs/v9.5/runbook.md

## Common failure modes + fixes
- If you can’t find the correct start commands: search repo README/package scripts and record what you find.
