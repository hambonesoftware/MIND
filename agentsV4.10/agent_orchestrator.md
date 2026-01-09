# agent_orchestrator — planV4.10 coordinator

## Mission
Execute planV4.10 in phases, enforce contracts, prevent “partial wiring” regressions, and ensure every phase ends with verified tests.

---

## Non-negotiable guardrails (block merges if violated)

### 1) Single source of truth for schema
There must be exactly **one** authoritative module that defines:
- Column letters D/E/F/G
- Their semantic meaning
- Medium+ threshold function
- Label normalization function

All other code imports it. No duplicated constants.

### 2) Shared worksheet selection logic
Train and Classify must call the same helper:
- `select_quote_sheet(...)`

No divergence.

### 3) Conditional E policy
- F == Low ⇒ E must be `""` (blank)
- F ∈ Medium/High/Critical ⇒ E must be non-empty
- If E generation fails ⇒ fallback string + `needsReview=True`

### 4) Tests are phase gates
A phase cannot be marked complete unless:
- new/updated tests exist for its requirements
- `python -m pytest -q` passes
- any phase-specific scripts pass (e.g. roundtrip audit in Phase06)

---

## Execution sequence (required)

### Phase 00
- Ensure `pytest` is present and runnable
- Create contracts and fixture XLSX
- Add baseline unit tests

### Phase 01
- Implement sheet selection (“Quote #”) and robust header detection
- Ensure UI table model preserves all columns

### Phase 02
- Update training extraction and training targets to D -> (F,G)
- Add label normalization + training reports

### Phase 03
- Update inference to predict F/G from D
- Add overwrite policy

### Phase 04
- Implement E generation for Medium+ only with failure fallback + needsReview
- Ensure E generation is invoked after F/G prediction

### Phase 05
- Update UI to highlight D/E/F/G + preview + review filters

### Phase 06
- Update export to write only E/F/G
- Add round-trip audit script and tests

### Phase 07
- Run all tests and manual smoke checklist
- Update docs and bump version strings to V4.10

---

## Required checklists per phase

### Common checklist (all phases)
- [ ] Identify all touched components with file paths in the phase report
- [ ] Add or update tests relevant to the phase
- [ ] Run `python -m pytest -q` and record result
- [ ] Ensure no duplicated column mappings exist (search for `"D"`/`"E"`/`"F"`/`"G"` usage and confirm imports)

### Phase report format (required)
At end of each phase, produce a short report in:
- `docs/reports/v4_10_phaseXX_report.md`

Include:
- Summary of changes
- File list
- Tests added/updated
- Test command outputs (high-level, no huge logs)
- Remaining risks

---

## Verification steps (quick commands)

### Locate column hardcoding
Run ripgrep (or equivalent):
- search for patterns of `["D","E","F","G"]` or `col == "D"` etc.
- ensure they reference the schema module

### Locate sheet selection duplication
Search for:
- `Quote #`
- `select_sheet`
- `worksheetnames`

Ensure only one selector helper is authoritative.

---

## Definition of Done enforcement
Do not declare V4.10 complete until:
- Phase06 roundtrip audit passes
- End-to-end test exists and passes
- Manual smoke checklist in Phase07 is documented as completed
