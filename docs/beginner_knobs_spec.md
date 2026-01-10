# Beginner Knobs Spec (PS1)

This document defines the **Beginner** knob contract for Preset Schema **PS1**.
Values are **case-insensitive** in UI, but the **canonical** serialized form is **lowercase**.

## Beginner knob list (PS1)

1. **Role**
   - **Values:** intro, verse, pre-chorus, chorus, bridge, outro, fill
   - **Default:** verse
   - **Meaning:** the musical function of the thought in the song graph.
   - **UI label:** "Fill/Transition" serializes as `fill`.

2. **Voice Type**
   - **Values:** auto, lead, harmony, bass, drums, fx
   - **Default:** auto
   - **Meaning:** the musical role for arrangement/voicing and menu filtering.
   - **UI label:** "FX/Transitions" serializes as `fx`.

3. **Style**
   - **Values:** pop, hip-hop, electronic, lo-fi, rock, jazz, classical, cinematic, world, experimental
   - **Default:** pop
   - **Meaning:** high-level genre family that biases instruments, patterns, and harmony.

4. **Instrument**
   - **Values:** curated per voice type (see UI menus); must be a known slug.
   - **Default:** auto
   - **Meaning:** the primary timbre; when `auto`, system chooses a sensible default.

5. **Pattern**
   - **Values:** curated per voice type (see UI menus); must be a known slug.
   - **Default:** auto
   - **Meaning:** the rhythmic/melodic pattern family.

6. **Mood**
   - **Values:** bright, warm, dreamy, dark, mysterious, tense, epic, playful
   - **Default:** warm
   - **Meaning:** harmonic/tonal coloration and affect.

7. **Energy**
   - **Values:** low, medium, high, peak
   - **Default:** medium
   - **Meaning:** overall intensity and density bias.

8. **Complexity**
   - **Values:** simple, normal, rich
   - **Default:** normal
   - **Meaning:** note density and rhythmic/structural variation.

9. **Variation**
   - **Values:** same, similar, fresh, wild
   - **Default:** similar
   - **Meaning:** how much the generated result should deviate from the baseline.

10. **Length**
    - **Values:** 2, 4, 8, 16 (bars)
    - **Default:** 8
    - **Meaning:** phrase length in bars.

11. **Register** (Beginner compact control)
    - **Values:** low, mid, high
    - **Default:** mid
    - **Meaning:** preferred octave range for the generated material.

## Notes
- **Register is included in Beginner (compact row)** for PS1, but can be surfaced in a condensed UI control.
- Instrument/Pattern value lists are **curated and filtered** by Voice Type and Role defaults; the presets must always serialize a **known slug**.
- Any **missing** knob value defaults to the list above; **unknown** values should be treated as invalid and defaulted.
