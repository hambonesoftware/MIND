# MIND Plan V9.7 (Style Options Randomizer + Real Style Output)
Date: 2026-01-06
Timezone: America/Detroit

This plan upgrades the V9.6 style system into a **seeded random style-option picker** (no “auto vs override” modes), expands catalogs, and makes style choices **audibly real** (not just arpeggios), while fixing the **Inspector focus-steal** bug.

## Key UX change (V9.7)
- User selects **Style** (and optionally **Mood**).
- **Style Options** panel contains dropdowns for:
  - Note Pattern (`notePatternId`)
  - Chord Progression (written as `harmonyMode="progression_custom"` + `progressionCustom`)
  - Feel (grid/swing/push/pull/intensity)
  - Instrument (`instrumentPreset`)
  - Register range (`registerMin`, `registerMax`)
- When the user **opens** the Style Options panel (first open after style/mood/seed change), the app:
  - picks a **deterministic random** selection for each option based on **`styleSeed` + nodeId + styleId + moodId**
  - writes those values into the Thought params (so they are simply “selected values”, not “auto”)
- The user can then freely change any dropdown afterwards.
- Provide a **Reroll** button and a **Seed** field (changing seed rerolls).
- Re-opening the panel must **not reroll** unless a reroll trigger occurred (seed/style/mood changed OR user pressed reroll).

## Backward compatibility rules
- Existing graphs continue to work.
- Existing params remain supported: `patternType`, `progressionPresetId`, etc.
- New behavior prefers `notePatternId` when available, falls back to `patternType`.

## Repo paths (must stay correct)
Frontend:
- frontend/src/ui/flowInspector.js
- frontend/src/state/nodeRegistry.js
- frontend/src/music/styleCatalog.js
- frontend/src/music/moodCatalog.js
- frontend/src/music/patternCatalog.js
- frontend/src/music/harmonyCatalog.js
- frontend/src/music/feelCatalog.js
- frontend/src/music/instrumentCatalog.js
- frontend/src/music/capabilities.js
- frontend/src/music/styleResolver.js
- frontend/src/music/progressions.js

Backend:
- backend/mind_api/mind_core/stream_runtime.py
- backend/mind_api/mind_core/determinism.py
- backend/mind_api/mind_core/music_elements/texture_engine.py
- backend/mind_api/mind_core/music_elements/texture_recipe.py
- backend/mind_api/mind_core/music_elements/harmony_plan.py
- backend/mind_api/mind_core/music_elements/phrase_plan.py

Tests:
- backend/tests/

## Agents assumed to exist (do not create here)
- AGENT_FRONTEND: owns inspector UX + catalogs + resolver
- AGENT_BACKEND_AUDIO: owns runtime note pattern generators
- AGENT_TEST: owns pytest additions + regression
- AGENT_DOCS: owns documentation + smoke test scripts


---

# Phase 6 — Fix Inspector focus-steal while typing (debounced commits)

## Goal
Stop the Thought node/canvas from stealing focus after every keystroke in the Inspector.

## Owners
- AGENT_FRONTEND (primary)
- AGENT_TEST (support)

## Files to change
- frontend/src/ui/flowInspector.js

## Root cause
- Inspector rebuilds DOM (e.g., `content.innerHTML = ''`) on each store update
- Text inputs commit on every `input` event, triggering rerender and losing focus

## Implementation requirements
1. Implement debounced commit (200–300ms) for text/number inputs:
   - Update local UI value immediately
   - Only call `store.updateNode(...)` after debounce idle OR on blur
2. Preserve caret position (selectionStart/End) across commits if possible.
3. Select/checkbox controls can remain immediate (no debounce).

## Manual tests
1. Open app, select Thought.
2. Type in `label` input quickly.
3. Verify focus stays in input; caret does not jump.
4. Repeat for `progressionCustom` textarea.
5. Verify canvas/workspace never steals focus during typing.

## Success checklist
- [ ] No focus steal for label, key, progressionCustom, numeric fields
- [ ] No noticeable lag for dropdown changes
- [ ] No regressions in inspector updates
