# Agent — UI Thought Wizard (Modal)

## Mission
Implement Option B (modal) guided Thought creation:
- Vertical chapter/step flow
- Filters downstream options based on prior choices
- Writes only to `intent` (and triggers compiled refresh)

## Required UX
- Modal opens when inserting a Thought and when editing an existing Thought.
- Playback bar area exists at the top (Phase05 adds the audio behavior).
- Steps are split into multiple files (avoid mega-files).

## Folder structure (required)
- `frontend/src/ui/thoughtWizard/`
- `frontend/src/ui/thoughtWizard/steps/`

## Hard rule
No raw key strings in wizard folder. Use:
- `frontend/src/music/immutables.js`

## Verification
- `node scripts/audit_no_raw_thought_keys.mjs`
