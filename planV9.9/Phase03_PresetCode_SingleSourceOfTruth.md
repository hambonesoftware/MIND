# Phase 03 — Preset Code as Single Source of Truth (Encode/Decode + UI Wiring)

## Owner agents
Primary: agent_frontend, agent_docs  
Support: agent_backend, agent_qa, agent_orchestrator

## Objective
Preset Code becomes real:
- Knob changes update Preset Code immediately (canonical)
- Pasting Preset Code restores knobs exactly
- Encode/decode is reversible (PS1) and versioned (GV1)

---

## Requirements
- Implement encodePreset(settings) -> code
- Implement decodePreset(code) -> settings
- Canonical ordering, defaulting, unknown-field ignore
- Validation: invalid code shows error and does not corrupt state

---

## UI behavior
- Knob change -> settings update -> code re-encodes -> dirty status updates
- Code edit:
  - on Enter/blur, attempt decode
  - if success: apply settings + mark dirty
  - if fail: keep prior settings + show error
- Copy copies canonical code (not invalid user-typed)

---

## Testing
Unit:
- decode(encode(x)) == canonical(x)
- ordering differences decode to same canonical encode
- missing fields default correctly
- unknown fields ignored
UI:
- paste valid code -> knobs snap
- change knob -> code changes
- invalid code -> error; knobs unchanged

---

## Success checklist
- [ ] Preset Code round-trips for all Beginner fields
- [ ] UI always displays canonical code
- [ ] Paste restores exact knob state
- [ ] Invalid codes handled safely
