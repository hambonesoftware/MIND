# agentsV9.0 (MIND V8.0 → V9.0) — Agent Playbooks

Date generated: 2026-01-03

These playbooks are designed for **ChatGPT Codex / agent mode** to execute against the current codebase **MINDV8.0** and deliver **MINDV9.0**.

## Relationship to planV9.0.zip
- This agents pack mirrors the phases in `planV9.0.zip`.
- Each agent phase references its matching plan file and assumes those plan files exist.

## Operating principles (non-negotiable)
- **No semantic drift:** V9 semantics are defined in the plan and must be implemented exactly.
- **No “magic” global state:** Stream execution must be driven by explicit state (graph + runtime state), and remain debuggable.
- **One master transport per Stream:** Thoughts never own transport.
- **Merges are OR by default. AND is explicit Join.**
- **Loops are allowed. No cycle compilation errors in V9.**
- **Musical Thoughts must include an Instrument preset from sf2/sf3.**
- **Add a Rivulet Lab Preview UI** docked above the Stream canvas.

## How to run phases
Execute phases in order. Each phase playbook contains:
- Setup and commands
- Required file touch-points (based on MINDV8.0 structure)
- Verification checklist (must pass)
- Artifacts to produce (logs, screenshots, zips)

## Expected repo structure (MINDV8.0 baseline)
Top level:
- `run.py`
- `backend/`
- `frontend/`
- `assets/` (soundfonts, vendor spessasynth)
Key files referenced by phases:
- Backend: `backend/mind_api/mind_core/compiler.py` (V8 compiler)
- Frontend UI: `frontend/src/ui/flowCanvas.js`, `flowInspector.js`, `flowPalette.js`, `executionsPanel.js`
- Frontend transport: `frontend/src/audio/transport.js`
- Spessa engine: `frontend/src/audio/spessa/*`
- App entry: `frontend/src/main.js`, `frontend/src/ui/app.js`

## Deliverables
- End state: `mindV9.0.zip` (or equivalent tagged build)
- Phase artifacts as requested (console logs, debug traces, screenshots, test output)

---

Start with: `phases/AGENT_PHASE_00_BASELINE_AUDIT.md`
