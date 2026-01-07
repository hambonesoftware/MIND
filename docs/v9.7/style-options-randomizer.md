# V9.7 Style Options Randomizer

## Overview
The V9.7 Style Options panel selects concrete values for style, mood, harmony, feel, pattern, and instrument. Selections are deterministic for the same `styleSeed` and Thought ID, so the same inputs always resolve to the same output.

## Style selection
1. Choose a Style from the Style dropdown.
2. The style determines the available mood, harmony, pattern, feel, instrument, and register catalogs.
3. Style choices apply immediately.

## Mood selection
1. Choose a Mood from the Mood dropdown (populated by the selected style).
2. Mood selection influences the recommended harmony/pattern/feel/instrument sets.
3. Mood choices apply immediately.

## Seed field behavior
- The `styleSeed` drives deterministic selection.
- Same `styleSeed` + Thought ID + style/mood combination produces the same results.
- Changing the seed triggers a new deterministic selection.

## Reroll triggers
The Style Options panel rerolls only when one of these happens:
- First open for a new signature (styleId | moodId | styleSeed).
- Style changes.
- Mood changes.
- Seed changes.
- User presses **Reroll**.

Reopening the panel without these triggers does not reroll.

## Manual overrides
- Selecting a value directly in a dropdown (e.g., harmony preset, pattern, feel, instrument) overrides the current selection.
- Manual preset harmony (`harmonyMode = progression_preset`) remains in effect unless the user rerolls or explicitly chooses custom harmony.
- Manual edits to `progressionCustom` are preserved until a reroll or new signature change occurs.

## Tips
- Use a fixed seed when you want reproducible outputs.
- Use Reroll for quick exploration without changing the style or mood.
