# Phase 06 — Custom Melody Graphical Editor (Latch Strip + Notes + Bar Selector)

**Agent reference (assumed to exist):** `agentsV9.5/Phase_06_CustomMelody_GraphicalEditor_Agent.md`

## Purpose
Replace the text-only `9-.-` authoring with a graphical editor that matches your PLC-latch concept, while still serializing to the same underlying rhythm string.

## Scope
Frontend only:
- Thought inspector UI for Custom Melody
- Implement a “latch strip” component for rhythm
- Provide bar selection and note entry UI

## UI requirements (minimum)
When Melody Mode = Custom, show:

1) Grid selector
2) Bar selector (1..durationBars)
3) Rhythm latch strip
   - one cell per step (e.g., 16 for 1/16)
   - click toggles: rest ↔ note-on
   - double-click toggles: hold (tie) on the *current* step (only valid following a note-on)
   - (optional) right-click clears cell to rest
4) Notes editor
   - show one input per note-on in the rhythm
   - notes displayed in order of occurrence
   - editing notes updates `customMelody.bars[barIndex].notes`

## Serialization contract
The latch strip always writes a rhythm string composed of:
- `9`, `-`, `.`

Ensure:
- rhythm string length always equals steps-per-bar
- if user creates invalid hold (a `-` without prior note), auto-correct to `.`, or allow but show warning

## Copy/paste helpers (recommended)
- “Copy bar”
- “Paste bar”
- “Duplicate previous bar”
- “Apply preset A”
- “Apply preset B”

These presets should match your Moonlight treble pattern families:
- Preset A: “3 beats + extension + 16th-ish tail” (you can encode it in the rhythm string)
- Preset B: “4 beat bar variant”

Even if the preset encoding is not perfect yet, provide them as starting points.

## Files to change/create
- `frontend/src/ui/flowInspector.js`
- `frontend/src/ui/stepStrip.js` (implement component)
- (optional) `frontend/src/ui/customMelodyEditor.js` (new)
- `frontend/styles.css` for latch visuals + focus states

## Success checklist
- [ ] User can author rhythm without typing text.
- [ ] Rhythm updates produce stable `customMelody` state.
- [ ] Notes inputs correspond to rhythm note-ons.
- [ ] Copy/paste/preset actions work.
- [ ] Build passes.

## Required tests
- [ ] Manual: create custom thought, enter a simple rhythm+notes, play → hear melody.
- [ ] Manual: change grid 1/16 ↔ 1/12 → latch strip updates (or blocks change with warning).
- [ ] (Optional) Frontend unit test: latch strip serialization.
