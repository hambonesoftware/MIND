# Phase 2 — Inspector UI: Progressive Disclosure (Simple / Advanced / Expert)

## Objective
Reduce UI complexity by presenting a **Simple** view by default, with **Advanced** and **Expert** tabs/sections.
Write values into the **joined objects** primarily, while still displaying legacy values for existing thoughts.

## Scope
- `frontend/src/ui/flowInspector.js`
- Any small UI helper components under `frontend/src/ui/*` if needed

## UX Targets (Minimized)
### Simple (default)
Show only:
- label
- durationBars
- key
- style: id + mood (mode/id) + seed (optional “re-roll”)
- voice preset (optional; otherwise recommended)
- One “Intent” toggle is optional; do not add if it expands scope.

### Advanced
Show joined groups with mode switches:
- harmony (mode + preset/custom/single)
- pattern (generated/custom)
- feel (preset/manual)
- voice register (min/max)

### Expert
Show:
- raw overrides: chordNotes override, custom roman string, custom melody editor (grid/bars), manual feel knobs
- legacy fields only if the thought is legacy-only OR for debugging

## Implementation Steps

### 1) Add UI view mode control
- Add a UI-only state for inspector view mode:
  - `inspectorViewMode: "simple" | "advanced" | "expert"`
- Persist it in the existing UI prefs mechanism if one exists (optional).
- Default: `"simple"`.

### 2) Render joined objects as the primary editors
- When the user edits fields in Simple/Advanced/Expert:
  - write into `params.style`, `params.harmony`, `params.pattern`, `params.feel`, `params.voice`
- For a legacy thought (no joined objects):
  - on first edit, initialize joined objects from normalization defaults OR build them from legacy fields
  - then continue writing to joined objects

### 3) Hide legacy knobs by default
- In Simple/Advanced: do not show legacy flat fields.
- In Expert: show legacy fields only in a collapsible “Legacy (v9.7)” section.

### 4) Ensure option lists still work
- Existing catalogs (pattern/harmony/feel/instrument) should continue to populate selects.
- When a user changes a selection:
  - store the selection under the joined object field (e.g., `harmony.preset.id`).

## Tests / Verification
Manual:
1) Create a new Music Thought
   - confirm defaults populate
   - choose style/mood, pick progression preset, choose pattern
   - press Play → sound works
2) Switch to Advanced/Expert
   - confirm controls appear/disappear correctly
3) Load a legacy thought (flat keys only)
   - confirm fields display
   - edit something small in Simple and confirm it does not break playback

## Required Commands
- `npm run lint`
- `npm run dev`

## Success Checklist
- [ ] Simple view shows ~6–10 fields (not dozens).
- [ ] Editing writes to joined objects (verify in node JSON or devtools state).
- [ ] Legacy thoughts still render and are editable.
- [ ] No console errors when toggling view modes.
