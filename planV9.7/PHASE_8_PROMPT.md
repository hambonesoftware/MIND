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

# PHASE 8 PROMPT — Hardening + final regression pass

You are ChatGPT Codex. Execute Phase 8 of planV9.7 exactly.

## Objectives
1. Ensure no runtime errors across typical workflows
2. Confirm backward compatibility with older graphs
3. Confirm style reroll rules and determinism
4. Produce a final completion report

## Steps
1. Run full test suite:
   - `python -m pytest`
2. Manual stress-smoke:
   - Switch styles repeatedly (10+ times)
   - Change seed repeatedly
   - Reroll spam (10 clicks)
   - Switch harmonyMode between progression_custom and progression_preset
   - Ensure no console errors and playback continues
3. Backward compatibility:
   - Load an older graph (V9.5/V9.6) and confirm it plays
4. Confirm reroll behavior:
   - reopen without triggers does not reroll
   - seed/style/mood change does reroll
5. Write a final report:
   - `docs/v9.7/COMPLETION_REPORT.md`
   Include:
   - user-visible changes summary
   - implemented notePatternId list
   - determinism statement
   - any known limitations

## Tests (required)
- `python -m pytest`

## Success checklist
- [ ] No console errors in stress-smoke
- [ ] Old graphs load and play
- [ ] Reroll triggers behave correctly
- [ ] Focus bug remains fixed
- [ ] `python -m pytest` passes
- [ ] Completion report written: docs/v9.7/COMPLETION_REPORT.md
