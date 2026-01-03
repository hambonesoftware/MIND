# PHASE 08 — Acceptance Demos (Moonlight + Loop + Join)

Agent: `AGENT_V9_PHASE08_ACCEPTANCE_DEMOS` (assumed to exist in agentsV9.0.zip)

## Objective
Create repeatable “acceptance graphs” shipped with the repo to prove V9 works.

## Demo 1 — Moonlight Opening (minimum)
Graph:
- Start → Thought: `Moonlight_Opening_Arp`
Optional loop:
- → Counter → Switch (Loop N times / Exit)

Thought requirements:
- Key: C# minor
- Pattern: Arpeggio, 3-step low→mid→high
- Rhythm: Triplet 1/12
- Instrument: Piano from sf2/sf3

## Demo 2 — Parallel fan-out
Graph:
- Start fan-out → ThoughtA + ThoughtB (parallel)
- Both end (no join) OR proceed to independent endings

## Demo 3 — Join barrier
Graph:
- Start fan-out → ThoughtA + ThoughtB
- Both → Join → ThoughtC

## Instructions
1. Create demo project(s) under a stable location (suggested):
   - `assets/demos/v9/` or `docs/demos/v9/`
2. Ensure demos are loadable from UI:
   - add a “Load Demo” menu item or auto-list demo JSON files
3. Ensure each demo includes:
   - short description
   - expected behavior
   - success criteria

## Files to change/create
- CREATE: demo graph JSON files (location chosen above)
- CHANGE: frontend demo loader UI (where appropriate)

## Completion checklist
- [ ] All demos load without errors
- [ ] Moonlight arp plays and sounds stable
- [ ] Loop demo loops deterministically and exits correctly
- [ ] Join demo waits for both branches before continuing
- [ ] Demos remain compatible with future minor versions (avoid brittle fields)

## Required tests
- [ ] Start server: `python run.py`
- [ ] Load and run each demo; confirm audible output and correct control flow
- [ ] Capture a screenshot (manual is fine) showing the demo graph on canvas

