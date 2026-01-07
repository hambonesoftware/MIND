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

# Phase 2 — Catalog coverage for 6 styles (moods + patterns + harmony + feel + instrument + registers)

## Goal
Fill the style system so each style supports a variety of moods and enough choices to feel expressive.

## Owners
- AGENT_FRONTEND (primary)
- AGENT_DOCS (support)

## Files to change
- frontend/src/music/styleCatalog.js
- frontend/src/music/moodCatalog.js
- frontend/src/music/patternCatalog.js
- frontend/src/music/harmonyCatalog.js
- frontend/src/music/feelCatalog.js
- frontend/src/music/instrumentCatalog.js
- frontend/src/music/capabilities.js
- frontend/src/music/progressions.js (if it adapts harmony catalog)

## Minimum coverage requirements
For each style:
- >= 4 moods (exact minimum mood sets below)
- >= 8 patterns
- >= 12 progressions (each with 2–5 variants)
- >= 8 feel presets
- >= 10 instrument suggestions
- >= 6 register suggestions

Mood sets (minimums):
- classical_film: calm, romantic, ominous, triumphant
- jazz_blues_funk: cool, smoky, energetic, noir
- pop_rock: bright, anthemic, bittersweet, driving
- edm_electronic: uplifting, dark, hypnotic, playful
- latin_afro_cuban: sunny, fiery, suave, ceremonial
- folk_country_bluegrass: warm, lonesome, lively, nostalgic

## Important constraints
- Do NOT add “recommended” patterns that are not yet truly supported by backend runtime.
  - Unsupported patterns can exist, but must be gated to “All” view only in `capabilities.js`.
- Harmony catalog entries MUST be convertible into `progressionCustom` roman text (see Phase 3).

## Manual tests
- In UI, for each style:
  - Confirm moods exist
  - Confirm dropdowns show recommended items
  - Confirm “All” shows more than recommended (if implemented)

## Success checklist
- [ ] Each style meets minimum counts
- [ ] Mood diversity is represented in recommendations
- [ ] No unsupported pattern is recommended by default
- [ ] Catalog IDs are stable (no duplicates, no random changes)
