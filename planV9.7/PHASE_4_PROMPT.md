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

# PHASE 4 PROMPT — Backend: implement real notePatternId generators

You are ChatGPT Codex. Execute Phase 4 of planV9.7 exactly.

## Objective
Make note patterns audibly distinct by honoring `notePatternId` in the backend runtime.

## Files to edit
- backend/mind_api/mind_core/stream_runtime.py
- backend/mind_api/mind_core/determinism.py
- backend/mind_api/mind_core/music_elements/texture_engine.py
- backend/mind_api/mind_core/music_elements/texture_recipe.py
- frontend/src/music/capabilities.js (to mark which notePatternId are truly supported)

## Required notePatternId implementations (exact IDs)
Implement these 6 behaviors:
- alberti_bass
- ostinato_pulse
- walking_bass_simple
- comping_stabs
- gate_mask
- step_arp_octave

## Routing rules
1. Prefer notePatternId:
   - In stream_runtime, if notePatternId exists, route to corresponding generator.
2. Backward compatibility:
   - If notePatternId missing, fall back to legacy `patternType` behavior.
3. Determinism:
   - Use stable seed from determinism.py.
   - same (styleSeed + nodeId + notePatternId + barIndex) => same events.

## Manual smoke (required)
- Create 3 Thoughts with the same harmony and grid, set:
  - notePatternId=alberti_bass
  - notePatternId=walking_bass_simple
  - notePatternId=gate_mask
- Confirm they sound clearly different.

## Tests (required)
- `python -m pytest`

## Success checklist
- [ ] notePatternId routing implemented
- [ ] 6 patterns implemented and audibly distinct
- [ ] deterministic across runs
- [ ] legacy graphs still work
- [ ] `python -m pytest` passes
