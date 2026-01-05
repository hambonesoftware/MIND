# Phase 4 — Auto/Override/Locks + Seed UI (Reroll/Copy/Paste)

## Objective
Make Style Options functional:
- Auto/Override per option group
- Optional Lock toggles
- Seed actions: Reroll / Copy / Paste
- Deterministic resolution updates existing runtime params when Auto is enabled

## Primary agent
- Agent_Frontend_ThoughtInspectorReorg

## Supporting agents
- Agent_Frontend_StyleCatalogResolver
- Agent_QA_TestMatrixAndRegression
- Agent_Backend_RuntimeCompatibility

## Files to modify
- `frontend/src/ui/flowInspector.js`
- `frontend/src/music/styleResolver.js` (if adjustments)
- `frontend/src/state/flowGraph.js` (if persistence tweaks)
- `frontend/styles.css` (for lock/auto UI)

## Tasks

### 4.1 Add option modes + locks UI
For each style-driven item, provide:
- Mode selector: Auto / Override
- Lock toggle (optional but recommended)
Items:
- Chord Progression (presetId + variantId)
- Note Pattern (patternType / notePatternId)
- Harmony Mode
- Feel (rhythmGrid, syncopation, timingWarp, timingIntensity)
- Instrument (preset, soundfont)
- Register (min/max)

### 4.2 Implement “Apply Auto” resolution
When:
- styleId changes OR
- styleSeed changes OR
- user clicks Reroll
Then:
- Call `resolveThoughtStyle(...)`
- Apply ONLY fields where:
  - mode == Auto AND not locked AND not overridden

**Safety requirement**
- Never overwrite custom progression text or chordNotes unless the user explicitly sets those to Auto.

### 4.3 Seed actions
- Reroll:
  - sets `styleSeed` to a new integer (use a deterministic increment, or random via crypto if available)
  - triggers resolution
- Copy:
  - copies `styleSeed` to clipboard
- Paste:
  - reads clipboard, parses int, sets seed, triggers resolution

### 4.4 Determinism + UI consistency
- Show a small “Resolved preview” line (optional):
  - e.g., “Auto: Pop I–V–vi–IV • Arp UpDown • Grid 1/16”
- Ensure changes are idempotent.

## Testing that must pass
- `node scripts/test_style_resolver.mjs`
- Manual UI tests:
  1. Same style+seed on two thoughts produces same resolved fields (when Auto enabled)
  2. Reroll changes at least one resolved field
  3. Lock prevents changes on reroll
  4. Override prevents changes on reroll
- `cd backend && pytest -q`

## Success checklist
- [ ] Auto/Override works for each style option group
- [ ] Reroll/Copy/Paste seed works
- [ ] Determinism holds
- [ ] No accidental overwrites of user custom text fields
- [ ] Backend tests pass
