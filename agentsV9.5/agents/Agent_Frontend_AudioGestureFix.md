# Agent_Frontend_AudioGestureFix

## Purpose
Ensure AudioContext creation/resume and audio-engine init happen ONLY after a user gesture (Play click). Remove pre-click autoplay warnings.

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
1) Find all AudioContext creation/resume points:
   - `new AudioContext`, `webkitAudioContext`, `.resume()`, engine `.start()`
2) Confirm none run during module import or app bootstrap.
3) Add a single gate helper conceptually like `ensureAudioStarted()`:
   - create context if missing
   - resume if suspended
   - return only when running
4) Call the gate ONLY from click handlers:
   - transport Play
   - Start-node Play (if present)
5) Verify Stop does not break the next Play.
6) Add temporary debug logs for init order; remove or guard after validation.

## Files you are allowed to touch (expected)
- frontend/src/main.js
- frontend/src/audio/audioEngine.js
- frontend/src/audio/transport.js
- any module that initializes audio on load

## Commands to run (edit for repo reality)
cd frontend
npm run dev

## Success checklist
- [ ] Hard refresh shows no AudioContext gesture warnings before clicking
- [ ] First Play click starts/resumes audio successfully
- [ ] 3x Play/Stop works without degradation

## Artifacts to attach under docs/v9.5
- docs/v9.5/phase-1/console.log.txt
- docs/v9.5/phase-1/notes.md

## Common failure modes + fixes
- If audio starts only after multiple clicks: you still have a pre-gesture init path; keep searching.
- If context resumes but audio is silent: ensure engine/worklet init runs after resume.
