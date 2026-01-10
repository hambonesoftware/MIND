# Agent — Audio Thought Preview

## Mission
Implement top-of-modal playback that previews the full Thought while editing.

## Design constraints
- Audio scheduling logic is isolated from UI:
  - `frontend/src/audio/thoughtPreview/index.js`
  - `frontend/src/audio/thoughtPreview/buildPreviewGraph.js`
  - `frontend/src/audio/thoughtPreview/schedulePreview.js`
- Wizard UI calls a small API: start/stop/restart/debounce-compile.

## Verification
- `node scripts/test_thought_preview_shape.mjs`
- Manual: open wizard, Play/Stop, tweak steps, hear changes, close modal stops audio cleanly.
