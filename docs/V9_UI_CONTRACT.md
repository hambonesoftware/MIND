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

## Thought Inspector (V9.6 layout)

Sections (top to bottom):
- **Core**: Label, Duration Bars, Key.
- **Style**: Style dropdown, Instrument preset + Register (Auto/Override + Lock).
- **Style Options** (collapsed by default): Seed (with Reroll/Copy/Paste), Harmony (Mode, presets, variants), Pattern (note pattern + melody mode), Feel (grid/syncopation/timing). Auto/Override per group plus Lock toggle.
- **Advanced**: Legacy/raw controls, custom melody editor, quick actions (e.g., Moonlight).

Behavior:
- Seed changes deterministically drive Auto selections; Locks freeze fields; Overrides keep user choices.
- Style change re-filters progression/pattern pickers; if the current value is invalid, fallback to the first valid option without changing other fields.
- Custom melody editor remains accessible when melody mode = custom (Advanced retains legacy access).
- Style Options are keyboard navigable (inputs/selects/buttons order matches visual layout).
