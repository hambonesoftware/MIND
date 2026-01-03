# PHASE 00 — Baseline Audit of MINDV8.0 (Before Changes)

Agent: `AGENT_V9_PHASE00_BASELINE_AUDIT` (assumed to exist in agentsV9.0.zip)

## Objective
Establish a reproducible baseline so V9 work can be validated against known-good V8 behavior (boot, audio init, canvas render).

## What to capture
1. Boot + load
- Confirm `python run.py` starts without errors
- Confirm frontend loads at `/`
- Confirm dev console shows audio engine init + SoundFont load

2. Identify the V8 flow editor mechanics
- Canvas + nodes + edges: `frontend/src/ui/flowCanvas.js`
- Node registry: `frontend/src/state/nodeRegistry.js`
- Persistence: `frontend/src/state/flowGraph.js`, `graphStore.js`
- Transport compile loop: `frontend/src/audio/transport.js`
- Backend compile endpoint: `backend/mind_api/routes.py`
- Compiler behavior: `backend/mind_api/mind_core/compiler.py` (note cycle detection)

3. Record baseline artifacts
- A short text log of startup output
- A screenshot of the V8 canvas with a small graph loaded
- Note any existing demo graphs/assets

## Files to change
None in this phase.

## Completion checklist
- [ ] App boots via `python run.py`
- [ ] Frontend loads without blank screen
- [ ] Audio engine initializes (no fallback unless expected)
- [ ] Baseline screenshots + startup notes captured in `docs/baseline_v8/`

## Required tests
- [ ] Manual baseline only

