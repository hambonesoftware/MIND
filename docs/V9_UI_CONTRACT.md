# MIND V9 UI Contract

This document defines the required UI behaviors for V9 semantics.

## Switch editor
- Presents a **branch table** with ordered rows.
- Evaluation is **First Match** from top to bottom.
- Provides a **Default** branch row that always exists.
- Condition sources:
  - **Counter** (value comparisons)
  - **BarIndex** (value comparisons)
  - **Manual** (user toggles)
  - **Random (seeded)** (deterministic per stream seed)
  - **Always**

## Join (Barrier) editor
- Allows configuring required input ports.
- Displays current barrier status (which inputs have arrived).
- Releases when all required inputs have arrived within the barrier window.

## Rivulet Lab Preview
A mini-lab panel docked **above** the Stream canvas used to audition a Thought before publishing.

**Controls**
- Thought selector (draft/published)
- Play/Stop audition controls
- Instrument preset chooser (sf2/sf3)
- Preview tempo / bar length controls

**Readiness checks**
- Thought validates without parse errors.
- Required instrument preset is selected.
- Preview audio engine reports ready.
- Optional: shows warnings for missing pattern content.

## Canvas UX requirements
- Stream canvas shows fan-out, merge, and join semantics clearly.
- Join nodes are visually distinct to emphasize AND semantics.
