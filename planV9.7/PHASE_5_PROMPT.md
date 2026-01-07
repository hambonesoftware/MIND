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

# PHASE 5 PROMPT — Add tests enforcing “style is real” (catalog coverage + harmony + patterns + determinism)

You are ChatGPT Codex. Execute Phase 5 of planV9.7 exactly.

## Objective
Add regression tests so style cannot regress into “fake catalogs” or nondeterministic output.

## Files to add
- backend/tests/test_style_catalog_coverage.py
- backend/tests/test_style_harmony_realness.py
- backend/tests/test_style_patterns_realness.py
- backend/tests/test_style_seed_determinism.py

## Test requirements

### A) Catalog coverage
Must verify:
- 6 styles exist
- each style meets minimum counts:
  - moods >= 4
  - patterns >= 8
  - progressions >= 12
  - feels >= 8
  - instruments >= 10
  - registers >= 6

Preferred approach:
- Add a structured JSON snapshot file (generated or maintained) that tests can read.
Examples:
- `frontend/src/music/catalogSnapshot.json` (or `shared/catalogSnapshot.json`)
Tests should avoid brittle regex parsing of JS.

### B) Harmony realness
- Build a minimal Thought payload using:
  - harmonyMode="progression_custom"
  - progressionCustom containing multiple chords
- Assert the runtime produces more than one distinct chord over time.

### C) Pattern realness
- Generate events for at least 3 of:
  - alberti_bass, walking_bass_simple, gate_mask, etc.
- Assert sequences differ meaningfully (rhythm and/or pitch contour).

### D) Seed determinism
- same seed => identical output
- different seed => different output

## Commands (required)
- `python -m pytest`

## Success checklist
- [ ] All 4 tests added
- [ ] Tests fail if catalogs drop below minimum coverage
- [ ] Tests fail if notePatternId routing removed
- [ ] Tests fail if determinism breaks
- [ ] `python -m pytest` passes
