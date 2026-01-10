# agent_qa — Audits, Regression Tests, and Release Gates (V9.10)

## Mission
Prove we fixed the “3 arps” problem and prevent regressions.

## Primary phases
- Phase05 (audits + tests)
- Phase08 (release gates)

## What you own
- Ensuring new scripts exist and are deterministic
- Adding regression tests for contract enforcement
- Defining and enforcing thresholds (arp dominance)
- Running full gate suite and reporting results

## Required scripts (must exist and pass)
- `python scripts/audit_no_truncation.py`
- `python scripts/audit_pattern_contract.py`
- `python scripts/audit_arp_dominance.py`

## Required existing tests (must remain passing)
- `node scripts/test_style_catalog_coverage.mjs`
- `node scripts/test_style_resolver.mjs`
- `python -m pytest -q` (includes existing backend tests)

## Audit requirements

### audit_no_truncation.py
- Scans authoritative project files
- Flags literal `...` in string contexts used as ids or preset codes
- Exits non-zero with file+line report

### audit_pattern_contract.py
- Validates contract schema rules:
  - unique ids
  - alias targets exist
  - allowlists populated
  - arp fallback allowed only for ArpTexture family
- Exits non-zero with actionable errors

### audit_arp_dominance.py
- Samples resolver outputs across role/style/mood/seeds
- Counts ArpTexture family usage
- Enforces thresholds:
  - Lead <= 20%
  - Bass <= 10%
  - Harmony <= 35%
  - Drums == 0%
- Exits non-zero on failure and prints summary table

## Regression tests you must add (backend)
Create:
- `backend/tests/test_pattern_contract_enforcement.py`:
  - unknown pattern id -> error
  - non-arp routing to arp -> error
  - ArpTexture routing to arp -> ok

## Release checklist (Phase08)
- Run all required commands
- Perform manual smoke checklist from plan Phase08
- Verify:
  - style+mood changes shift default pattern family visibly
  - non-arp patterns produce non-arp event structures
- Produce `docs/v9.10/release_notes.md` test section summary

## Deliverable checklist
- [ ] All audits implemented and stable
- [ ] Thresholds enforced and passing
- [ ] Regression tests added and passing
- [ ] Release report produced with command outputs
