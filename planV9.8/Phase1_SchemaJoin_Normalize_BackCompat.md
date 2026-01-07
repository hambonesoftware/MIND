# Phase 1 — Schema Join + Back-Compat Normalization (Core)

## Objective
Introduce **joined/grouped objects** in the Music Thought schema while preserving all v9.7 legacy flat fields.
Update the compile pipeline to prefer joined objects, but **fallback** to legacy keys.

## Scope
- `frontend/src/state/nodeRegistry.js`:
  - add joined objects to `paramSchema` and `defaults`
  - keep existing legacy params in place (do NOT delete yet)
- `frontend/src/state/compilePayload.js`:
  - add a normalization step that produces a single canonical internal shape:
    `canon = normalizeMusicThoughtParams(params)`
  - compilation uses `canon` only
- Minimal helper module allowed:
  - `frontend/src/music/normalizeThought.js` (recommended) OR local helper inside compilePayload

## Implementation Steps

### 1) Add joined objects to paramSchema/defaults
In `frontend/src/state/nodeRegistry.js` for the Music Thought node:

- Add top-level objects:
  - `style`, `harmony`, `pattern`, `feel`, `voice`
- Keep legacy keys alongside them.

Defaults guidance (minimal):
- If legacy defaults already exist, set joined defaults to mirror them.
- If there are no good defaults, use null-safe defaults:
  - mode fields default to current legacy defaults
  - nested objects always exist with empty strings / sensible numbers

### 2) Implement normalization: joined-first, legacy-fallback
Create a function:

```js
function normalizeMusicThoughtParams(params) {
  // returns { durationBars, key, style, harmony, pattern, feel, voice, meta }
}
```

Rules:
- If `params.style` exists → use it (validate required subkeys exist; fill missing with defaults)
- Else → synthesize `style` from:
  - styleId, styleSeed, moodMode, moodId, styleOptionModes/Locks/Overrides, dropdownViewPrefs
- Repeat for harmony/pattern/feel/voice.

### 3) Resolve the duplicate grid problem (minimal rule)
If pattern is custom:
- If `feel.mode === "manual"` and feel.manual.grid is missing/empty:
  - set feel.manual.grid = pattern.custom.grid
Else if feel is preset:
- do nothing (preset governs grid)

Do NOT change behavior for legacy-only thoughts.

### 4) Deprecate legacy-only fields without removing them
- Mark `patternType` as internal/legacy in code comments.
- Do not display any new UI yet (Phase 2 handles UI).

## Tests / Verification
- Run Phase 0 smoke tests.
- Create a new Music Thought and ensure playback still works.
- Validate normalization with a few console assertions in dev (no noisy logs).

## Required Commands
- `npm run lint`
- `npm run test` (if present)
- `npm run dev` + manual smoke tests

## Success Checklist
- [ ] Music Thought `paramSchema` includes: style, harmony, pattern, feel, voice.
- [ ] No legacy param keys were removed.
- [ ] compilePayload compiles via `normalizeMusicThoughtParams()` and does not crash on old thoughts.
- [ ] A legacy thought (no joined objects) still plays.
- [ ] A new thought using joined objects (can be created by editing JSON temporarily) plays.
