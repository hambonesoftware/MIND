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

# PHASE 3 PROMPT — Harmony compatibility: write style-chosen progressions as progression_custom

You are ChatGPT Codex. Execute Phase 3 of planV9.7 exactly.

## Objective
Ensure style-selected chord progressions actually play without backend preset syncing by writing:
- harmonyMode="progression_custom"
- progressionCustom="<roman progression>"
- plus defaults progressionLength/chordsPerBar/fillBehavior

## Files to edit
- frontend/src/ui/flowInspector.js
- frontend/src/music/styleResolver.js
- frontend/src/music/harmonyCatalog.js
- frontend/src/music/progressions.js (if needed)

## Requirements
1. When style options pick a progression from harmonyCatalog:
   - set `harmonyMode="progression_custom"`
   - set `progressionCustom` roman text derived from chosen progression + variant
   - set `progressionLength`, `chordsPerBar`, `fillBehavior` from catalog defaults
2. Preserve manual preset mode:
   - If user explicitly sets `harmonyMode="progression_preset"`, do NOT overwrite with custom.
3. Deterministic variants:
   - Variant choice must be deterministic from styleSeed/nodeId
   - progressionCustom output must reflect the chosen variant.

## Manual tests (required)
1. Choose a style and mood; set seed=7; open style options:
   - confirm harmonyMode becomes progression_custom
   - confirm progressionCustom is non-empty
2. Change seed to 8:
   - confirm progressionCustom changes
3. Switch harmonyMode to progression_preset manually:
   - confirm style panel does not overwrite it on reopen (unless user presses reroll)

## Tests (required)
- `python -m pytest`

## Success checklist
- [ ] Style-selected harmony always results in progression_custom text
- [ ] Preset mode preserved for manual choice
- [ ] Variants deterministically alter progressionCustom
- [ ] `python -m pytest` passes
