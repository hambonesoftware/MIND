# agent_frontend — UI/State Wiring (V9.10)

## Mission
Make the frontend emit correct, contract-valid pattern IDs and preserve determinism through preset code.
Eliminate misleading “pattern label but it’s still arp texture” behavior.

## Primary phases
- Phase00 (catalog/default cleanup support)
- Phase02 (core frontend wiring)
- Phase04 (style/mood selection heuristics support)
- Phase06 (preset library UI support)
- Phase07 (optional debugging UI)

## Files you will change (expected)
- `frontend/src/ui/flowInspector.js`
- `frontend/src/state/nodeRegistry.js`
- `frontend/src/state/compilePayload.js`
- `frontend/src/music/presetCode.js` (new; created in Phase02)
- `frontend/src/music/styleResolver.js`
- `frontend/src/music/resolveThought.js`
- `frontend/src/music/normalizeThought.js`
- `frontend/src/music/patternCatalog.js`
- `frontend/src/music/capabilities.js`
- (optional) `frontend/src/music/presetLibrary.js`

## Hard requirements
1) Pattern dropdown options are driven by `docs/contracts/pattern_contract.v1.json`
2) Selected pattern value stored in node params is a contract `id`
3) Non-ArpTexture patterns must not be forced into `patternType=arp-3-*`
4) Any invalid/stale pattern id:
   - show warning
   - auto-correct to nearest safe default
   - mark thought “dirty / needs rebuild”

## Implementation guidance

### Phase00 support
- Remove any truncated tokens like `...` from catalogs and defaults.
- Use `frontend/src/music/catalogSnapshot.json` to restore full IDs.
- Do not invent new IDs; align to snapshot + catalog definitions.

### Phase02 core work
- Create `frontend/src/music/presetCode.js`
  - Move preset parsing/building out of `flowInspector.js`
  - Export `parsePresetCode` and `buildPresetCodeFromBeginner`
  - Ensure canonicalization is centralized (no divergent logic)

- Update `flowInspector.js`:
  - import preset functions
  - import/consume pattern contract JSON (bundled or copied into frontend-accessible JSON)
  - build dropdown options filtered by (role, voice type, capabilities)
  - show label + family

- Update `nodeRegistry.js` defaults:
  - default thought params must include a valid preset code
  - ensure `notePatternId` defaults to a contract-valid pattern id
  - ensure no literal `...` in presetCode defaults

- Update `compilePayload.js`:
  - ensure resolved `notePatternId` is what is sent to backend compile
  - ensure legacy fields don’t override resolver outputs

### Phase04 support
- Help implement scoring/bias model for default pattern selection:
  - intersect snapshot membership + contract allowlists
  - score by mood tags + role-family preference
  - deterministic selection using seeded RNG
- Add optional “diagnostics” object behind a debug flag

## Required tests (you run them before handing off)
- `node scripts/test_style_catalog_coverage.mjs`
- `node scripts/test_style_resolver.mjs`
- `python scripts/audit_no_truncation.py`
- `python scripts/audit_pattern_contract.py`
- (when available) `python scripts/audit_arp_dominance.py`

## Deliverable checklist (per phase where you contribute)
- [ ] All modified UI dropdowns are contract-driven
- [ ] presetCode logic centralized and imported
- [ ] nodeRegistry defaults canonical and non-truncated
- [ ] Determinism preserved (same code => same resolved outputs)
- [ ] Node scripts + audits pass
