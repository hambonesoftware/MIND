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

# Phase 7 — Documentation + smoke checklist + release packaging

## Goal
Document V9.7 behavior and provide a repeatable smoke checklist.

## Owners
- AGENT_DOCS (primary)
- AGENT_TEST (support)

## Files to add
- docs/v9.7/style-options-randomizer.md
- docs/v9.7/style-realness-smoke.md

## Documentation requirements
- Explain:
  - Style selection
  - Mood selection
  - Seed usage
  - When reroll happens
  - How to override values
- Include a smoke checklist:
  - One per style to confirm audible differences
  - Determinism check steps (seed repeatability)
  - Focus bug check steps

## Tests
- `python -m pytest`

## Success checklist
- [ ] Docs exist with clear steps
- [ ] Smoke checklist can be followed by a non-dev
- [ ] Tests still pass
