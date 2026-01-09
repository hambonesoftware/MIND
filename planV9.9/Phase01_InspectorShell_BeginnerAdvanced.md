# Phase 01 — Thought Inspector Shell (Beginner + Advanced) + Preset Code + Rebuild UX

## Owner agents
Primary: agent_frontend  
Support: agent_orchestrator, agent_docs, agent_qa

## Objective
Implement the new inspector interaction shell:
- Beginner mode (default)
- Advanced mode (collapsed placeholders)
- Preset Code field (copy/paste)
- Dirty status + Rebuild button

No deep compile logic yet; just the UX structure.

---

## UI requirements

### Top row (always visible)
- Preset Code text field (editable)
  - Copy button
  - Paste supported
  - Inline error display (placeholder ok)
- Status indicator: ✅ Up to date / ⚠️ Needs rebuild
- Rebuild button (can call stub compile in this phase)

### Beginner panel layout
- Identity: Role, Voice Type
- Sound: Style, Instrument
- Motion: Pattern
- Feel: Mood, Energy, Complexity, Variation
- Size row: Length (+ Register if kept)

### Advanced panel
- Toggle expands/collapses
- Placeholder sections for Phase 05:
  - Advanced Style / Voice / Pattern / Feel / Variation / Timing

---

## Testing (Phase 01)
- Beginner renders and is usable
- Advanced toggle works
- Changing any knob sets ⚠️ Needs rebuild
- Clicking Rebuild sets ✅ Up to date (even if stub)
- Preset Code field supports copy/paste interaction

---

## Success checklist
- [ ] Beginner is default view and compact
- [ ] Preset Code + status + Rebuild present
- [ ] Dirty indicator works
- [ ] Advanced shell present (placeholders ready)
