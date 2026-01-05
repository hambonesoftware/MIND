# Phase 3 — Inspector Layout Reorg (Core / Style / Style Options / Advanced)

## Objective
Rebuild the Thought inspector UI to the new structure:
- Core: Label, DurationBars, Key
- Style: Style dropdown, Instrument (Auto/Override)
- Style Options: Seed first, then Harmony/Pattern controls (Auto/Override)
- Advanced: original raw fields (collapsed)

This phase focuses on UI layout and wiring basic state updates (no full auto/lock logic yet).

## Primary agent
- Agent_Frontend_ThoughtInspectorReorg

## Supporting agents
- Agent_Frontend_ThoughtMigrations
- Agent_QA_TestMatrixAndRegression

## Files to modify
- `frontend/src/ui/flowInspector.js`
- `frontend/styles.css` (if needed)

## Tasks

### 3.1 Refactor renderThoughtEditor into sections
In `flowInspector.js`:
- Split `renderThoughtEditor(node)` into helper renderers:
  - `renderThoughtCoreSection(...)`
  - `renderThoughtStyleSection(...)`
  - `renderThoughtStyleOptionsSection(...)`
  - `renderThoughtAdvancedSection(...)`

### 3.2 Add Style dropdown + seed display (no auto yet)
- Add `Style` dropdown bound to `params.styleId`.
- Add `Style Seed` numeric field bound to `params.styleSeed`.
- Place Seed as the first row under Style Options.

### 3.3 Keep existing editors available (Advanced)
- Preserve existing Harmony/Pattern UI editors in an “Advanced” collapsible section.
- Ensure `melodyMode = custom` still shows the Custom Melody editor as before.

### 3.4 Minimal styling
- Add section headers and spacing.
- Ensure collapsed sections are usable and not visually noisy.

## Testing that must pass
- Manual UI smoke:
  - open Thought inspector
  - confirm new layout renders and is usable
  - confirm no console errors
- `cd backend && pytest -q`

## Success checklist
- [ ] Seed appears first under Style Options
- [ ] Style dropdown works and persists to graph state
- [ ] No existing fields removed (they are available in Advanced)
- [ ] Custom Melody UI still works
- [ ] Backend tests pass
