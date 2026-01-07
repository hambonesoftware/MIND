# Agent: Schema Join + Normalize (Phase 1)

## Mission
Execute Phase 1 of planV9.8:
- add joined objects to schema/defaults
- implement normalizeMusicThoughtParams(params)
- update compile pipeline to use canonical shape
- preserve backward compatibility for v9.7 flat keys

## Inputs
- `planV9.8/Phase1_SchemaJoin_Normalize_BackCompat.md`

## Primary files
- `frontend/src/state/nodeRegistry.js`
- `frontend/src/state/compilePayload.js`
- (recommended) `frontend/src/music/normalizeThought.js`

## Tasks
1) Add joined objects to paramSchema/defaults for the Music Thought:
   - `style`, `harmony`, `pattern`, `feel`, `voice`
   Keep legacy keys untouched.

2) Implement:
   - `normalizeMusicThoughtParams(params)`
   Joined-first, legacy-fallback.

3) Update compilePayload:
   - Call normalization early.
   - Use the returned canonical structure downstream (even if some compilation paths
     still rely on legacy values internally, route them through canon).

4) Duplicate-grid minimal rule:
   - If pattern.custom.grid exists and feel.manual.grid is missing, inherit.

## Commands to run
- `npm run lint`
- `npm run test` (if present)
- `npm run dev` + Phase 0 smoke tests

## Report back with
- file diffs summary
- where normalization is called
- examples showing:
  - legacy-only thought → canon produced correctly
  - joined-only thought → canon produced correctly

## Success checklist
- [ ] Joined objects added, legacy preserved
- [ ] Normalization exists and is used by compilePayload
- [ ] Legacy thoughts compile/play
- [ ] Joined thoughts compile/play (can be via temporary JSON edit)
- [ ] No console errors
