# Phase 7 — Moonlight Treble Template + Validation Scenario

## Objective
Add an “Insert Moonlight Treble (Bars 1–16)” action that:
- creates the minimal graph structure for RH treble staff
- wires fan-out from the intro thought to melody + triplets
- sets appropriate defaults for grid/harmony/preset
- provides a ready-to-author melody thought using the new custom editor

## Agent(s) (from agentsV9.5.zip)
- `Agent_Frontend_TemplateBuilder`
- `Agent_QA_MoonlightScenario`

## Files to change
- `frontend/src/ui/flowInspector.js` (or wherever you place “templates” actions)
- `frontend/src/state/flowGraph.js` (helpers to add nodes/edges)
- Optional: `frontend/src/templates/moonlightTreble.js` (new) to keep it clean

## Template structure (recommended)
1) Node: `Treble_Intro_Bars1to4`
- type: thought
- mode: generated
- grid: 1/12
- durationBars: 4
- uses your existing chord progression / arp settings (simple, stable)

2) Node: `Treble_Triplets_Bars5to16`
- type: thought
- mode: generated
- grid: 1/12
- durationBars: 12

3) Node: `Treble_Melody_Bars5to16`
- type: thought
- mode: custom
- grid: 1/16
- durationBars: 12
- custom bars initialized empty
- includes rhythm presets A/B available in the editor

Edges
- Start → Treble_Intro
- Treble_Intro(out) → Treble_Triplets(in)
- Treble_Intro(out) → Treble_Melody(in)

## Validation scenario
1) Insert template.
2) Author Melody:
- Apply Preset A to bars 1,2,6,7 (relative) matching your motif grouping.
- Apply Preset B to the others.
- Enter a subset of notes (even a simplified melody is fine for initial validation).
3) Play and confirm:
- Intro plays bars 1–4
- At bar 5, both triplets + melody begin concurrently
- Both thoughts glow (Phase 6)
- No console spam

## Success checklist
- [ ] Template reliably creates nodes and edges
- [ ] Fan-out occurs at the intro thought completion
- [ ] Triplet bed plays continuously bars 5–16
- [ ] Melody thought is editable and plays entered notes
- [ ] Glow highlights active thoughts
- [ ] No major errors in console

## Stop / Hold criteria
Stop if:
- UI does not allow multiple edges from Treble_Intro out port
  - If so, add a “Split” node as a UX-only workaround (do not change runtime semantics)
- Template creates invalid node params (schema mismatch)

