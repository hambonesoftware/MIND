# Phase 5 — Frontend: Graphical Custom Melody Editor (Thought Inspector)

## Objective
Provide a visual editor in the Thought “custom” area so users do NOT have to type `9..9--..`.
The editor must support:
- selecting a bar (relative inside the thought)
- clicking steps on/off
- marking holds/ties
- entering explicit notes aligned to note starts
- copy/paste bar patterns (to quickly author repeated motifs)

## Agent(s) (from agentsV9.5.zip)
- `Agent_Frontend_ThoughtInspectorCustomMelody`
- `Agent_Frontend_StepLatchUI`
- `Agent_QA_UIRegression`

## Files to change
- `frontend/src/ui/flowInspector.js`
- `frontend/src/ui/stepStrip.js` (currently empty/placeholder in some versions)
- `frontend/styles.css` (or equivalent)
- Possibly a small helper: `frontend/src/ui/customMelodyModel.js` (new) to keep logic tidy

## UX requirements
1) Melody Mode toggle
- Generated / Custom

2) Bar picker
- “Bar 1 … Bar N” where N = thought duration bars (or number of custom bars stored)
- Clearly label mapping: “Bar 1 = global bar 5” (optional, but recommended for Moonlight)

3) Step strip (PLC latch vibe)
- One row of steps:
  - Off: empty
  - On: filled/lit
  - Hold: filled + tail/marker
- Interactions:
  - Click: toggle On/Off
  - Double click: toggle Hold on the step AFTER an On step (or a separate hold state)
  - Right click: clear step state (optional)

4) Notes editor for note-start steps
- For each On step in the rhythm:
  - show a note input aligned with that step index
- Notes can be entered as pitch names (`C#5`, `E5`, etc)

5) Utilities
- Copy bar
- Paste bar
- Apply “Rhythm Preset A” (your bars 5/6/10/11 motif)
- Apply “Rhythm Preset B” (your bars 7/8/9/12–16 motif)
- Copy previous bar

## Data integrity rules
- Rhythm string length must match step count for the grid.
- Holds must not exist without a preceding On (either auto-fix or block).
- Notes count must match number of note-on steps (or warn).

## Success checklist
- [ ] You can author a bar rhythm purely by clicking
- [ ] Holds/ties are representable and saved
- [ ] Notes can be assigned per note-start step
- [ ] Switching bars preserves edits
- [ ] Copy/paste and presets speed up authoring
- [ ] Saved project reloads with identical custom melody data

## Testing
Manual
- Create a custom melody thought with 12 bars.
- Apply preset A to bar 1, preset B to bar 2, etc.
- Enter a few notes; play and confirm audible output.
Regression
- Ensure non-custom thoughts still edit as before.

## Stop / Hold criteria
Stop if:
- UI edits do not persist (state mutation bugs)
- Step strip drags the node instead of toggling steps
- Step count/grid mismatches cause corruption

