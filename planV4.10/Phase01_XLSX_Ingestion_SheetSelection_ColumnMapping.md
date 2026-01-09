# Phase 01 — XLSX ingestion + worksheet detection + column mapping

## Owner agents
- Primary: **agent_backend**
- Support: agent_qa, agent_orchestrator

## Objective
Read the correct worksheet and expose the full sheet as the app’s table, while establishing the D/E/F/G meaning.

## Requirements

### A) Worksheet selection rule (required)
When an XLSX is loaded, choose the worksheet as:
1) The **first** worksheet whose header row contains the substring **"Quote #"** in any cell, OR
2) If none match, fall back to the first worksheet and raise a visible warning in UI (“No 'Quote #' sheet found; using first sheet”).

**Important:** This rule must be identical in Train and Classify flows.

### B) Header + data row detection (required)
- Identify header row robustly (do not assume row 1). Use a heuristic:
  - Find the first row where at least N cells are non-empty AND contains “Quote #” somewhere.
- All rows below header row are data rows until a large blank region or EOF.

### C) Column semantics mapping (required)
Using the Phase00 schema:
- Column D: text input for classification (spec)
- Column E: specific risk description (generated for Medium+)
- Column F: risk level (predicted / stored)
- Column G: department (predicted / stored)

### D) Data model exposed to UI (required)
When displaying the sheet:
- Show **all columns** in the worksheet, not only D–G.
- But mark D–G with special badges/labels in the UI metadata.

## Components to touch

### Backend components (typical)
- `io/xlsx_reader.py` (or similar)
- `logic/load_workbook(...)` / `logic/get_sheet(...)`
- API endpoints that accept XLSX uploads
- A shared “sheet selection” helper:
  - `select_quote_sheet(workbook) -> worksheet`

### Discovery queries (use grep/ripgrep)
- `Quote #`
- `load_workbook`
- `openpyxl`
- `worksheet`
- `header_row`

## Tests (must be added)
1) `test_selects_first_quote_sheet()`  
   - Fixture has multiple sheets; ensure first matching “Quote #” is selected.

2) `test_header_row_detection()`  
   - Fixture where header is not row 1.

3) `test_preserves_non_target_columns_on_read()`  
   - Ensure data model includes columns beyond D–G.

## Success checklist
- [ ] Correct sheet is selected deterministically
- [ ] Header row detection works for common messy files
- [ ] Data model includes all columns
- [ ] D/E/F/G are marked with correct semantics (metadata)
- [ ] All tests pass
