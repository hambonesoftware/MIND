# Phase 06 — Canvas + Inspector Polish + Refactor Large UI Files

## Objective
Make the canvas feel “complete” with guided Thoughts while enforcing separation of concerns.

Key outcomes:
- Thought nodes show a concise summary (chips) and an Edit button
- The old parameter-dump inspector is removed from the default path
- Large UI files are refactored into modules (especially `flowInspector.js`)

## Changes

### A) Thought node summary chips
Edit:
- `frontend/src/ui/flowCanvas.js`

Show (minimum):
- role badge color
- chips: style, mood, motion, density, harmonyBehavior (when present)
- “Edit” button

### B) Simplify + refactor flowInspector
Refactor:
- `frontend/src/ui/flowInspector.js` (currently very large)

Target structure:
- `frontend/src/ui/inspector/InspectorRoot.js`
- `frontend/src/ui/inspector/panels/*`
- `frontend/src/ui/inspector/components/*`

Goal:
- `flowInspector.js` should become a thin wrapper or be replaced by new files.

### C) Raise the file-length bar gradually
In this phase, begin enforcing a stricter threshold during development for UI folders:
- Run: `MAX_LINES=1500 node scripts/audit_file_lengths.mjs`
- Fix the worst offenders you touched.

## Tests that must be run (and pass)
From repo root:

- `MAX_LINES=1500 node scripts/audit_file_lengths.mjs`
- `node scripts/audit_no_placeholders.mjs`
- `node scripts/test_style_resolver.mjs`
- `cd backend && python -m pytest -q`

## Success checklist
- ✅ Thought nodes are readable without opening the inspector
- ✅ Inspector is no longer a parameter dump
- ✅ `flowInspector.js` is dramatically smaller or replaced with modular files
