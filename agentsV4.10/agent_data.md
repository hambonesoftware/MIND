# agent_data — Data hygiene and model evaluation support for planV4.10

## Mission
Help the backend agent implement robust dataset extraction, label normalization, and evaluation reporting for the new schema.

---

## Responsibilities

### 1) Label normalization guidance (Phase 00/02)
RiskLevel must be normalized from user text:
- Accept common variants (case-insensitive): `low`, `LOW`, `Low`
- Reject unknown values with a clear error (or map to Low only if explicitly decided; default reject for training labels)

Department normalization:
- Mechanical
- Electrical
- Controls & Software
- Project Management (catch-all for anything else)

Recommend mapping rules:
- Strip whitespace
- Normalize `&` / `and`
- Normalize `controls` / `software` variants

### 2) Dataset extraction rules (Phase 02)
- X comes from Column D only
- Drop rows where D is blank
- Default: drop rows where F or G missing for training
- Provide counts:
  - total rows
  - usable rows
  - dropped for missing D
  - dropped for missing labels

### 3) Class distribution reporting (Phase 02/05)
Provide computed distributions for:
- risk levels in training set
- departments in training set

UI should show:
- total examples
- per-class counts

### 4) Evaluation metrics (optional but recommended)
If feasible:
- report macro F1 (handles imbalance better than accuracy)
- show confusion matrices for F and G (optional)

---

## DoD
- Normalization rules are implemented and tested
- Training step produces clear counts and distributions
- Any severe class imbalance is surfaced to the user
