# Codex Execution Runbook — MIND V9.7
Date: 2026-01-06
Timezone: America/Indiana/Indianapolis

This package contains **copy/paste prompts** for ChatGPT Codex to execute each phase of **planV9.7**.
Each phase prompt includes:
- Exact objectives
- Exact file paths
- Exact param keys
- Required commands to run
- Tests to run
- Success checklist

## Canonical repo commands
- Run app: `python run.py`
- Run tests: `python -m pytest`

## Canonical paths (do not rename)
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

## Thought param keys (exact)
Identity/duration:
- label
- durationBars
- key

Style metadata:
- styleId
- styleSeed
- moodMode
- moodId
- styleOptionModes (legacy; not used in V9.7 UI)
- styleOptionLocks (legacy; not used in V9.7 UI)
- styleOptionOverrides (legacy; may remain)
- dropdownViewPrefs (optional)

Harmony:
- harmonyMode  (values: single | progression_preset | progression_custom)
- chordRoot
- chordQuality
- chordNotes
- progressionPresetId
- progressionVariantId
- progressionLength
- chordsPerBar
- fillBehavior
- progressionCustom
- progressionCustomVariantStyle

Pattern/feel:
- notePatternId
- patternType (legacy runtime fallback)
- rhythmGrid
- syncopation
- timingWarp
- timingIntensity

Instrument/register:
- instrumentSoundfont
- instrumentPreset
- registerMin
- registerMax

## V9.7 UX rule (critical)
Style Options are **selected values**, not “auto vs override”.
When the Style Options panel opens, it performs a **seeded deterministic reroll** only if:
- it is the first open for the current signature (styleId|moodId|styleSeed), OR
- the user pressed Reroll, OR
- styleId/moodId/styleSeed changed.

Reopen without triggers must NOT reroll.


---

# PHASE 2 PROMPT — Catalog coverage for 6 styles (moods + patterns + harmony + feel + instrument + registers)

You are ChatGPT Codex. Execute Phase 2 of planV9.7 exactly.

## Objectives
Fill catalogs so each of the 6 styles has enough content + mood variety.

Styles:
- classical_film
- jazz_blues_funk
- pop_rock
- edm_electronic
- latin_afro_cuban
- folk_country_bluegrass

## Files to edit
- frontend/src/music/styleCatalog.js
- frontend/src/music/moodCatalog.js
- frontend/src/music/patternCatalog.js
- frontend/src/music/harmonyCatalog.js
- frontend/src/music/feelCatalog.js
- frontend/src/music/instrumentCatalog.js
- frontend/src/music/capabilities.js
- frontend/src/music/progressions.js (if needed)

## Minimum counts (must meet)
For EACH style:
- moods >= 4
- patterns >= 8
- progressions >= 12 (each with 2–5 variants)
- feels >= 8
- instruments >= 10
- registers >= 6

Minimum mood sets:
- classical_film: calm, romantic, ominous, triumphant
- jazz_blues_funk: cool, smoky, energetic, noir
- pop_rock: bright, anthemic, bittersweet, driving
- edm_electronic: uplifting, dark, hypnotic, playful
- latin_afro_cuban: sunny, fiery, suave, ceremonial
- folk_country_bluegrass: warm, lonesome, lively, nostalgic

## Critical constraints
1. Pattern recommendation gating:
   - Do NOT mark patterns as recommended if backend does not truly support them yet.
   - Unsupported patterns may exist but should appear only in “All”, not “Recommended”, using capabilities.js.
2. Harmony entries MUST be convertible to progressionCustom roman text.
   - Ensure each harmony entry contains a roman template/bars representation that can be rendered to progressionCustom.

## Manual verification (required)
- In UI for each style:
  - verify moods show up
  - verify note pattern dropdown is populated
  - verify chord progression dropdown is populated
  - verify feel/instrument/register dropdowns are populated

## Tests (required)
- `python -m pytest`

## Success checklist
- [ ] All 6 styles exist and have required counts
- [ ] Mood sets exist per style
- [ ] No unsupported pattern is recommended by default
- [ ] Harmony entries can be converted to roman progressionCustom text
- [ ] `python -m pytest` passes
