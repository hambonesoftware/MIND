# AGENT_TEST (V9.7)
Date: 2026-01-06

## Mission
Add and enforce regression tests so style cannot regress into “fake catalogs” or nondeterminism.

## Primary phases
- Phase 0, Phase 5, Phase 8

## Commands
- `python -m pytest`

## Tests to add
- backend/tests/test_style_catalog_coverage.py
- backend/tests/test_style_harmony_realness.py
- backend/tests/test_style_patterns_realness.py
- backend/tests/test_style_seed_determinism.py

## Checklist
- [ ] Catalog coverage asserts minimum counts per style
- [ ] Harmony realness asserts >1 distinct chord over time
- [ ] Pattern realness asserts different sequences across multiple notePatternId values
- [ ] Determinism asserts same seed => same output; different seed => different output

## Preferred approach for catalog tests
- Frontend exports a structured JSON snapshot for tests to read (avoid regex parsing JS).

## Report template
- Tests added/changed:
- Commands run:
- Failures and fixes:
- Checklist status:
