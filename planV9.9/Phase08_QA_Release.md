# Phase 08 — QA Hardening + Release Checklist

## Owner agents
Primary: agent_qa, agent_orchestrator  
Support: agent_frontend, agent_backend, agent_docs

## Objective
Stabilize and ship with strong regression coverage.

---

## Required tests
1) Unit:
- preset encode/decode round-trip
- PS1->PS2 migration
- determinism: compile same code twice => identical artifact

2) Integration:
- knob change -> code update -> rebuild -> audible change
- paste code -> rebuild -> reproduces output

3) UI:
- beginner compact + advanced expands
- invalid code errors safe

4) Performance:
- repeated rebuilds do not lag UI
- compile time acceptable

---

## Release checklist
- [ ] docs complete (preset spec, beginner knobs, sharing)
- [ ] preset library curated
- [ ] generator version policy documented
- [ ] defaults no longer “arp-dominant” for Lead/Bass
- [ ] all tests green
