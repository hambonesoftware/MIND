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

# Phase 1 — Change Style Options UX to “Seeded Random Selection on Open” (remove auto/override UI)

## Goal
Replace the V9.6 “auto vs override” concept with the V9.7 model:
- Style Options are simply **current selected values**
- On first open after reroll trigger, the system picks deterministic random selections and sets them.

## Owners
- AGENT_FRONTEND (primary)
- AGENT_TEST (support)

## Files to change
- frontend/src/ui/flowInspector.js
- frontend/src/music/styleResolver.js
- frontend/src/state/nodeRegistry.js (only if new state fields needed)

## Implementation requirements
1. **UI changes**
   - Remove/hide “styleOptionModes” (auto/override toggles) from the UI.
   - Keep: `styleId`, `moodId`, `styleSeed`
   - Add in Style Options header:
     - **Seed field** (binds to `styleSeed`)
     - **Reroll button**
   - Style Options panel contains the dependent dropdowns:
     - Note Pattern (binds to `notePatternId`)
     - Harmony/Progression (writes `harmonyMode`, `progressionCustom`, and related defaults)
     - Feel (writes `rhythmGrid`, `syncopation`, `timingWarp`, `timingIntensity`)
     - Instrument (writes `instrumentPreset`)
     - Register (writes `registerMin`, `registerMax`)

2. **Reroll triggers**
   Reroll must occur when:
   - Style Options panel is opened AND the node has not been “style-initialized” for current (styleId, moodId, styleSeed)
   - OR user presses Reroll button
   - OR user changes `styleSeed`
   - OR user changes `styleId` or `moodId`

3. **No reroll on mere reopen**
   - If no trigger occurred, opening/closing panel must not change user selections.

4. **Determinism**
   - The selections chosen by reroll must be deterministic given:
     - `styleSeed`, `styleId`, `moodId`, and node id
   - Determinism happens in `frontend/src/music/styleResolver.js` (or a helper) and must not rely on `Math.random()` without seeding.

## Data model handling
- Keep existing fields in storage for compatibility:
  - `styleOptionModes`, `styleOptionLocks`, `styleOptionOverrides`
- But in V9.7 UX, they should no longer drive behavior.
- Add a single new hidden state marker if needed, e.g.:
  - `styleResolvedSignature` (string hash of styleId|moodId|styleSeed)
  - or `styleLastResolved` object
  This allows “reroll only when changed”.

## Tests
Manual smoke test:
1. Create Thought A, set styleId + moodId + seed=7.
2. Open Style Options → observe choices set.
3. Close/open again → choices unchanged.
4. Change seed to 8 → choices update (reroll).
5. Change styleId → choices update (reroll).
6. Manually override Note Pattern dropdown → close/open → stays overridden.

## Success checklist
- [ ] Auto/override toggles no longer shown
- [ ] Opening Style Options triggers deterministic selection exactly once per signature
- [ ] Reroll button works
- [ ] Seed edit rerolls deterministically
- [ ] User manual edits persist through reopen
