# Agent: Resolve Output + Optional Migration (Phase 3)

## Mission
Execute Phase 3 of planV9.8:
- introduce (or adapt) a `resolved` compile-time structure
- ensure deterministic auto-resolution with seed
- preserve lock/override semantics (existing behavior)
- optional migration helper script (non-blocking)

## Inputs
- `planV9.8/Phase3_ResolvedOutput_OptionalMigration.md`

## Primary files
- `frontend/src/state/compilePayload.js`
- (optional) `frontend/src/music/resolveThought.js`
- (optional) `scripts/migrateThoughtParamsV97toV98.js`

## Tasks
1) After normalization, add:
   - `resolved = resolveMusicThought(canon)`
   where resolveMusicThought uses existing style resolver/catalog logic if available.

2) Compilation uses `resolved` to generate final payload.

3) Map lock/override fields:
   - canon.style.resolution.modes/locks/overrides
   Ensure legacy fields map into these during normalization.

4) Optional migration script:
   - reads a project JSON
   - adds joined objects if missing
   - leaves legacy keys intact

## Commands to run
- `npm run lint`
- `npm run test` (if present)
- `npm run dev` + manual smoke tests

## Report back with
- explanation of resolved fields (where stored and how used)
- demonstration that same seed → same resolution
- demonstration that locks prevent changes

## Success checklist
- [ ] compilePayload uses resolved output for playback
- [ ] legacy thoughts still compile/play
- [ ] joined thoughts compile/play
- [ ] seed determinism preserved
- [ ] lock/override behavior preserved
- [ ] optional migration script included or explicitly skipped (with rationale)
