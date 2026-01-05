# Agent_Frontend_StyleCatalogResolver

## Mission
Implement the V9.6 **style system** building blocks:
- `styleCatalog.js` (catalog of styles → candidate progressions/patterns/feel)
- `styleResolver.js` (deterministic seeded resolver)
- `scripts/test_style_resolver.mjs` (Node test)

This agent is responsible for Phase 1 and supports later phases.

## Guardrails
- Do NOT change backend behavior.
- Determinism is non-negotiable:
  - No `Math.random()` inside resolver or selection code.
- Candidate selection MUST be stable:
  - Sort candidates by stable IDs before selecting.
- Do NOT overwrite user custom text fields by default:
  - `progressionCustom`, `chordNotes`, etc. may only be touched when explicitly set to Auto.

## Inputs
- `styleId` (string)
- `styleSeed` (int)
- `nodeId` (stable identifier)
- modes/locks/overrides objects (from Thought params)

## Outputs (resolved concrete V9.5 param fields)
Return an object that can be merged into Thought params, such as:
- Harmony:
  - `harmonyMode`
  - `progressionPresetId`
  - `progressionVariantId`
  - `chordsPerBar`
  - `fillBehavior`
  - `progressionLength`
- Pattern/feel:
  - `notePatternId` (new, optional but recommended)
  - `patternType` (must remain compatible)
  - `rhythmGrid`
  - `syncopation`
  - `timingWarp`
  - `timingIntensity`
- Optional:
  - `instrumentPreset`, `instrumentSoundfont`
  - `registerMin`, `registerMax`

## Required files
### Create
- `frontend/src/music/styleCatalog.js`
- `frontend/src/music/styleResolver.js`
- `scripts/test_style_resolver.mjs`

### Modify (only if necessary)
- None in Phase 1; later phases may adjust.

## Implementation details

### A) Catalog structure (recommended)
Export:
- `STYLES`: array of style definitions
- `STYLE_BY_ID`: map
Each style should include:
- `id`, `label`
- `progressions`: array of progression preset IDs (strings)
- `variantsByProgression`: optional mapping presetId → variantIds[]
- `patterns`: array of notePatternIds[] (strings)
- `patternTypeByPatternId`: mapping patternId → existing patternType for V9.5 compatibility
- `feelCandidates`: arrays for:
  - `rhythmGrid` (e.g., ["1/16","1/12"])
  - `syncopation` (e.g., ["none","light","medium"])
  - `timingWarp` (e.g., ["none","swing"])
  - `timingIntensity` (numbers, e.g., [0,0.15,0.3])
- Optional:
  - `instrumentPresets`
  - `registerRanges`

Keep it small at first; expand later.

### B) Seeded RNG
Use one of:
- mulberry32
- xorshift32
But implement it locally to avoid dependency risk.

### C) Hash-to-subseed
Implement `hash32(string)` or a small FNV-1a to produce uint32.
Then:
- `subSeed = hash32(styleId + "|" + styleSeed + "|" + nodeId + "|" + namespace)`
Namespaces:
- "harmony", "pattern", "feel", "instrument", "register"
Also allow per-bar/per-step seeds if needed later.

### D) Selection
`pickOne(candidates, rng)` should:
1. Make a copy
2. Sort by stable ID (string compare)
3. index = floor(rng() * len)
4. return candidates[index]

### E) Test script
`scripts/test_style_resolver.mjs` must:
- call resolver repeatedly
- assert deep equality across repeats
- assert differences across seed change
- assert locks and overrides prevent changes

Make tests deterministic and exit(1) on failure.

## Phase deliverables
- Node determinism tests pass:
  - `node scripts/test_style_resolver.mjs`
- Backend tests still pass:
  - `cd backend && pytest -q`

## Report format
- Summary
- Files created/changed
- Commands run + outputs
- Checklist with [x]
- Any follow-ups needed for Phase 4/5 integration
