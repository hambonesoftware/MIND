# Phase 6 — Polish + Docs + Release Gate

## Objective
Finalize V9.6:
- polish inspector UX
- ensure regressions are covered
- document the new Thought structure
- prepare release notes and final test run

## Primary agent
- Agent_QA_TestMatrixAndRegression

## Supporting agents
- Agent_Frontend_ThoughtInspectorReorg
- Agent_Frontend_StyleCatalogResolver
- Agent_Backend_RuntimeCompatibility

## Files to modify / create
- `docs/v9.6/whats_new_v9_6.md`
- `docs/V9_UI_CONTRACT.md` (update Thought section)
- `docs/V9_NODE_TYPES.md` (update Thought params)
- `docs/v9.6/runbook.md` (optional)

## Tasks

### 6.1 UX polish
- Make Style Options collapsed by default
- Add small helper text:
  - “Seed controls Auto choices”
- Ensure keyboard-friendly controls

### 6.2 Regression checklist run
Run the full test matrix:
- `node scripts/test_style_resolver.mjs`
- `cd backend && pytest -q`
- Manual regression scenarios from `docs/v9.6/test_matrix.md`

### 6.3 Docs updates
- Document:
  - the new Thought layout
  - meaning of seed
  - Auto/Override/Lock behavior
  - determinism rules

### 6.4 Release notes
Write `docs/v9.6/whats_new_v9_6.md` with:
- Summary of feature
- Upgrade notes (no sound changes until Auto enabled)
- Known limitations (catalog changes can change seed outputs unless versioned)

## Testing that must pass
- Full matrix:
  - `node scripts/test_style_resolver.mjs`
  - `cd backend && pytest -q`
  - Manual regression pass

## Success checklist
- [ ] All tests pass
- [ ] Docs updated
- [ ] Release notes written
- [ ] Inspector UX is clean and stable
- [ ] No regressions in playback / compile
