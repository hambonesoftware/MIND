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

# PHASE 7 PROMPT — Documentation + smoke checklist

You are ChatGPT Codex. Execute Phase 7 of planV9.7 exactly.

## Objective
Document V9.7 behavior and add a smoke checklist usable by non-devs.

## Files to add
- docs/v9.7/style-options-randomizer.md
- docs/v9.7/style-realness-smoke.md

## Documentation requirements
1. Explain:
   - style selection
   - mood selection
   - seed field behavior
   - reroll triggers
   - how manual overrides work
2. Smoke checklist must include:
   - per-style steps (6 styles)
   - determinism check (same seed reproduces)
   - “pattern difference” check
   - focus-bug check

## Tests (required)
- `python -m pytest`

## Success checklist
- [ ] Docs exist and are readable step-by-step
- [ ] Smoke checklist is complete for all 6 styles
- [ ] `python -m pytest` passes
