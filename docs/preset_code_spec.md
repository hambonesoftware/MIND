# Preset Code Spec (PS1)

This document defines the **Preset Code** format for **Preset Schema Version PS1/PS2** and **Generator Version GV1**.

## Goals
- **Reversible:** `decode(encode(settings)) == canonical(settings)`
- **Versioned:** includes `presetSchemaVersion` (PS1) and `generatorVersion` (GV1)
- **Deterministic:** same code + GV yields identical output
- **Forward compatible:** unknown fields ignored; missing fields defaulted

## Format (KV string)

**Canonical form (PS1):**
```
MIND|PS1|GV1|role=verse;voice=auto;style=pop;inst=auto;pat=auto;mood=warm;energy=medium;complexity=normal;variation=similar;len=8;reg=mid;reroll=0
```

**Canonical form (PS2):**
```
MIND|PS2|GV1|role=verse;voice=auto;style=pop;inst=auto;pat=auto;mood=warm;energy=medium;complexity=normal;variation=similar;len=8;reg=mid;reroll=0;style_sub=auto;style_era=auto;style_feel=auto;avoid_arps=auto;avoid_leaps=auto;avoid_busy=auto;avoid_chromatic=auto;voice_art=auto;voice_tone=auto;voice_human=auto;voice_poly=auto;voice_layer=auto;pattern_mask=auto;pattern_density=auto;pattern_accents=auto;pattern_contour=auto;pattern_repeat=auto;mood_tension=auto;mood_bright=auto;mood_resolve=auto;energy_dyn=auto;energy_drive=auto;energy_attack=auto;energy_peaks=auto;complexity_harmony=auto;complexity_melody=auto;complexity_rhythm=auto;complexity_orn=auto;variation_strategy=auto;variation_similarity=auto;variation_window=auto;variation_seedmode=auto;length_phrase=auto;length_cadence=auto;register_width=auto;register_move=auto
```

### Grammar
- Prefix: `MIND|<PS>|<GV>|` (pipe-delimited)
- Body: key/value pairs separated by `;`
- Pair format: `key=value`
- Keys and values are **lowercase** (canonical serialization)

## Canonical field ordering (PS1)
1. `role`
2. `voice`
3. `style`
4. `inst`
5. `pat`
6. `mood`
7. `energy`
8. `complexity`
9. `variation`
10. `len`
11. `reg`
12. `reroll`

## Canonical field ordering (PS2)
PS2 extends PS1 by appending advanced fields in the following order:
1. `style_sub`
2. `style_era`
3. `style_feel`
4. `avoid_arps`
5. `avoid_leaps`
6. `avoid_busy`
7. `avoid_chromatic`
8. `voice_art`
9. `voice_tone`
10. `voice_human`
11. `voice_poly`
12. `voice_layer`
13. `pattern_mask`
14. `pattern_density`
15. `pattern_accents`
16. `pattern_contour`
17. `pattern_repeat`
18. `mood_tension`
19. `mood_bright`
20. `mood_resolve`
21. `energy_dyn`
22. `energy_drive`
23. `energy_attack`
24. `energy_peaks`
25. `complexity_harmony`
26. `complexity_melody`
27. `complexity_rhythm`
28. `complexity_orn`
29. `variation_strategy`
30. `variation_similarity`
31. `variation_window`
32. `variation_seedmode`
33. `length_phrase`
34. `length_cadence`
35. `register_width`
36. `register_move`

## Field definitions
- `role`: intro | verse | pre-chorus | chorus | bridge | outro | fill
- `voice`: auto | lead | harmony | bass | drums | fx
- `style`: pop | hip-hop | electronic | lo-fi | rock | jazz | classical | cinematic | world | experimental
- `inst`: **curated slug** per voice type (or `auto`)
- `pat`: **curated slug** per voice type (or `auto`)
- `mood`: bright | warm | dreamy | dark | mysterious | tense | epic | playful
- `energy`: low | medium | high | peak
- `complexity`: simple | normal | rich
- `variation`: same | similar | fresh | wild
- `len`: 2 | 4 | 8 | 16
- `reg`: low | mid | high
- `reroll`: integer >= 0 (default 0)
- PS2 advanced fields use `auto` by default and accept enumerated values from the Advanced UI.

## Defaults
If a field is missing, default to:
- `role=verse`
- `voice=auto`
- `style=pop`
- `inst=auto`
- `pat=auto`
- `mood=warm`
- `energy=medium`
- `complexity=normal`
- `variation=similar`
- `len=8`
- `reg=mid`
- `reroll=0`

## Validation and normalization rules
- **Unknown fields**: ignore safely (do not error).
- **Unknown values**: treat as invalid and default.
- **Ordering**: normalize to the canonical order on encode/serialize.
- **Case**: normalize to lowercase on decode.
- **Whitespace**: ignore surrounding whitespace when decoding.

## Reroll semantics
- `reroll` is the only field that should change when the user presses **Reroll**.
- Changing `reroll` changes the output while keeping other settings identical.
- Same **full code** (including `reroll`) with the same GV must reproduce identical output.

## Version policy
- **presetSchemaVersion (PS):** bump when the Preset Code structure changes (field list, meaning, or serialization).
- **generatorVersion (GV):** bump when generated output would change for the same Preset Code.

## Migration policy
- PS1 codes should be migrated to PS2 by appending advanced fields with `auto` defaults.
- Preserve `reroll` when possible; if absent, default to `0`.

## Examples
**Minimal valid code (defaults applied on decode):**
```
MIND|PS1|GV1|role=verse;voice=auto;style=pop;inst=auto;pat=auto;mood=warm;energy=medium;complexity=normal;variation=similar;len=8;reg=mid;reroll=0
```

**User-customized example:**
```
MIND|PS1|GV1|role=chorus;voice=lead;style=pop;inst=synth_lead;pat=hook;mood=dreamy;energy=high;complexity=normal;variation=fresh;len=8;reg=mid;reroll=3
```
