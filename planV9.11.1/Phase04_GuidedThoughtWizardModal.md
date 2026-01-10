# Phase 04 — Guided Thought Wizard Modal (Option B)

## Objective
Implement the vertically guided Thought authoring experience as a modal that:
- Opens when inserting a Thought, and when editing an existing Thought
- Writes to `intent` (not raw note grids)
- Uses locks + reroll for intentional exploration
- Keeps the node canvas workflow intact

## Changes

### A) Create the wizard UI in small files (avoid mega-files)
Create folder structure:
- `frontend/src/ui/thoughtWizard/`
- `frontend/src/ui/thoughtWizard/steps/`

Create (minimum):
- `frontend/src/ui/thoughtWizard/thoughtWizardModal.js`
- Step components under `steps/` (one file per step; keep each < 300 lines)

### B) Wizard steps (minimum viable)
Steps must be vertical and only reveal what’s next:
1) Goal
2) Role
3) Style
4) Mood
5) Motion
6) Density
7) Harmony behavior (conditional)
8) Sound color
9) Commit

### C) Open/close wiring
Edit:
- `frontend/src/ui/flowPalette.js` (insert Thought → open wizard)
- `frontend/src/ui/flowCanvas.js` (node “Edit” affordance)
- `frontend/src/ui/flowInspector.js` (Thought inspector becomes summary + Edit)

### D) Immutables rule (enforced)
All step code must reference:
- `frontend/src/music/immutables.js`

No raw strings for Intent/Compiled keys inside the wizard files.

## Tests that must be run (and pass)
From repo root:

- `node scripts/audit_no_raw_thought_keys.mjs`
- `node scripts/audit_contracts.mjs`
- `node scripts/audit_immutables.mjs`
- `node scripts/test_style_resolver.mjs`
- `cd backend && python -m pytest -q`

## Success checklist
- ✅ Inserting a Thought opens the wizard automatically
- ✅ Wizard commits produce valid `intent`
- ✅ Thought nodes are editable via the wizard
- ✅ No raw key strings inside wizard folder
