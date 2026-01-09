# Phase 02 — Training pipeline updates (D as input; F/G as labels; E as optional rationale corpus)

## Owner agents
- Primary: **agent_backend**
- Support: agent_data, agent_qa, agent_orchestrator

## Objective
Ensure training uses the new schema correctly:
- X = Column D (spec text)
- y1 = Column F (risk level)
- y2 = Column G (department)
- Column E is not a label; treat it as optional “risk rationale” text to support retrieval/generation later.

## Requirements

### A) Training dataset extraction (required)
From the selected worksheet:
- Pull only rows where Column D is non-empty.
- Require Column F and G to be present for supervised training (or provide a “skip missing labels” option in UI; default skip).
- Normalize labels via Phase00 enums.

### B) Two-head training strategy (required)
Implement either:
1) Two separate models:
   - RiskLevelClassifier: D -> F
   - DepartmentClassifier: D -> G
OR
2) A single multi-output model (only if your current pipeline supports it cleanly).

**Plan recommendation:** Keep them separate for clarity and easier evaluation.

### C) Optional rationale corpus indexing (recommended)
If Column E exists and is non-empty:
- Store (D, E, F, G) as training examples for later retrieval to generate E.
- This can be a simple TF-IDF retrieval or embedding index (depending on your existing approach).

## Components to touch

### Backend pipeline components (typical)
- `training_service.py` / `train.py`
- any model storage module: `model_sets/`
- evaluation/reporting module

### Discovery queries
- `train`
- `fit`
- `pipeline`
- `joblib`
- `model_set`
- `RiskLevel` / `Department`

## Tests (must be added)
1) `test_training_extracts_D_as_X_and_FG_as_labels()`  
2) `test_training_skips_rows_missing_labels_by_default()`  
3) `test_label_normalization_rejects_unknown_values()`  

## Success checklist
- [ ] Training consumes correct columns
- [ ] Labels are validated and normalized
- [ ] Models are saved in the standard model-set structure
- [ ] Training report shows class counts for both F and G
- [ ] Tests pass
