# Phase 06 — Export + round-trip integrity + audit tooling

## Owner agents
- Primary: **agent_backend**
- Support: agent_frontend, agent_qa, agent_orchestrator

## Objective
Export an updated XLSX that:
- preserves non-target data
- writes E/F/G as per the classification results
- supports round-trip: reloading the exported file yields identical table data

## Requirements

### A) Export behavior (required)
- Update only cells in columns E/F/G for rows processed.
- Do not reorder rows.
- Preserve other sheets unchanged.
- Preserve cell formatting if practical (openpyxl defaults may alter some formats; document what changes).

### B) Row-level audit metadata (recommended)
If you cannot add new columns, keep audit metadata internally; otherwise optionally write to hidden sheet:
- model set name
- timestamp
- confidence metrics
- needsReview flags

### C) Integrity audit script (required)
Add a script:
- `scripts/audit_roundtrip_integrity.py`

It must:
- load fixture xlsx
- run a deterministic classification (mocked model ok)
- export
- reload export
- assert non-target columns match exactly for unchanged rows
- assert E/F/G updates match expected for processed rows

## Components to touch
- XLSX writer/export code
- API endpoint for download/export

### Discovery queries
- `export`
- `save_workbook`
- `download`
- `openpyxl`

## Tests (must be added)
1) `test_export_preserves_non_target_columns()`  
2) `test_export_updates_only_EFG()`  
3) `test_roundtrip_reload_matches_exported_data()`  

## Success checklist
- [ ] Export writes E/F/G correctly
- [ ] Non-target content preserved
- [ ] Round-trip integrity tests pass
- [ ] Audit script exists and passes
