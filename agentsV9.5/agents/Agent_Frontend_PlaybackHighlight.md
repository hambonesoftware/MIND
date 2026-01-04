# Agent_Frontend_PlaybackHighlight

## Purpose
Make the currently-playing Thought(s) glow based on scheduled events’ sourceNodeId.

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
1) Compute `playingNodeIds` from the current bar’s scheduled events.
2) Store `playingNodeIds` in flowStore runtime slice each bar change.
3) In flow canvas, apply a CSS class when node.id is in `playingNodeIds`.
4) Support multiple concurrent glowing nodes.
5) Clear glow on stop.

## Files you are allowed to touch (expected)
- frontend/src/audio/transport.js
- frontend/src/state/flowGraph.js
- frontend/src/ui/flowCanvas.js
- frontend/styles.css

## Commands to run (edit for repo reality)
cd frontend
npm run dev

## Success checklist
- [ ] Active thought glows during playback
- [ ] Concurrent thoughts glow simultaneously
- [ ] Glow clears on stop

## Artifacts to attach under docs/v9.5
- docs/v9.5/phase-6/notes.md

## Common failure modes + fixes
- If glow flickers: update glow only on bar boundary, not every compile segment.
