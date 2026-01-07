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

# Phase 3 — Harmony “realness” without backend preset-ID sync (generate progression_custom)

## Goal
Ensure that style-chosen chord progressions actually play, even if backend preset IDs don’t exist.

## Owners
- AGENT_FRONTEND (primary)
- AGENT_TEST (support)

## Files to change
- frontend/src/ui/flowInspector.js
- frontend/src/music/styleResolver.js
- frontend/src/music/harmonyCatalog.js (ensure roman templates exist)
- frontend/src/music/progressions.js (if needed)

## Requirements
1. When style options selection picks a progression from harmonyCatalog, write:
   - `harmonyMode = "progression_custom"`
   - `progressionCustom = "<roman progression text>"`
   - `progressionLength`, `chordsPerBar`, `fillBehavior` from catalog defaults
   - Optionally `progressionCustomVariantStyle` if you support it
2. Manual “Preset” mode must still work:
   - If user sets `harmonyMode="progression_preset"`, do NOT override with custom.
3. Deterministic variants:
   - If a harmony entry has variants, the seeded selection chooses a variant deterministically.
   - The generated roman string must reflect the chosen variant (rotation/substitution/etc).

## Tests
Manual:
- Pick EDM style + mood; open style options; confirm `harmonyMode` becomes progression_custom and the text is populated.
- Change seed; progressionCustom changes (but remains deterministic for same seed).
- Switch to preset manually; confirm style panel no longer overwrites it.

## Success checklist
- [ ] Style-selected progressions become progression_custom at runtime
- [ ] Variant selection reflected in progressionCustom
- [ ] Manual preset mode preserved
