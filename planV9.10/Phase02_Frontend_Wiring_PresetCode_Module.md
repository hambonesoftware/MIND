# Phase 02 — Frontend Wiring: Pattern IDs, Preset Code Module, and Inspector Consistency

## Objective
Ensure the frontend always emits a valid pattern id that the backend can honor, and that:
- the Thought Inspector uses the Pattern Contract to populate pattern dropdowns,
- preset-code parsing/building is not trapped inside `flowInspector.js`,
- the node defaults are canonical and valid.

## Components
Frontend UI/state:
- `frontend/src/ui/flowInspector.js`
- `frontend/src/state/nodeRegistry.js`
- `frontend/src/state/compilePayload.js`
- `frontend/src/music/resolveThought.js`
- `frontend/src/music/styleResolver.js`
- `frontend/src/music/normalizeThought.js`

Frontend music data:
- `frontend/src/music/patternCatalog.js`
- `frontend/src/music/capabilities.js`

Docs/contracts:
- `docs/contracts/pattern_contract.v1.json`

## Work items

### 2.1 Extract preset-code logic into a dedicated module
Create:
- `frontend/src/music/presetCode.js`

Move the following out of `flowInspector.js` and export them:
- `parsePresetCode(code)`
- `buildPresetCodeFromBeginner(beginner, options)`
- any canonicalization helpers (allowed keys, value sets)
- seed hashing if used for deterministic selection

Then update:
- `flowInspector.js` to import these functions instead of defining them inline.
- `nodeRegistry.js` to reference a canonical preset code produced by the same builder (no inline truncated strings).

### 2.2 Inspector pattern dropdown must be contract-driven
In `flowInspector.js`:
- Build pattern dropdown options from `docs/contracts/pattern_contract.v1.json` (either by bundling it or copying to a frontend importable JSON).
- Filter options by:
  - selected role (Lead/Harmony/Bass/Drums/FX)
  - selected voice type (mono/poly/perc/auto rules)
  - enabled capabilities (`frontend/src/music/capabilities.js`)
- Display label + family in the option text so users can understand variety.

Important:
- If a user selects a pattern that is not allowed by current role/voice,
  the UI should show a warning and select the nearest allowed default.

### 2.3 Eliminate misleading “mapsToPatternType” dominance
You may keep `patternType` as legacy for:
- explicit ArpTexture patterns only

For all non-ArpTexture patterns:
- `notePatternId` (resolver output) must be the primary selector.
- `patternType` should not be set to an arp family for those patterns.

### 2.4 Ensure compile payload includes correct resolved fields
In `compilePayload.js` and `resolveThought.js`:
- Ensure the resolved thought includes:
  - `pattern.generated.id` set from `resolvedStyle.notePatternId`
  - `feel.manual.grid` set from `resolvedStyle.rhythmGrid`
- Ensure legacy fields do not override resolved ids.

## Testing
Automated:
- Add or extend `scripts/test_style_resolver.mjs` to assert:
  - when a non-arp pattern is selected/auto-picked, the resolver emits a non-empty `notePatternId`
  - invalid pattern ids are corrected to a contract default
- Run:
  - `node scripts/test_style_resolver.mjs`
  - `python scripts/audit_pattern_contract.py`
  - `python scripts/audit_no_truncation.py`

Manual:
- Start app, create a Thought node
- Confirm:
  - pattern dropdown contains multiple families (not just arps)
  - selecting a non-arp pattern updates the node param `notePatternId` visibly
  - preset code paste updates dropdown correctly

## Success checklist
- [ ] preset-code functions are in `frontend/src/music/presetCode.js` and imported by UI
- [ ] nodeRegistry defaults use canonical preset code (no truncated literals)
- [ ] pattern dropdown options are contract-driven and filtered
- [ ] non-arp patterns do not silently map to arp patternType
- [ ] node scripts and audits pass
