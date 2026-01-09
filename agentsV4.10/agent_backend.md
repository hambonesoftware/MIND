# agent_backend — Backend owner for planV4.10

## Mission
Implement the full backend wiring for the new XLSX column mapping and conditional Risk Description logic.

---

## Phase-by-phase responsibilities

## Phase 00 — Contracts + baseline tests
### Deliverables
1) Create schema module (exact path may vary; match repo layout):
- `backend/specsgrader/contracts/column_schema.py`

Must define:
- `SPEC_COL = "D"`
- `RISK_DESC_COL = "E"`
- `RISK_LEVEL_COL = "F"`
- `DEPT_COL = "G"`
- `RISK_MEDIUM_OR_HIGHER = {...}`
- `is_medium_or_higher(level: str) -> bool`
- `normalize_risk_level(level: str) -> str`
- `normalize_department(dept: str) -> str`

2) Ensure enums exist centrally (backend preferred):
- RiskLevel: Low/Medium/High/Critical
- Department: Mechanical/Electrical/Controls & Software/Project Management

3) Add acceptance doc:
- `docs/contracts/v4_10_acceptance.md`

### Tests
- `test_risk_level_threshold_medium_or_higher()`
- `test_department_enum_contains_only_four_values()`

---

## Phase 01 — XLSX ingestion + sheet selection + header detection
### Deliverables
1) Implement a shared helper:
- `select_quote_sheet(workbook) -> worksheet`
Rule:
- choose first sheet whose header row contains “Quote #”
- else fall back to first sheet + return warning flag

2) Implement header row detection:
- find first row with:
  - at least N non-empty cells (recommend N>=3)
  - contains “Quote #” in any cell text

3) Return UI-ready data model that includes ALL columns:
- column labels (A..whatever)
- header names
- row values
- plus metadata that marks D/E/F/G semantics

### Tests
- `test_selects_first_quote_sheet()`
- `test_header_row_detection()`
- `test_preserves_non_target_columns_on_read()`

---

## Phase 02 — Training pipeline updates (D as input; F/G as labels)
### Deliverables
1) Dataset extraction:
- X = Column D text (skip blank D)
- y_risk = Column F (skip blank by default)
- y_dept = Column G (skip blank by default)
- normalize labels with contract helpers

2) Train two models (recommended):
- `RiskLevelClassifier` (D -> F)
- `DepartmentClassifier` (D -> G)

3) Optionally store a rationale corpus:
- (D,E,F,G) examples for retrieval-first E generation later

### Tests
- `test_training_extracts_D_as_X_and_FG_as_labels()`
- `test_training_skips_rows_missing_labels_by_default()`
- `test_label_normalization_rejects_unknown_values()`

---

## Phase 03 — Inference pipeline updates (predict F/G from D)
### Deliverables
1) Inference selection policy:
- default: do not overwrite existing non-empty F/G
- provide an `overwriteExisting` option (API + UI wiring in Phase05)

2) Output schema per row:
- rowIndex
- specText (D)
- riskLevel (F)
- department (G)
- confidenceRisk/confidenceDept if available
- modelSetName + model version metadata
- needsReview (default false; may be set true by Phase04)

### Tests
- `test_classify_writes_F_and_G_for_rows_with_D()`
- `test_does_not_overwrite_existing_FG_by_default()`
- `test_inference_returns_rowIndex_and_confidences()`

---

## Phase 04 — Column E generation (Medium+ only)
### Deliverables
1) Implement `risk_description_service.py` (or equivalent):
- input: spec text D, predicted F, predicted G, optional retrieval index
- output: string E and flag `needsReview`

2) Apply policy:
- if F Low: return E=""
- if F Medium+: attempt generation:
  - retrieval-first (if corpus exists) else templates
  - if failure: fallback string + needsReview=True

3) Integrate into classify flow:
- After predicting F/G, compute E for each row.
- Ensure E is written into returned results for Medium+ only.

### Tests
- `test_E_blank_when_F_low()`
- `test_E_nonempty_when_F_medium_or_higher()`
- `test_E_fallback_and_needsReview_when_generator_fails()`
- optional retrieval test if implemented

---

## Phase 06 — Export + roundtrip integrity
### Deliverables
1) Export writes only E/F/G for processed rows:
- other columns unchanged
- other sheets unchanged

2) Add script:
- `scripts/audit_roundtrip_integrity.py`

### Tests
- `test_export_preserves_non_target_columns()`
- `test_export_updates_only_EFG()`
- `test_roundtrip_reload_matches_exported_data()`

---

## Implementation notes (must follow)

### No silent schema drift
If you find other code paths expecting E/F/G meaning different things, update them to import the schema contract.

### “Quote #” sheet selection is not optional
Do not use “first sheet always” except as fallback when no match exists.

### Department normalization rule
Anything not matching Mechanical/Electrical/Controls & Software must map to Project Management (unless you decide to error; plan requires PM catch-all).

---

## Final backend DoD for V4.10
- All tests pass
- E is blank for Low, non-empty for Medium+
- Export preserves workbook while updating E/F/G appropriately
- Roundtrip audit script passes
