# Music Elements (v7.3)

## Overview
MIND v7.3 introduces reusable, theory-based building blocks for generating music without literal transcription. The system is layered:

1. **HarmonyPlan** — defines what chords sound and when they change.
2. **TextureRecipe** — defines how those chords are voiced and patterned.
3. **PhrasePlan** — defines how density, register, and ornamentation evolve over time.

These layers generate events deterministically, so the same inputs always yield the same output.

## HarmonyPlan
`HarmonyPlan` stores chord changes per bar/step and serves chord pitches for each grid step.

Key points:
- Uses a fixed grid (e.g., `1/12`) and bar-aware step indexing.
- Supports per-bar change steps.

```python
from mind_api.mind_core.music_elements import HarmonyPlan

harmony = HarmonyPlan.from_chords(
    [[60, 64, 67], [62, 65, 69]],
    steps_per_bar=12,
    change_steps=[[0], [0, 6]],
)
```

## TextureRecipe
`TextureRecipe` defines pattern families, register intent, and sustain policy. Pattern selection is deterministic using a stable seed.

```python
from mind_api.mind_core.music_elements import TextureRecipe

texture = TextureRecipe(
    pattern_family=("low-mid-high", "high-mid-low"),
    sustain_policy="hold_until_change",
)
```

## PhrasePlan
`PhrasePlan` shapes the musical contour by bar:
- **density_curve**: how many attacks per bar
- **register_curve**: lift/settle intent (reserved for later expansion)
- **ornament_curve**: optional ornament intensity

```python
from mind_api.mind_core.music_elements import PhrasePlan

phrase = PhrasePlan(density_curve=(0.6, 0.75, 0.9, 0.8))
```

## Sustain semantics
Sustain is represented by durations > 1 in the generated events.

Supported policies:
- `hold_until_change`: tones start at chord changes and last until the next change.
- `pedal_hold`: tones last until a pedal lift step.

## Deterministic variation
All variation must be derived from stable inputs:
- `piece_id`
- `seed`
- bar index
- step index

No unseeded randomness is allowed. Pattern selection and density sampling should use the stable seed helper.

## Example: generate a 4-bar texture
```python
from mind_api.mind_core.music_elements import HarmonyPlan, PhrasePlan, TextureRecipe, generate_events

harmony = HarmonyPlan.from_chords(
    [[60, 64, 67], [62, 65, 69], [59, 63, 66], [60, 64, 67]],
    steps_per_bar=12,
    change_steps=[[0], [0, 6], [0], [0, 6]],
)
phrase = PhrasePlan(density_curve=(0.6, 0.7, 0.9, 0.8))
texture = TextureRecipe(
    pattern_family=("low-mid-high", "high-mid-low"),
    sustain_policy="hold_until_change",
)

events = generate_events(
    harmony,
    texture,
    phrase,
    bars=4,
    grid="1/12",
    seed=7,
    piece_id="quickstart",
)
```

## Quickstart example file
A runnable example is provided in `docs/examples/texture_quickstart_v7_3.txt`.

Run it through the reporting tool:

```bash
PYTHONPATH=backend python -m mind_api.mind_core.reporting.moonlight_report \
  --equation docs/examples/texture_quickstart_v7_3.txt --json
```

## Adding a new texture safely
Checklist:
- [ ] Deterministic behavior using stable seeds.
- [ ] Unit tests covering deterministic output and density changes.
- [ ] Sustain policy integration tested with durations > 1.
- [ ] No note-for-note transcription logic.
