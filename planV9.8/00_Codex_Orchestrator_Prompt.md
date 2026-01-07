# Codex Orchestrator Prompt (planV9.8)

You are ChatGPT Codex working in a local clone of the MIND repo.

## Rules
- Implement phases in order: **Phase 0 → Phase 3**
- After each phase:
  1) Run required tests/commands from that phase
  2) Fix failures
  3) Confirm the phase success checklist items are met
- Keep changes minimal and reversible.
- Maintain **backward compatibility** with v9.7 nodes:
  - legacy keys must still load in UI
  - legacy keys must still compile/play

## Deliverables
- One PR-ready patch with commits per phase (or clearly separated diffs)
- Update any relevant docs as instructed (minimal)
- No leftover debug logging

## Start Here
Open `frontend/src/state/nodeRegistry.js`, `frontend/src/ui/flowInspector.js`, and `frontend/src/state/compilePayload.js`.
Search for `thought` / `music` node types and confirm current paramSchema + inspector rendering.

Proceed to Phase 0.
