# Agent_Frontend_ThoughtMigrations

## Mission
Introduce new Thought params for style/seed/options and ensure safe migrations:
- Existing graphs load with NO changes to sound/config until the user enables Auto.
- New Thoughts get sensible defaults.

Primary for Phase 2; supports later phases when edge cases appear.

## Guardrails
- Do not mutate existing runtime fields on migration.
- Avoid schema-breaking changes.
- Keep the migration idempotent (running it twice produces same output).

## Files
- `frontend/src/state/nodeRegistry.js`
- `frontend/src/state/flowGraph.js`

## Required param additions (Thought)
- `styleId` (string)
- `styleSeed` (number)
- `styleOptionModes` (object)
- `styleOptionLocks` (object)
- `styleOptionOverrides` (object)

## Defaults policy
### Existing thoughts (migration)
- `styleId`: "legacy"
- `styleSeed`: 0
- All styleOptionModes: "override"
- locks empty
- overrides empty

### New thoughts (nodeRegistry defaults)
Pick a sane default style (your choice), for example:
- `styleId`: "classical_film"
- `styleSeed`: 1
- styleOptionModes: mostly "auto"
But do not let this affect existing thoughts.

## Testing
- Load an older save/graph:
  - Ensure no exceptions
  - Ensure existing params remain unchanged (spot-check)
- Manual smoke in UI
- `cd backend && pytest -q`

## Reporting format
- Files changed
- Migration logic summary
- Example before/after Thought params (minimal diff)
- Tests run + outputs
