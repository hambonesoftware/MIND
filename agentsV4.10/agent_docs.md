# agent_docs — Documentation owner for planV4.10

## Mission
Make the new column mapping and workflow unambiguous for users, and ensure acceptance criteria are documented and referenced by tests.

---

## Phase 00 deliverables
Create:
- `docs/contracts/v4_10_acceptance.md`

It must explicitly state:
- Column D is the customer specification text input
- Column F is the predicted risk level output
- Column G is the predicted department output
- Column E is the specific risk description output and is conditional:
  - blank for Low
  - generated for Medium+

Include “failure mode” rule:
- If E generation fails: fallback string + needsReview flag

---

## Phase 05 deliverables (UI copy)
Provide exact tooltip text for D/E/F/G:
- D tooltip: “Customer specification text used as model input.”
- F tooltip: “Predicted risk level.”
- G tooltip: “Predicted department for review.”
- E tooltip: “Specific risk rationale. Only generated when risk level is Medium or higher.”

Provide user guidance snippets for:
- missing labels in training rows (F/G)
- overwrite toggle meaning

---

## Phase 07 deliverables
Update project root `README.md` with:
- New mapping:
  - D spec, E risk desc, F risk level, G department
- Workflow:
  - Load → Train → Classify → Export
- Explanation of conditional E behavior
- Troubleshooting:
  - “No 'Quote #' sheet found” warning
  - “Needs review” meaning
  - what to do if E fallback appears

Also add a short changelog entry for V4.10 if the repo uses one.

---

## DoD
Docs are “done” when:
- acceptance contract exists and matches tests
- root README is updated and accurate
- UI tooltip copy is delivered and matches the UI
