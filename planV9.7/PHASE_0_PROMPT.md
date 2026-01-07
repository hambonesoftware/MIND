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

# PHASE 0 PROMPT — Baseline, branch, acceptance capture

You are ChatGPT Codex. Execute Phase 0 of planV9.7 exactly.

## Objectives
1. Create a new working branch: `v9.7-style-randomizer`
2. Confirm current (V9.6) behavior and document baseline notes
3. Run existing tests and record results

## Steps
1. In repo root:
   - `git checkout -b v9.7-style-randomizer`
2. Run:
   - `python -m pytest`
   Capture output (pass/fail).
3. Run app:
   - `python run.py`
4. In UI:
   - Create a Thought node
   - Open Inspector for that Thought
   - Observe current style system behavior (expect V9.6 auto/override behavior)
   - Reproduce the focus-steal bug:
     - click label input, type several characters quickly
     - confirm focus jumps away / thought in workspace steals focus
5. Write a short baseline report in a new file:
   - `docs/v9.7/PHASE0_BASELINE.md`
   Include:
   - date/time
   - pytest summary
   - focus-steal repro steps confirmed
   - whether note patterns feel mostly arpeggio-based

## Testing (required)
- `python -m pytest` must pass OR failures must be documented in PHASE0_BASELINE.md with full traceback.

## Success checklist
- [ ] Branch `v9.7-style-randomizer` created
- [ ] Baseline report written: `docs/v9.7/PHASE0_BASELINE.md`
- [ ] `python -m pytest` results recorded
- [ ] Focus-steal bug reproduced and described
