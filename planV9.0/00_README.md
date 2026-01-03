# planV9.0 — MINDV8.0 → MINDV9.0 Upgrade Plan

Date: 2026-01-03

This zip contains a phase-by-phase plan to upgrade **MINDV8.0** (current repo state in `MINDV8.0.zip`) into **MINDV9.0** as defined in our latest architecture decisions:

- **Stream = the desktop flow surface (canvas) + playback runtime + scheduler**
- **Thought = musical pattern object** (pattern + key/chord context + rhythm + syncopation + timing warp + register + duration + **SoundFont instrument**)  
- **Logic Thoughts**: Start / Counter / Switch / Join (Barrier)
- **Fan-out** = parallel activation
- **Merge** = OR by default
- **AND** = explicit Join/Barrier node
- Loops are allowed and are expressed with edges + Switch conditions (often driven by Counter)
- A small **Lab Preview “Rivulet”** lives above the Stream canvas for auditioning a Thought before “publishing” it

## How to use this plan

Each file `phases/PHASE_XX_*.md` includes:
- Objective + scope
- Files to change/create (grounded in the current MINDV8.0 tree)
- Step-by-step implementation instructions (no code)
- Completion checklist
- Required tests

### Assumption about agents
This plan is written **as if** `agentsV9.0.zip` already exists and provides one agent per phase (plus a coordinator).
Where you see “Agent: …”, that refers to the corresponding agent playbook that will be delivered in `agentsV9.0.zip`.

## Baseline command to run the app
From the project root:

- `python run.py`  (FastAPI serves frontend + assets)

## Phase order
Follow phases in numeric order. Do not start later phases until the previous phase checklists and tests pass.

See:
- `CHECKLIST_MASTER.md`
- `GLOSSARY.md`
- `phases/`

