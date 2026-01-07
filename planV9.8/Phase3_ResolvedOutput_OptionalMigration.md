# Phase 3 — Resolved Output + Optional Migration Helpers (Minimized)

## Objective
Separate:
- what the user specifies (joined objects)
from
- what the engine plays (resolved/normalized output)

Add an optional `resolved` block (compile-time or persisted) to ensure deterministic playback when style suggestions and “auto” are involved.

## Scope
- `frontend/src/state/compilePayload.js`
- Possibly a helper: `frontend/src/music/resolveThought.js`
- Optional migration helper script (non-blocking)

## Design (Minimal)
### 1) Keep persistence simple
- Do NOT require `resolved` to be saved in project files immediately.
- Generate `resolved` during compilation and include it in the payload passed to the audio engine.

### 2) Add `resolved` as compile output
After `normalizeMusicThoughtParams()` runs, produce:

```js
const canon = normalizeMusicThoughtParams(params);
const resolved = resolveMusicThought(canon); // uses style resolver + catalogs
```

Then compilation uses `resolved` for final event generation.

### 3) Locking / overrides behavior (keep existing behavior)
- Preserve existing semantics of:
  - styleOptionModes / styleOptionLocks / styleOptionOverrides
- Internally, read them from `canon.style.resolution.*` (joined location)
- If legacy fields exist, normalization maps them into `canon.style.resolution.*`.

### 4) Optional migration helper (if repo has persistence format in JSON)
Add a script:
- `scripts/migrateThoughtParamsV97toV98.js` (or similar)
- It reads a project JSON file and:
  - creates joined objects if missing
  - leaves legacy keys intact
This is optional; do not block release on it.

## Tests / Verification
- Run Phase 0 smoke tests.
- Confirm that “auto” style choices resolve deterministically given the same seed.
- Confirm that locked selections do not change when re-resolving.

## Required Commands
- `npm run lint`
- `npm run test` (if present)
- `npm run dev`

## Success Checklist
- [ ] compilePayload produces a resolved structure and uses it for playback generation.
- [ ] Existing thoughts (legacy flat params) still compile/play.
- [ ] Joined thoughts compile/play.
- [ ] Style lock/override behavior remains correct.
- [ ] No regressions in the inspector UI.
