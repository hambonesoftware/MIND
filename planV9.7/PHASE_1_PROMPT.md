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

# PHASE 1 PROMPT — Style Options Randomizer UX (seeded selection on open)

You are ChatGPT Codex. Execute Phase 1 of planV9.7 exactly.

## Objectives
Implement V9.7 UX in the Inspector:
- Remove/hide “auto vs override” UI and behavior
- Add Style Options panel behavior:
  - on open: seeded deterministic selection (only on triggers)
  - add Seed field (`styleSeed`) + Reroll button
  - write chosen values into standard Thought params:
    - notePatternId
    - harmonyMode + progressionCustom + defaults
    - rhythmGrid/syncopation/timingWarp/timingIntensity
    - instrumentPreset
    - registerMin/registerMax

## Files to edit
- frontend/src/ui/flowInspector.js
- frontend/src/music/styleResolver.js
- frontend/src/state/nodeRegistry.js (only if you need a hidden param marker)

## Required behavior (exact)
1. The panel must reroll ONLY when:
   - first-open for signature: `${styleId}|${moodId}|${styleSeed}`
   - OR user pressed Reroll
   - OR styleId changed
   - OR moodId changed
   - OR styleSeed changed
2. Re-opening without triggers must NOT reroll.
3. Reroll must be deterministic using seeded RNG (do NOT use unseeded Math.random()).
4. Manual dropdown changes must persist and not be overwritten unless a reroll trigger happens.

## Implementation guidance
- Add a hidden per-node marker in params or UI state (preferred):
  - `styleResolvedSignature` = `${styleId}|${moodId}|${styleSeed}`
  - Store it so reopen can detect “already resolved for this signature”.
- In styleResolver.js, implement:
  - stable hash from (styleSeed, nodeId, groupName)
  - seeded RNG (mulberry32 or LCG)
- Define a “reroll resolution” output struct that chooses IDs from catalogs.

## Manual smoke test (required)
1. Create Thought A. Set:
   - styleId = any
   - moodId = any
   - styleSeed = 7
2. Open Style Options panel:
   - confirm selections are set (pattern/progression/feel/instrument/register)
3. Close and reopen:
   - confirm values do NOT change
4. Change seed to 8:
   - confirm values change deterministically
5. Override notePatternId manually:
   - close/reopen, confirm it stays
6. Click Reroll:
   - confirm values change deterministically

## Tests (required)
- `python -m pytest`

## Success checklist
- [ ] Auto/override UI removed or disabled in UI
- [ ] Seed field present and writes to `styleSeed`
- [ ] Reroll button present and works
- [ ] Reroll happens only on triggers
- [ ] Reopen without triggers does not reroll
- [ ] Manual overrides persist
- [ ] `python -m pytest` passes
