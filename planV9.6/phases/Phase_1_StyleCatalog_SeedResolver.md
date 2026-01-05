# Phase 1 — Style Catalog + Seed Resolver (Deterministic)

## Objective
Introduce a deterministic “Style + Seed” resolver layer (frontend-only).
This phase does **not** change the inspector UI yet.

## Primary agent
- Agent_Frontend_StyleCatalogResolver

## Supporting agents
- Agent_QA_TestMatrixAndRegression
- Agent_Backend_RuntimeCompatibility

## Files to create
- `frontend/src/music/styleCatalog.js`
- `frontend/src/music/styleResolver.js`
- `scripts/test_style_resolver.mjs`

## Tasks

### 1.1 Create style catalog
Create `styleCatalog.js` with:
- A stable `styleId` list (start small; expand later)
- For each style:
  - `progressionPresetIds` (candidate IDs)
  - `progressionVariantIds` (optional, or per-preset map)
  - `notePatternIds` (candidate IDs)
  - `feelDefaults` candidates:
    - rhythmGrid
    - syncopation
    - timingWarp
    - timingIntensity bands
  - instrument candidates (optional)
  - register defaults (optional)

**Important:**
- IDs must be stable strings.
- Keep catalog deterministic: arrays sorted by ID (or sorted during resolver).

### 1.2 Implement seeded RNG + sub-seed hashing
Create `styleResolver.js`:
- Seeded PRNG (mulberry32 or xorshift32)
- A small, deterministic hash function for:
  - (styleSeed, styleId, nodeId, namespace) => uint32
- Resolver entrypoint:
  - `resolveThoughtStyle({ styleId, styleSeed, nodeId, locks, overrides, modes })`
  - Returns a dict of concrete V9.5-compatible Thought params:
    - harmony/preset IDs + chordsPerBar/fill/progressionLength
    - patternType + rhythmGrid + syncopation + timingWarp + timingIntensity
    - optional instrument + register

### 1.3 Write determinism tests (Node script)
Create `scripts/test_style_resolver.mjs`:
- Imports resolver + catalog
- Runs assertions:
  1. Same inputs => same outputs (repeat 50 times)
  2. Different seeds => at least one output field differs
  3. Locks hold fields constant when seed changes
  4. Overrides hold fields constant when seed changes

Make failures print a readable diff (stringified JSON).

## Testing that must pass
- `node scripts/test_style_resolver.mjs`
- `cd backend && pytest -q`

## Success checklist
- [ ] Catalog exists and is readable from resolver
- [ ] Resolver is deterministic (no Math.random)
- [ ] Sub-seed namespaces are implemented (harmony/pattern/feel/...)
- [ ] Node determinism tests pass
- [ ] Backend tests still pass
