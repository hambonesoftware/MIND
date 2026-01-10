# Phase 01 — Pattern Contract and Source of Truth for Membership and Routing

## Objective
Introduce a contract that guarantees:
- Every UI-selectable pattern id is valid.
- Every selectable pattern id maps to a real backend generator (or an explicit alias).
- Only explicit Arp Texture patterns may use the generic arp texture path.

Also consolidate style membership so catalogs do not have to repeat long lists.

## Components
Docs/contracts:
- Add: `docs/contracts/pattern_contract.v1.json`
- Add: `docs/contracts/pattern_contract.v1.md`

Frontend:
- `frontend/src/music/patternCatalog.js`
- `frontend/src/music/catalogSnapshot.json` (existing membership snapshot)
- `frontend/src/music/styleResolver.js` (uses PATTERN_CATALOG today)

Backend:
- `backend/mind_api/mind_core/stream_runtime.py` (generator selection)
- `backend/mind_api/mind_core/music_elements/texture_engine.py`

Scripts:
- Add `scripts/audit_pattern_contract.py`

## Work items

### 1.1 Create the Pattern Contract file
Create `docs/contracts/pattern_contract.v1.json` with this schema:

Top level:
- `contractVersion`: "1"
- `patterns`: array

Each pattern entry:
- `id`: string (UI id and presetCode `pat` id)
- `label`: string (UI display)
- `family`: string (ex: Hook, Riff, Stabs, Pulse, Walking, Clave, Gate, ArpTexture, Fill)
- `allowedRoles`: array of strings (Lead, Harmony, Bass, Drums, FX)
- `allowedVoices`: array of strings (mono, poly, perc, auto allowed if you use it)
- `backendGeneratorId`: string (the generator key the backend recognizes)
- `aliasOf`: optional string (if `id` is a UI alias)
- `allowArpTextureFallback`: boolean (true only for ArpTexture family)
- `requiresCapability`: optional string (must match `frontend/src/music/capabilities.js` keys)

### 1.2 Populate contract using current backend capabilities
Use current backend special generators as anchors (confirmed present by tests like `test_style_patterns_realness.py`):
- `alberti_bass`
- `walking_bass_simple`
- `gate_mask`
- `comping_stabs`
- `step_arp_octave`
- `ostinato_pulse`

Add explicit ArpTexture patterns that are allowed to route to generic arp texture:
- `simple_arpeggio`
- `descending_arpeggio`
- `skipping_arpeggio`
and any other explicit “arp texture” patterns you keep.

For any current UI pattern label that is not yet implemented as a real generator,
either:
- implement a real generator in Phase03, or
- explicitly alias it to an existing generator in the contract using `aliasOf`,
  but only if the resulting behavior matches the label closely.

### 1.3 Make membership data robust
Stop repeating style membership inside each pattern entry if possible.

Preferred approach:
- Keep `patternCatalog.js` as “definitions” (id, label, tags, capability).
- Use `catalogSnapshot.json` as authoritative mapping of style -> pattern ids.
- In `styleResolver.js`, build candidates by intersecting:
  - style membership list (from snapshot)
  - contract allowlists (role/voice/capability)
  - mood tag bias (Phase04)

If you keep membership lists in patternCatalog entries, they must be fully spelled and guarded by Phase00 script.

### 1.4 Add contract audit script
Create `scripts/audit_pattern_contract.py` that:
- Loads `docs/contracts/pattern_contract.v1.json`
- Verifies uniqueness of `id`
- Verifies that `backendGeneratorId` exists in a backend routing table (Phase03 will create that table explicitly)
- Verifies allowlists are non-empty
- Verifies `allowArpTextureFallback` is true only if family is ArpTexture
- Verifies any `aliasOf` points to an existing pattern id

The script must exit non-zero on any failure.

## Testing
Automated:
- `python scripts/audit_pattern_contract.py` (must pass)
- Existing tests still pass:
  - `node scripts/test_style_catalog_coverage.mjs`
  - `python -m pytest -q`

Manual:
- None required in this phase.

## Success checklist
- [ ] Pattern contract exists and is complete for all UI-exposed patterns
- [ ] Contract has explicit arp fallback policy per pattern
- [ ] Membership strategy decided and documented (snapshot-driven preferred)
- [ ] `scripts/audit_pattern_contract.py` passes
