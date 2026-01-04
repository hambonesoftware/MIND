# Phase 08 — Moonlight Treble Template + Validation (Bars 1–16)

**Agent reference (assumed to exist):** `agentsV9.5/Phase_08_MoonlightTreble_TemplateAndValidation_Agent.md`

## Purpose
Provide a built-in template that creates the treble-clef structure for Moonlight Sonata (1st movement) page 1 bars 1–16:

- Thought A: Bars 1–4 (treble intro texture)
- Fan-out to:
  - Thought B: Bars 5–16 Melody (Custom Melody)
  - Thought C: Bars 5–16 Triplet bed (Generated harmony+arp)

This gets users to “something musical fast” and validates the new authoring tools.

## Scope
- Frontend: template insertion action + graph creation
- No requirement to pre-fill all exact notes yet (but provide rhythm presets and a workflow)
- Validation steps confirm the system can represent bars 1–16 accurately once notes are entered

## Implementation steps

### 8.1 Add “Insert Moonlight Treble (Bars 1–16)” action
Expose in the UI:
- Preferably in the flow inspector or a “Templates” dropdown in stream UI.

Action should:
1) Create nodes:
   - Start node (if missing)
   - Thought A (durationBars=4, grid=1/12, generated/harmony settings)
   - Thought B (durationBars=12, melodyMode=custom, grid=1/16)
   - Thought C (durationBars=12, grid=1/12, generated)
2) Create edges:
   - Start → Thought A
   - Thought A → Thought B
   - Thought A → Thought C
3) Position nodes nicely in the canvas.

### 8.2 Provide rhythm presets for Melody thought
Within Thought B editor:
- Preset A applies to bars {5,6,10,11} in global numbering (i.e., thought bar indices {0,1,5,6})
- Preset B applies to other bars (indices {2,3,4,7,8,9,10,11})

If you do not want to hardcode bar indices yet:
- Provide preset buttons and let user apply bar-by-bar.

### 8.3 Validation workflow (manual)
1) Insert template
2) Click Start Play:
   - bars 1–4 should play (at least some treble intro texture)
3) On bar 5 transition:
   - both Thought B and Thought C should glow (even if melody silent until notes are filled)
4) Enter melody notes for a single bar (bar 5):
   - hear melody over triplet bed

### 8.4 Optional: include “starter notes”
If comfortable, prefill bar 5 notes to prove it works:
- only 1 bar worth of notes is enough to validate.

## Files to change
- `frontend/src/ui/flowInspector.js` (or wherever templates/actions are defined)
- `frontend/src/state/flowGraph.js` (helpers to insert nodes/edges)
- Potential new file: `frontend/src/ui/templates/moonlightTreble.js`

## Success checklist
- [ ] Template inserts correctly with 3 thoughts + edges.
- [ ] Fan-out works (two outgoing edges from Thought A exist).
- [ ] Playback starts via Start node and schedules events.
- [ ] Glow shows both concurrent thoughts in bars 5–16.
- [ ] Custom melody entered for a bar is audible.

## Required tests
- [ ] Manual template insertion + playback on Chrome desktop.
- [ ] Manual on Chrome mobile.
