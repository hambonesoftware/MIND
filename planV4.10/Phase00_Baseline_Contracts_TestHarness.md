# Phase 00 — Baseline, contracts, and test harness

## Owner agents
- Primary: **agent_orchestrator**, **agent_docs**
- Support: agent_backend, agent_frontend, agent_qa

## Objective
Lock the schema and semantics so later phases cannot “interpret” requirements differently.

## Deliverables

### A) Column Schema Contract (required)
Create a canonical module (backend-side) such as:
- `backend/specsgrader/contracts/column_schema.py` (exact path may differ)

It must define:
- `SPEC_COL = "D"`
- `RISK_DESC_COL = "E"`
- `RISK_LEVEL_COL = "F"`
- `DEPT_COL = "G"`
- `RISK_MEDIUM_OR_HIGHER = {"Medium","High","Critical"}` (or your enum)

Also define helpers:
- `is_medium_or_higher(level: str) -> bool`
- `normalize_risk_level(level: str) -> str` (strict mapping)

### B) Risk Level + Department enums (required)
Ensure enums exist in one place (shared by UI + backend if possible), e.g.:
- `RiskLevel = Low | Medium | High | Critical`
- `Department = Mechanical | Electrical | Controls & Software | Project Management`

**Important:** Project Management = “everything else”.

### C) Acceptance criteria in code (required)
Add a single test/contract doc (and reference it in tests):
- `docs/contracts/v4_10_acceptance.md`

Include exact acceptance rules:
- E blank when F is Low
- E non-empty when F >= Medium unless generator fails → fallback string and “needs review” flag
- F and G always populated after classify (unless D is blank)

### D) Test harness prerequisites
Ensure the repo has:
- `pytest` configured
- test fixtures directory: `tests/fixtures/`

Add a minimal fixture workbook:
- `tests/fixtures/v4_10_minimal.xlsx`

This workbook must contain:
- at least 1 sheet with “Quote #” in it
- at least 5 data rows
- columns A–G with sample values

## Components to touch (discovery)
Agent must locate and update the equivalents of:
- XLSX reader/writer module (search for `openpyxl`, `load_workbook`)
- risk level enum / strings (search for `risk level`, `RiskLevel`)
- department enum / strings (search for `Mechanical`, `Project Management`)

## Testing (must run and pass)
- `python -m pytest -q`

Must include at least:
- `test_risk_level_threshold_medium_or_higher()`
- `test_department_enum_contains_only_four_values()`

## Success checklist
- [ ] Column schema contract exists and is imported by I/O + pipeline code (no duplication)
- [ ] RiskLevel and Department enums exist and are used consistently
- [ ] Acceptance doc exists
- [ ] pytest runs in CI/local
- [ ] Fixture workbook exists and is committed
