# Phase 03 — Classification pipeline updates (predict F/G from D; stable outputs)

## Owner agents
- Primary: **agent_backend**
- Support: agent_frontend, agent_qa, agent_orchestrator

## Objective
Classify new rows using Column D, producing:
- Column F: risk level classification
- Column G: department for review

…and return results to the UI with enough detail to support auditing.

## Requirements

### A) Inference input set (required)
Classify rows where:
- Column D has text
- (Optionally) Column F/G are blank or “Needs classify”
Define a clear policy:
- Default: do not overwrite non-empty F/G unless user toggles “overwrite existing”.

### B) Output schema (required)
For each row classified, return:
- `rowIndex` (worksheet row number)
- `specText` (from D)
- `riskLevel` (F)
- `department` (G)
- `confidenceRisk` (float 0–1 if available)
- `confidenceDept` (float 0–1 if available)
- `modelSetName` + model version info

### C) Aggregation rules (if multiple models) (required)
If you have multiple classifier modes (rule, vector, LLM, etc.), define a stable aggregator:
- If any mode yields Critical → Critical wins (conservative)
- Otherwise majority vote; tie-break by highest confidence
Document this clearly.

## Components to touch
- `/api/classify/*` endpoints
- inference service that loads cached pipelines
- model-set loader and “last used model-set” logic

### Discovery queries
- `classify`
- `/api/classify`
- `load_model_set`
- `predict_proba`
- `confidence`

## Tests (must be added)
1) `test_classify_writes_F_and_G_for_rows_with_D()`  
2) `test_does_not_overwrite_existing_FG_by_default()`  
3) `test_inference_returns_rowIndex_and_confidences()`  

## Success checklist
- [ ] Classification uses Column D only as input
- [ ] Outputs include F and G and optional confidences
- [ ] Overwrite policy is implemented and tested
- [ ] Results are returned to UI for preview before export (if your workflow supports preview)
- [ ] Tests pass
