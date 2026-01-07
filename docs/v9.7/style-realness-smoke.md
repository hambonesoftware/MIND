# V9.7 Style Realness Smoke Checklist

Use this checklist to verify V9.7 style behavior without needing to inspect code. Complete all steps for each style.

## Styles to test
1. Classical / Film (`classical_film`)
2. Jazz / Blues / Funk (`jazz_blues_funk`)
3. Pop / Rock (`pop_rock`)
4. EDM / Electronic (`edm_electronic`)
5. Latin / Afro-Cuban (`latin_afro_cuban`)
6. Folk / Country / Bluegrass (`folk_country_bluegrass`)

## Global checks (run once)
- **Determinism check**: set `styleSeed = 7`, open Style Options, note pattern/harmony/feel/instrument. Close and reopen; values must remain unchanged.
- **Reroll check**: press **Reroll**; confirm at least one of pattern/harmony/feel/instrument changes.
- **Seed change check**: set `styleSeed = 8`; confirm values change deterministically.
- **Pattern difference check**: create 3 Thoughts with the same harmony/grid, set notePatternId to `alberti_bass`, `walking_bass_simple`, and `gate_mask`; confirm they sound audibly different.
- **Focus bug check**: type quickly in `label`, `key`, and `progressionCustom`; caret should stay in the input without the workspace stealing focus.

## Per-style checklist (repeat for all 6 styles)
For each style listed above:
1. Select the style in Style Options.
2. Confirm Mood dropdown lists at least 4 moods.
3. Confirm Note Pattern dropdown lists at least 8 options.
4. Confirm Chord Progression dropdown lists at least 12 presets.
5. Confirm Feel dropdown lists at least 8 options.
6. Confirm Instrument dropdown lists at least 10 options.
7. Confirm Register dropdown lists at least 6 options.
8. Set `styleSeed = 7`, open Style Options, note the suggested harmony.
9. Set `styleSeed = 7` again (no change); confirm the harmony remains the same.
10. Change `styleSeed = 9`; confirm the harmony suggestion changes.

## Notes
- If any dropdown is empty or below the minimum counts, mark the test as failed.
- If reroll or seed changes do not alter values, mark determinism as failed.
