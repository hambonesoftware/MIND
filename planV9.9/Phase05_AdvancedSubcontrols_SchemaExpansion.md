# Phase 05 — Advanced Sub-controls + Schema Expansion (PS2)

## Owner agents
Primary: agent_frontend, agent_music_vocab  
Support: agent_backend, agent_docs, agent_qa, agent_orchestrator

## Objective
Add Advanced mode sub-controls per Beginner knob.
Extend schema PS1 -> PS2 (recommended) with migration.

---

## Advanced sub-controls (high-level list)

### Style (Advanced)
- Subtype, Era/Flavor, Feel bias (straight/swing/shuffle), Avoid toggles (avoid arps/leaps/busy/chromatic)

### Voice (Advanced)
- Articulation, Tone, Humanization, Poly mode, Layering

### Pattern (Advanced)
- Rhythm mask, Density, Accents, Contour, Repetition

### Mood (Advanced)
- Tension, Brightness, Resolution tendency

### Energy (Advanced)
- Dynamics, Drive, Attack, Peak moments

### Complexity (Advanced)
- Harmony complexity, Melody movement, Rhythm complexity, Ornamentation

### Variation (Advanced)
- Strategy, Similarity target, Anti-repeat window, Seed mode

### Length/Register (Advanced)
- Phrase structure, Cadence placement, Range width, Range movement

---

## Schema changes
- Introduce PS2 with new fields + defaults
- Implement PS1 -> PS2 migration (fill defaults)

---

## Testing
- Advanced fields encode/decode
- Switching back to Beginner hides but does not discard advanced state
- PS1 codes load and migrate to PS2 canonical form

---

## Success checklist
- [ ] Advanced sections are functional
- [ ] PS2 round-trip + PS1 migration works
- [ ] Beginner remains simple
