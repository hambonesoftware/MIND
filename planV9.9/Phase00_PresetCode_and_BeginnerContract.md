# Phase 00 — Define Beginner Knobs + Versioned Preset Code Spec

## Owner agents
Primary: agent_orchestrator, agent_music_vocab, agent_docs  
Support: agent_frontend, agent_backend, agent_qa

## Objective
Freeze the public contract:
1) Beginner knobs (names + allowed choices + defaults)  
2) Preset Code format (reversible settings ⇄ code) with schema + generator versioning

---

## Beginner knobs (contract PS1)

### Knobs (keep ≤10 in Beginner; Register can be “compact row”)
1. Role: Intro, Verse, Pre-Chorus, Chorus, Bridge, Outro, Fill/Transition
2. Voice Type: Auto, Lead, Harmony, Bass, Drums, FX/Transitions
3. Style: Pop, Hip-Hop, Electronic, Lo-Fi, Rock, Jazz, Classical, Cinematic, World, Experimental
4. Instrument: curated per Voice Type (Phase 02)
5. Pattern: curated per Voice Type (Phase 02)
6. Mood: Bright, Warm, Dreamy, Dark, Mysterious, Tense, Epic, Playful
7. Energy: Low, Medium, High, Peak
8. Complexity: Simple, Normal, Rich
9. Variation: Same, Similar, Fresh, Wild
10. Length: 2, 4, 8, 16 bars
11. Register (optional in Beginner compact row): Low, Mid, High

Decision for PS1: include Register in Beginner as a compact control (or move to Advanced).

---

## Preset Code requirements (PS1)

### Must be:
- Reversible: decode(encode(settings)) == canonical(settings)
- Versioned:
  - presetSchemaVersion (PS1)
  - generatorVersion (GV1)
- Canonical ordering of fields
- Forward-compatible:
  - unknown fields ignored
  - missing fields defaulted
- Human pasteable/copyable
- Determinism-friendly for compilation

### Recommended format (Format A: KV string)
Example:
MIND|PS1|GV1|role=chorus;voice=lead;style=pop;inst=synth_lead;pat=hook;mood=dreamy;energy=high;complexity=normal;variation=fresh;len=8;reg=mid;reroll=3

Notes:
- Fields must serialize in canonical order.
- Values must be enums from the contract.
- Include reroll (see below).

### Reroll behavior (required)
Include `reroll` so users can vary output without changing settings.
Rules:
- Changing knobs updates code fields (thus output)
- Pressing Reroll changes only `reroll`
- Same full code (including reroll) must reproduce identical output (within same GV)

---

## Deliverables
Create/update:
- docs/preset_code_spec.md (field list, ordering, validation, examples, migration)
- docs/beginner_knobs_spec.md (knobs, choices, defaults, meanings)

---

## Testing (Phase 00)
Paper/spec tests:
- 10 example codes decode unambiguously
- missing fields default correctly
- unknown fields ignored
- determinism policy documented (same code+GV => same artifact)

---

## Success checklist
- [ ] Beginner knobs + allowed choices frozen for PS1
- [ ] Preset Code format chosen and documented
- [ ] Canonical ordering + defaults documented
- [ ] Reroll field behavior documented
- [ ] Generator version bump policy documented
