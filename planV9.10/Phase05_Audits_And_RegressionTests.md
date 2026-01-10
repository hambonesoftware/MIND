# Phase 05 — Audits and Regression Tests (Prove We Broke the “3 Arps” Problem)

## Objective
Add automated audits that quantify:
- pattern contract compliance
- absence of truncation placeholders
- arp dominance thresholds by role
- style/mood coverage

This prevents regressions where pattern labels drift back to arp texture.

## Components
Scripts (new):
- `scripts/audit_no_truncation.py` (Phase00)
- `scripts/audit_pattern_contract.py` (Phase01)
- `scripts/audit_arp_dominance.py` (new in this phase)

Tests:
- backend pytest suite under `backend/tests/`
- node scripts under `scripts/`

## Work items

### 5.1 Implement arp dominance audit
Create `scripts/audit_arp_dominance.py`:
- Loads the pattern contract
- Iterates over a small grid of:
  - role: Lead, Harmony, Bass, Drums
  - style: each style id
  - mood: a representative subset per style
  - reroll seeds: at least 10
- For each combination:
  - call the resolver (frontend side) or compile path (backend side) in a controlled way
  - record selected `patternId` and its `family`
- Enforce thresholds:
  - Lead: ArpTexture <= 20%
  - Bass: ArpTexture <= 10%
  - Harmony: ArpTexture <= 35%
  - Drums: ArpTexture == 0%

Choose one execution strategy and document it:
- Strategy A: Node runs resolver and prints selections; Python reads JSON output.
- Strategy B: Python calls backend compile endpoint in-process via `run_stream_runtime` for each selection.

### 5.2 Add regression tests for contract enforcement
Add backend tests that ensure:
- Invalid notePatternId fails with structured error
- Non-arp cannot route to arp
- ArpTexture can route to arp

### 5.3 Extend existing node scripts
Update:
- `scripts/test_style_catalog_coverage.mjs`
- `scripts/test_style_resolver.mjs`

So they also check:
- all recommended pattern ids exist in contract
- all selected pattern ids exist in contract
- no truncated ids appear in outputs

## Testing
Automated:
- `python -m pytest -q`
- `node scripts/test_style_catalog_coverage.mjs`
- `node scripts/test_style_resolver.mjs`
- `python scripts/audit_no_truncation.py`
- `python scripts/audit_pattern_contract.py`
- `python scripts/audit_arp_dominance.py`

## Success checklist
- [ ] Arp dominance audit exists and passes thresholds
- [ ] Node scripts validate contract membership
- [ ] Backend contract enforcement has explicit tests
- [ ] Full automated suite is green
