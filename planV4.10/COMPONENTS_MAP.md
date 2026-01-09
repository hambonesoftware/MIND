# Components Map — planV4.10

This file lists the *component areas* each phase is expected to modify. Use it as a checklist to avoid “missed wiring”.

## Phase 00
- Contracts:
  - Column schema contract module
  - RiskLevel & Department enums
  - Acceptance doc
- Test harness:
  - pytest setup
  - fixture XLSX

## Phase 01
- XLSX ingestion:
  - workbook reader
  - sheet selector (“Quote #” rule)
  - header row detector
- Data model for UI table:
  - preserve all columns
  - attach D/E/F/G semantics metadata

## Phase 02
- Training pipeline:
  - dataset builder (X=D, y=F/G)
  - label normalization
  - model saving/loading (model set)
- Optional:
  - rationale corpus index from (D,E,F,G)

## Phase 03
- Inference pipeline:
  - predict F/G from D
  - overwrite policy
  - confidences and row-level result objects

## Phase 04
- Risk Description generator (Column E):
  - medium+ threshold gate
  - retrieval/template/LLM strategy
  - fallback + needsReview flag

## Phase 05
- Frontend UX:
  - badges/tooltips for D/E/F/G
  - Train preview distributions
  - Classify preview + overwrite toggle
  - Needs-review filters

## Phase 06
- Export:
  - write E/F/G only
  - preserve workbook
  - round-trip audit script
  - export endpoint

## Phase 07
- QA + release:
  - end-to-end tests
  - docs updates
  - version bump
