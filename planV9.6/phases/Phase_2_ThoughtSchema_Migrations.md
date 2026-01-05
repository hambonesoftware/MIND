# Phase 2 — Thought Schema + Graph Migrations

## Objective
Add new Thought “style metadata” fields to the frontend schema and ensure:
- Old graphs migrate without changes to sound.
- New fields have safe defaults.

## Primary agent
- Agent_Frontend_ThoughtMigrations

## Supporting agents
- Agent_Frontend_StyleCatalogResolver
- Agent_QA_TestMatrixAndRegression

## Files to modify
- `frontend/src/state/nodeRegistry.js`
- `frontend/src/state/flowGraph.js`

## Tasks

### 2.1 Extend Thought paramSchema + defaults
In `nodeRegistry.js`, add to Thought:
- `styleId` (string)
- `styleSeed` (number)
- `styleOptionModes` (object or separate strings)
- `styleOptionLocks` (object)
- `styleOptionOverrides` (object)

**Default behavior requirements**
- Existing behavior remains “manual” until the user enables Auto.
Recommended defaults for newly created thoughts:
- `styleId`: pick a sensible default (e.g., `classical_film` or `pop_rock`)
- `styleSeed`: 1 (or a random-but-deterministic initial seed if you have a global seed)
- styleOptionModes: Auto for notePattern/chordProgression/feel, but safe defaults are ok.

Recommended migration defaults for existing thoughts:
- `styleId = 'legacy'`
- `styleSeed = 0`
- styleOptionModes: all “override” to prevent any auto rewrite

### 2.2 Update graph migration / normalization
In `flowGraph.js`, ensure migration:
- Detects missing style fields and populates them
- Does not mutate existing “runtime params” (progressionPresetId, patternType, etc.)

### 2.3 Add a schema validation helper (optional)
If you have a node param validation pass, ensure it tolerates the new fields.

## Testing that must pass
- `cd backend && pytest -q`
- Manual UI smoke:
  - load an existing graph
  - open a Thought inspector
  - confirm no crash and fields show

## Success checklist
- [ ] Thought schema includes new style fields
- [ ] Existing graphs load with no sound/config change
- [ ] New thoughts include style fields by default
- [ ] Backend tests pass
