# Phase 04 — Deterministic Compile + Rebuild Loop (Compiled Artifact)

## Owner agents
Primary: agent_backend, agent_frontend  
Support: agent_qa, agent_orchestrator, agent_docs

## Objective
Make “what you hear” match the compiled artifact for the current code.
- Thought stores presetCode + compiledArtifact + compiledPresetCode
- Rebuild compiles deterministically from presetCode + generatorVersion (+ reroll)

---

## Determinism rules
- Deterministic RNG seed derived from canonical presetCode + generatorVersion
- Same (code, GV) => identical artifact
- Behavior changes => bump GV

---

## Rebuild UX
- knob change => ⚠️ Needs rebuild
- Rebuild:
  - compile presetCode
  - store artifact
  - set compiledPresetCode = presetCode
  - ✅ Up to date
Optional: auto-rebuild toggle (debounced)

---

## Testing
- compile(code) twice => identical artifact
- reroll change => different artifact (expected)
- UI: change -> dirty; rebuild -> playback updates + clears dirty

---

## Success checklist
- [ ] Deterministic compile works and is tested
- [ ] Rebuild updates playback artifact reliably
- [ ] Dirty status reflects compiled vs current code
