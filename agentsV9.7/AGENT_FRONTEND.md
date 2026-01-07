# AGENT_FRONTEND (V9.7)
Date: 2026-01-06

## Mission
Deliver the V9.7 Style Options UX:
- seeded random selection on open (not auto/override)
- reroll button + seed behavior
- cascading dropdowns powered by catalogs
- harmony selections written as progression_custom text
- Inspector focus-steal fix (Phase 6)
- keep backward compatibility

## Primary phases
- Phase 1, Phase 2, Phase 3, Phase 6, Phase 8

## Commands
- Run app: `python run.py`
- Tests: `python -m pytest`

## Canonical files to touch
- frontend/src/ui/flowInspector.js
- frontend/src/music/styleResolver.js
- frontend/src/music/styleCatalog.js
- frontend/src/music/moodCatalog.js
- frontend/src/music/patternCatalog.js
- frontend/src/music/harmonyCatalog.js
- frontend/src/music/feelCatalog.js
- frontend/src/music/instrumentCatalog.js
- frontend/src/music/capabilities.js
- frontend/src/music/progressions.js
- frontend/src/state/nodeRegistry.js (only if new param needed)

## Phase 1 runbook: Style Options Randomizer UX
### Checklist
- [ ] Auto/override toggles removed from UI
- [ ] Style Options rerolls deterministically only on triggers
- [ ] Triggers: first-open signature, styleId change, moodId change, styleSeed change, reroll button
- [ ] Reopen without triggers does NOT reroll
- [ ] Selections written into params: notePatternId, harmonyMode/progressionCustom, feel fields, instrumentPreset, registerMin/registerMax

### Implementation notes
- Add per-node signature marker (recommended): `styleResolvedSignature` = `${styleId}|${moodId}|${styleSeed}`
- Seeded RNG: implement in styleResolver.js (e.g., mulberry32) and seed from a stable hash of inputs.

## Phase 2 runbook: Catalog coverage
- Ensure each style meets minimum counts (plan Phase 2).
- Gate unsupported patterns from recommended view via capabilities.js.

## Phase 3 runbook: Harmony progression_custom mapping
- Style-selected harmony MUST write:
  - harmonyMode="progression_custom"
  - progressionCustom="..."
  - progressionLength/chordsPerBar/fillBehavior set
- Manual preset mode must remain usable.

## Phase 6 runbook: Inspector focus fix
- Implement debounced commits (200–300ms) for text/number inputs.
- Confirm typing does not lose focus.

## Report template
- Files changed:
- Commands run:
- Tests:
- Manual smoke outcomes:
- Checklist status:
