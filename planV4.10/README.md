# planV4.10 — SpecsGrader column mapping + conditional Risk Description generation

**Goal (V4.10):** Update SpecsGrader so the XLSX schema is:

- **Column D**: Customer Specification (source text; model input)
- **Column E**: Specific Risk (ONLY populated when risk level is Medium or higher)
- **Column F**: Risk Level classification (output)
- **Column G**: Department for review (output)

**Core behavior:**
1) Classify **Risk Level (F)** and **Department (G)** using **Column D**.
2) Populate **Column E** only when **F ∈ {Medium, High, Critical}** (or whatever your app defines as “≥ Medium”).
3) When **F < Medium**, set **E = ""** (blank) and do not attempt to generate.
4) Preserve all other worksheet columns and rows exactly as-is on export.

This plan is written to be executable by your Codex agent workflow. It assumes your agent zip exists (agent_backend, agent_frontend, agent_qa, agent_docs, agent_orchestrator).

---

## Global non-negotiables (must be enforced in code + tests)

### 1) Single source of truth for column schema
Create one canonical mapping module that defines:
- Column letters (D/E/F/G)
- Semantic meaning and validation rules
- “Medium-or-higher” threshold logic

No other module may hardcode these columns.

### 2) Deterministic, testable XLSX I/O
- Reading must consistently select the worksheet to operate on (see Phase 01).
- Writing must preserve the original workbook structure and formatting as much as possible.
- Tests must prove that non-target columns are unchanged.

### 3) Conditional Risk Description (Column E)
- E must be blank for “Low” risk.
- E must be generated (or selected) for Medium+.
- If the generator fails, E must contain a clear fallback string (configurable) and the row must be flagged for manual review (UI and/or output marker).

---

## Phase overview

- **Phase 00**: Baseline + contracts (column schema, enums, acceptance criteria, test harness)
- **Phase 01**: XLSX ingestion + worksheet detection + column mapping
- **Phase 02**: Training pipeline updates (D as X; F/G as y; E as optional rationale corpus)
- **Phase 03**: Classification pipeline updates (predict F/G from D; stable output API)
- **Phase 04**: Column E generation logic for Medium+ (rule/retrieval/LLM strategy)
- **Phase 05**: UI workflow updates (Train, Classify, Review) + validations
- **Phase 06**: Export + round-trip integrity + audit tooling
- **Phase 07**: Full QA gates + release checklist

---

## Definition of Done (V4.10)

- User loads an XLSX.
- App auto-selects the correct worksheet (first tab containing “Quote #”).
- App displays all columns from that sheet.
- User trains models using Column D as the specification text and F/G as labels.
- User runs classification on new rows:
  - Column F and G populated
  - Column E populated only for Medium+
- Exported XLSX preserves everything else, with E/F/G updated only where appropriate.
- All automated tests pass.
