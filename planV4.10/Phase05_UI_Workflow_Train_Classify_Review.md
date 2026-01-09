# Phase 05 — UI workflow updates (Train, Classify, Review) + validations

## Owner agents
- Primary: **agent_frontend**
- Support: agent_backend, agent_qa, agent_orchestrator, agent_docs

## Objective
Make the schema change obvious and prevent user confusion:
- Show all columns, but highlight D/E/F/G as special.
- Make it clear that E is conditional (Medium+ only).
- Make it clear that F/G come from classification and may be overwritten optionally.

## Required UI behaviors

### A) Column badges + tooltips
In the table header for the selected worksheet:
- D: “Customer Specification (input)”
- E: “Specific Risk (Medium+ only)”
- F: “Risk Level (output)”
- G: “Department for Review (output)”

### B) Train pane flow
- User selects the worksheet (auto-selected by Quote # rule)
- Training preview shows:
  - number of rows usable (D present, F/G present)
  - class distributions (F and G)
- If F/G missing on many rows, show a guidance message.

### C) Classify pane flow
- User runs classification.
- UI shows a preview grid:
  - highlights rows that will be updated
  - indicates overwrite setting (default OFF)
- After classify:
  - F/G filled
  - E filled only for Medium+
  - rows with fallback E or confidence below threshold flagged “Needs review”

### D) Review affordances (recommended)
- Filter “Needs review”
- Filter “Medium+”
- Filter “Missing D”
- Sort by risk level descending

## Components to touch
- Train panel component
- Classify panel component
- Table view component
- Any state store mapping columns

### Discovery queries
- `Train`
- `Classify`
- `worksheet`
- `Quote #`
- `columns`

## Tests
- If you have frontend tests: add minimal smoke tests for:
  - correct badges show
  - overwrite toggle default off
  - E column indicates conditional

Manual acceptance:
- A user who did not build the app can understand what to do in < 60 seconds.

## Success checklist
- [ ] UI highlights D/E/F/G with correct meanings
- [ ] Train flow uses D input and F/G labels and explains missing labels
- [ ] Classify flow previews changes and respects overwrite toggle
- [ ] E generation rule (Medium+ only) is visible and understandable
- [ ] Needs-review flags are visible and filterable
