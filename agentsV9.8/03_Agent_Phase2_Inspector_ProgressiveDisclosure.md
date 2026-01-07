# Agent: Inspector Progressive Disclosure (Phase 2)

## Mission
Execute Phase 2 of planV9.8:
- introduce Simple/Advanced/Expert inspector views
- render joined object editors as primary
- keep legacy fields hidden except in Expert → “Legacy (v9.7)” section
- ensure edits write to joined objects

## Inputs
- `planV9.8/Phase2_Inspector_ProgressiveDisclosure.md`

## Primary files
- `frontend/src/ui/flowInspector.js`
- (optional) small helper components under `frontend/src/ui/`

## Tasks
1) Add view mode control:
   - `simple | advanced | expert`
   Default: simple.

2) Simple view fields (minimal):
   - label, durationBars, key
   - style.id + mood (mode/id) + seed (re-roll optional)
   - voice.preset (optional override)

3) Advanced view:
   - harmony.mode + editors for selected mode
   - pattern.mode + editors for selected mode
   - feel.mode + (presetId or manual controls)
   - voice.register (min/max)

4) Expert view:
   - raw overrides (chordNotes, roman, custom melody editor)
   - legacy-only section (collapsible)

5) Legacy thoughts:
   - If no joined objects exist, initialize them on first edit.

## Commands to run
- `npm run lint`
- `npm run dev` + manual smoke tests

## Report back with
- screenshots not required, but describe:
  - what fields appear in each mode
  - confirmation edits write into joined objects
  - confirmation legacy thoughts still edit/play

## Success checklist
- [ ] Simple view is reduced (~6–10 fields)
- [ ] Advanced/Expert progressively reveal controls
- [ ] Joined objects are the primary edit target
- [ ] Legacy section exists in Expert only
- [ ] No console errors when toggling modes
