# Agent_Frontend_SpessaSynthInit

## Purpose
Stabilize SpessaSynth WorkerSynthesizer init order (and ensure graceful fallback) to reduce `isReady timed out` errors.

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
1) Identify the SpessaSynth init path (worker creation + handshake).
2) Verify worker URL resolves (200) in Network tab.
3) Confirm init occurs only after AudioContext is running.
4) Add diagnostics logs:
   - worker created
   - first message received
   - ready resolved
5) Ensure fallback to worklet is fast and non-spammy.

## Files you are allowed to touch (expected)
- frontend/src/audio/spessa/SpessaSynthEngine.js (or equivalent)
- frontend/src/worker/* (worker bootstrap)
- frontend/src/audio/audioEngine.js (init orchestration)

## Commands to run (edit for repo reality)
cd frontend
npm run dev

## Success checklist
- [ ] WorkerSynthesizer no longer times out in normal runs OR fallback is immediate and audio plays
- [ ] No repeated isReady timeouts per session

## Artifacts to attach under docs/v9.5
- docs/v9.5/phase-1/spessa-init-notes.md
- docs/v9.5/phase-1/console.log.txt

## Common failure modes + fixes
- If worker file 404s: fix bundler URL resolution.
- If worker is blocked: confirm correct worker type/module usage.
