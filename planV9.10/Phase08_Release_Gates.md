# Phase 08 — Release Gates and Final QA

## Objective
Ship V9.10 with verifiable quality gates.

## Components
All automated tooling:
- pytest
- node scripts
- audits

Runtime smoke:
- `python run.py` start-up
- compile/playback in browser

## Release gates (must all pass)

### 8.1 Automated suite
- `python -m pytest -q`
- `node scripts/test_style_catalog_coverage.mjs`
- `node scripts/test_style_resolver.mjs`
- `python scripts/audit_no_truncation.py`
- `python scripts/audit_pattern_contract.py`
- `python scripts/audit_arp_dominance.py`

### 8.2 Manual smoke checklist
- Start app: `python run.py`
- In UI:
  1) Create 4 Thought nodes: Lead, Harmony, Bass, Drums (defaults)
  2) Rebuild each; confirm each produces sound and is not the same “3 arp” texture
  3) Change style to Jazz and mood to Smoky; confirm Lead defaults to non-arp family; Bass tends toward Walking/Pulse
  4) Change style to EDM and mood to Dark; confirm Gate/On-grid families appear
  5) Explicitly pick ArpTexture; confirm it is allowed and sounds like an arp
  6) Copy preset code from a curated preset; paste into a new thought; rebuild; confirm behavior matches

### 8.3 Regression watch list
Any of these is a release blocker:
- Any new `...` placeholder appears in authoritative catalogs or defaults
- Any UI pattern id missing from contract
- Any non-arp pattern routes to arp texture
- Arp dominance audit fails thresholds

## Success checklist
- [ ] All automated gates green
- [ ] Manual smoke checklist completed
- [ ] Style+mood changes audibly affect defaults
- [ ] Pattern selection is contract-driven and validated end-to-end
