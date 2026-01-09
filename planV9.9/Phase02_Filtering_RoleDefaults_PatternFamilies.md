# Phase 02 — Voice Type + Role Filtering & Defaults (Reduce Arpeggio Dominance)

## Owner agents
Primary: agent_music_vocab, agent_frontend  
Support: agent_backend, agent_qa, agent_orchestrator

## Objective
Make beginner choices produce distinctly different results:
- Voice Type gates Pattern and Instrument choices
- Role sets meaningful defaults (Intro sparse, Chorus peak, Bridge contrast)
- Lead/Bass/Drums do not default into arpeggio textures

---

## Pattern families (v1 minimum)

### Lead
- Hook, Riff, Flowing Line, Call/Response, Runs/Fills (light), Arp Texture (optional)

### Harmony
- Stabs/Comping, Strum/Roll, Pad/Drone, Chops, Pulse, Arp Texture (optional)

### Bass
- Root Pulse, Octave Bounce, Pedal Tone, Walking (style-gated), Syncop Bass

### Drums
- Basic Groove, Busy Groove, Half-time, Breakbeat, Swing/Shuffley, Fill/Transition

### FX
- Riser, Impact, Noise Sweep, Reverse, Transition Fill

---

## Filtering rules
- Voice Type strictly filters Instrument + Pattern menus
- Style may additionally gate (e.g., Swing only in Jazz; Walking bass Jazz/Cinematic)
- If a selection becomes invalid after a change, auto-pick a valid default

---

## Role-based defaults (examples)
- Intro: Energy Low, Variation Similar, Harmony->Pad/Drone bias, Drums->light
- Verse: Energy Medium, Variation Similar
- Pre-Chorus: Energy Medium→High, Variation Fresh, more motion
- Chorus: Energy High/Peak, Lead->Hook bias, Drums->full groove
- Bridge: Variation Fresh/Wild, enforced contrast (pattern family shift)
- Outro: Energy Low, stable resolve
- Fill/Transition: Length 2 bars, Pattern Fill/Transition

---

## Testing (Phase 02)
- Switching Voice Type updates allowed lists immediately
- New Lead thoughts default to Hook/Riff/Flowing (not Arp Texture)
- Chorus defaults produce higher energy than Intro/Verse
- Invalid prior selections are safely replaced

---

## Success checklist
- [ ] Voice Type gates patterns and instruments
- [ ] Role defaults are audible and sensible
- [ ] Arpeggio no longer dominates Lead/Bass defaults
