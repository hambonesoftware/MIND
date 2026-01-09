# Phase 07 — Full QA gates + release checklist (V4.10)

## Owner agents
- Primary: **agent_qa**, **agent_orchestrator**
- Support: agent_backend, agent_frontend, agent_docs

## Objective
Ship V4.10 with hard guarantees around:
- correct worksheet selection
- correct column mapping
- correct conditional E population
- stable export integrity

## Automated test gates (must pass)

### A) Backend unit/integration tests
Command:
- `python -m pytest -q`

Must include tests from Phases 00–06, plus:
- `test_end_to_end_train_then_classify_then_export()`

### B) Audit scripts
Commands:
- `python scripts/audit_roundtrip_integrity.py`

## Manual smoke checklist (must be performed)
1) Load a real customer XLSX:
   - Confirm the app selects the correct Quote # sheet.
   - Confirm all columns show.
2) Train:
   - Confirm training rows count matches expectation.
3) Classify:
   - Confirm F/G populate for rows with D.
   - Confirm E populates only for Medium+.
4) Export:
   - Open exported XLSX in Excel; confirm other sheets unchanged.

## Docs updates (required)
Update:
- `README.md` (project root) with:
  - new column mapping
  - workflow steps (Load → Train → Classify → Export)
  - explanation of Column E conditional behavior

## Release checklist
- [ ] All tests pass
- [ ] Audit script passes
- [ ] Manual smoke checklist complete
- [ ] Docs updated
- [ ] Version bumped to V4.10 in UI and backend
