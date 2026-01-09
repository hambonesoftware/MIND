# agent_frontend — Frontend owner for planV4.10

## Mission
Update the UI to make the new XLSX mapping and conditional E behavior obvious, while preserving the simple Load → Train → Classify → Export flow.

---

## Phase responsibilities

## Phase 01 — Display all columns + worksheet selection visibility
### Deliverables
- When user uploads XLSX:
  - Show selected worksheet name (auto-selected by “Quote #” rule)
  - If fallback to first sheet occurred, show a warning banner
- Table view must display **all columns** from the selected sheet.
- Column header row must show the detected header row (or at least use its labels).

### Acceptance checks
- Users can see columns A..G and beyond.
- D/E/F/G are present and not hidden.

---

## Phase 05 — Core UI workflow updates (Train, Classify, Review)

### A) Column badges + tooltips (required)
In the table header:
- Column D badge: “Customer Specification (input)”
- Column E badge: “Specific Risk (Medium+ only)”
- Column F badge: “Risk Level (output)”
- Column G badge: “Department for Review (output)”

Tooltips must clearly state:
- D is what gets classified
- F/G are predicted
- E is generated only when F is Medium or higher

### B) Train pane
Train UI must show:
- selected worksheet name
- training row count:
  - rows with D present
  - rows with F present
  - rows with G present
- class distributions for F and G (top counts)

If many labels missing:
- show guidance: “Fill risk level (F) and department (G) for training rows, or they will be skipped.”

### C) Classify pane
Classify UI must include:
- overwrite toggle (default OFF)
- preview mode that shows:
  - how many rows will be classified
  - which rows will be updated
  - a small sample of predicted F/G (and E where Medium+)

After classification:
- fill F/G for eligible rows
- fill E only for Medium+ rows
- highlight rows with `needsReview=true` or low confidence

### D) Review affordances
Add filters:
- Needs review
- Medium+
- Missing D
Sort options:
- Risk level descending (Critical → High → Medium → Low)

---

## UI error messaging requirements
- If classify fails for a row:
  - show row-level error indicator
- If E generation fallback occurred:
  - show “Needs review” and expose the fallback reason

---

## Tests (if frontend tests exist)
Add minimal tests:
- column badges render
- overwrite toggle default is off
- needsReview filter appears after classify results include needsReview=true

Manual smoke tests:
- upload xlsx → see correct sheet chosen
- train → see counts/distributions
- classify with overwrite off → existing values remain
- classify with overwrite on → values update
- export → download works

---

## Final frontend DoD for V4.10
- UI makes D/E/F/G meaning obvious
- overwrite toggle is present and respected
- E is shown as conditional and “Needs review” is easy to see/filter
