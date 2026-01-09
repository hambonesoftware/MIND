# agent_qa — QA owner for planV4.10

## Mission
Prevent regressions in worksheet selection, column mapping, conditional E policy, and export integrity.

---

## What you must produce
- Strong pytest coverage for each phase requirement
- Fixture XLSX files under `tests/fixtures/`
- A roundtrip integrity audit script in Phase06
- A final end-to-end test and manual smoke checklist record in Phase07

---

## Fixtures (required)

### `tests/fixtures/v4_10_minimal.xlsx`
Must include:
- Sheet1: no “Quote #” in header row
- Sheet2: has “Quote #” in header row (should be selected)
- Header row not necessarily row 1 (include an offset case)
- Columns A–G with values
- Several rows:
  - some with D filled and F/G filled (trainable)
  - some with D filled and F/G blank (classify-only)
  - at least one Low prediction case for E blank test
  - at least one Medium+ prediction case for E non-empty test

If you can’t easily produce XLSX fixture programmatically, create it once and commit it. Otherwise generate it in a test setup script.

---

## Required test suite (minimum)

### Phase 00
- `test_risk_level_threshold_medium_or_higher()`
- `test_department_enum_contains_only_four_values()`

### Phase 01
- `test_selects_first_quote_sheet()`
- `test_header_row_detection()`
- `test_preserves_non_target_columns_on_read()`

### Phase 02
- `test_training_extracts_D_as_X_and_FG_as_labels()`
- `test_training_skips_rows_missing_labels_by_default()`
- `test_label_normalization_rejects_unknown_values()`

### Phase 03
- `test_classify_writes_F_and_G_for_rows_with_D()`
- `test_does_not_overwrite_existing_FG_by_default()`
- `test_inference_returns_rowIndex_and_confidences()`

### Phase 04
- `test_E_blank_when_F_low()`
- `test_E_nonempty_when_F_medium_or_higher()`
- `test_E_fallback_and_needsReview_when_generator_fails()`

### Phase 06
- `test_export_preserves_non_target_columns()`
- `test_export_updates_only_EFG()`
- `test_roundtrip_reload_matches_exported_data()`

### Phase 07
- `test_end_to_end_train_then_classify_then_export()`

---

## Audit script (Phase 06)
Create:
- `scripts/audit_roundtrip_integrity.py`

It must:
- Load fixture
- Run deterministic mock classification (or real model if stable)
- Export workbook
- Reload export
- Verify:
  - non-target columns unchanged
  - E/F/G updated correctly and only as policy allows

This script must exit non-zero on failure.

---

## Manual smoke checklist (Phase 07)
Record results in:
- `docs/reports/v4_10_manual_smoke.md`

Checklist:
1) Upload a real customer XLSX
2) Confirm “Quote #” sheet selection
3) Train: confirm counts make sense
4) Classify: confirm F/G fill; E only for Medium+; needsReview rows visible
5) Export: open exported workbook in Excel; confirm other sheets preserved

---

## Release gate
Do not approve V4.10 unless:
- `python -m pytest -q` passes
- `python scripts/audit_roundtrip_integrity.py` passes
- manual smoke record exists and is complete
