# Phase 00 — Repo Integrity: Remove Truncation Placeholders and Guard Against Them

## Objective
Make the codebase safe for deterministic selection by eliminating placeholder truncation like `...`
from all user-facing catalogs and defaults, and adding automated guards so it cannot re-enter.

This must be done first because style/mood mismatch can be caused purely by broken IDs in catalogs,
which forces the resolver into fallback behavior and collapses variety.

## Components
Frontend:
- `frontend/src/music/styleCatalog.js`
- `frontend/src/music/moodCatalog.js`
- `frontend/src/music/patternCatalog.js`
- `frontend/src/music/feelCatalog.js`
- `frontend/src/music/instrumentCatalog.js`
- `frontend/src/state/nodeRegistry.js` (default `presetCode` and `compiledPresetCode` fields)
- `frontend/src/ui/flowInspector.js` (contains preset-code normalization and migration calls)

Backend (spot-check only; do not touch vendor/minified code):
- `backend/mind_api/routes.py`
- `backend/mind_api/models.py`
- `backend/mind_api/mind_core/*.py` where any placeholder string could break parsing

Scripts:
- Add new `scripts/audit_no_truncation.py`

## Work items

### 0.1 Identify and classify ellipses usage
Add a guard script `scripts/audit_no_truncation.py` that:
- Scans only these “authoritative” project files:
  - `frontend/src/music/*.js`
  - `frontend/src/state/nodeRegistry.js`
  - `backend/mind_api/**/*.py`
  - `docs/**/*.md`
- Flags any occurrence of the literal substring `...` in:
  - string literals that look like IDs or list entries (catalog `id`, `styles`, `moods`, `tags`, presetCode strings)
  - plan/agent docs
- Ignores vendor/minified sources:
  - `assets/vendor/**`
  - `vendor/**`

The script must exit non-zero on failures and print a short report of offending file paths and line numbers.

### 0.2 Fix corrupted catalogs and defaults
Remove placeholder truncation from catalogs and defaults:
- Replace broken IDs (examples of broken tokens to search for):
  - `e...ronic` should be `edm_electronic`
  - `energet` should be `energetic`
  - any `orde...` or other mid-word truncation in docs
- Ensure catalog arrays contain only real IDs:
  - Style ids must match `frontend/src/music/styleCatalog.js`
  - Pattern ids must match `frontend/src/music/patternCatalog.js`
  - Mood ids must match `frontend/src/music/moodCatalog.js`

Important: Do not “guess silently”. If a token is truncated, recover the correct full token using:
- `frontend/src/music/catalogSnapshot.json` (authoritative membership lists by style)
- Any other untruncated catalog sources in the repo

### 0.3 Fix `nodeRegistry.js` default `presetCode`
In `frontend/src/state/nodeRegistry.js`, the default `presetCode`, `compiledPresetCode`, and `compiledArtifact.presetCode`
must be a real canonical preset code (no placeholder ellipses). This matters because:
- the UI parse/normalize path can ignore invalid values and revert to defaults,
  which makes it look like style/mood are being applied when they are not.

## Testing
Automated:
- Run `python scripts/audit_no_truncation.py` (must pass)
- Run existing scripts:
  - `node scripts/test_style_catalog_coverage.mjs`
  - `node scripts/test_style_resolver.mjs`
- Run `python -m pytest -q` (ensure no accidental breakage)

Manual smoke:
- Start app: `python run.py`
- Create a Thought node and open inspector
- Confirm style dropdown shows all expected style ids (no broken labels)
- Confirm mood list shows full names (no truncated labels)

## Success checklist
- [ ] `scripts/audit_no_truncation.py` exists and passes
- [ ] All catalogs contain full ids (no `...` tokens)
- [ ] `nodeRegistry.js` presetCode defaults are valid and canonical
- [ ] Existing node scripts and pytest suite still pass
