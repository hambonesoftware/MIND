# Agent: SmokeTests + Baseline Audit (Phase 0)

## Mission
Execute Phase 0 of planV9.8:
- locate Music Thought node definition
- locate inspector rendering logic
- locate compile pipeline entry points
- add manual smoke tests doc

## Inputs
- `planV9.8/Phase0_Baseline_Guardrails.md`

## Tasks
1) Identify the Music Thought node key in:
   - `frontend/src/state/nodeRegistry.js`
2) Identify inspector rendering sections in:
   - `frontend/src/ui/flowInspector.js`
3) Identify compilation entry points in:
   - `frontend/src/state/compilePayload.js`
4) Create:
   - `frontend/src/dev/SMOKE_TESTS_V9_8.md`
   containing the manual smoke tests from the plan.

## Commands to run
- `npm run lint` (or repo equivalent)
- `npm run test` (if present)
- `npm run dev` (manual run)

## Report back with
- Music Thought node key name and file/line anchors
- inspector functions/components that render it
- compile functions that interpret it
- confirmation that SMOKE_TESTS_V9_8.md exists
- any issues discovered that could affect later phases

## Success checklist
- [ ] Node key and schema location identified
- [ ] Inspector rendering location identified
- [ ] compilePayload entry points identified
- [ ] SMOKE_TESTS_V9_8.md added
- [ ] Dev server loads with zero console errors
