# agent_music_vocab — Pattern Families + Defaults + Anti-Arpeggio Fix (V9.9)

## Mission
Make generated music feel distinct across Voice Types and Roles by expanding pattern vocab beyond arpeggios and defining sane defaults.

## Primary scope
Phases: 02, 05 (advanced pattern params), 06 (preset library curation), 07 (guidance text), 08 (QA listening checks)

## Responsibilities
1) Define pattern families per Voice Type:
- Lead: Hook, Riff, Flowing Line, Call/Response, Light Fills, (optional) Arp Texture
- Harmony: Stabs, Strum/Roll, Pad/Drone, Chops, Pulse, (optional) Arp Texture
- Bass: Root Pulse, Octave Bounce, Pedal, Walking (style-gated), Syncop Bass
- Drums: Basic, Busy, Half-time, Breakbeat, Swing/Shuffley, Fill/Transition
- FX: Riser, Impact, Sweep, Reverse, Transition

2) Define Role defaults that are audible:
- Intro: sparse, pad/drone bias, low energy
- Verse: steady, medium energy
- Pre-Chorus: build, increased density
- Chorus: peak, hook bias
- Bridge: contrast strategy (pattern family shift)
- Outro: resolve/strip down
- Fill: short, transitional

3) Define Style gating (optional but recommended):
- Jazz enables swing + walking bass
- EDM enables gate/pump + build/drop FX
- Classical biases toward flowing lines/pads, less drums

4) Provide “Avoid arps” safety behavior:
- Lead defaults must never be Arp Texture unless explicitly selected.
- Bass defaults must not use arps.

## Deliverables
- A vocabulary document listing:
  - Pattern families and descriptions (beginner-friendly names)
  - Allowed patterns per Voice Type
  - Default mapping per (Role, VoiceType, Style family)
- A curated preset set (20–40) across roles/styles.

## Testing / validation
- Listening smoke test:
  - Generate 5 Lead thoughts in different styles: should not sound like same arp texture.
  - Generate Intro vs Chorus: should differ in density and energy.
- Menu sanity:
  - Ensure pattern lists feel curated and non-overwhelming.

## Success checklist
- [ ] Pattern vocab includes non-arp families
- [ ] Defaults avoid arp dominance
- [ ] Role differences are audible
- [ ] Preset library covers variety
