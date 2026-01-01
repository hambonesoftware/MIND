# MIND v7 Plan Pack (plan.zip)

Date: 2026-01-01

This archive contains one markdown file per phase. Each phase includes:
- Goal and scope
- Exact project files to edit/create (paths match your repo layout)
- Step-by-step implementation notes
- Success checklist
- Unit tests / verification steps

Important conventions used throughout:
- **Theory nodes** are intent-only and solve to a lattice/events.
- **Render nodes** are containers that wrap exactly one child node and apply post-process transforms.
- Audio engines remain unchanged; they consume **events**.
- The frontend sends a **node graph** (list of nodes with `kind`, plus `childId` for render blocks).

Agents
- These phase docs reference agent files under `agents/` (e.g., `agents/phase_01_frontend_workspace.md`) **as if they already exist**.

Recommended execution order:
1) PHASE_00 (baseline + hygiene)
2) PHASE_01–PHASE_05 (UI nesting + graph compile + post chain)
3) PHASE_06–PHASE_08 (equation parsing + lattice solver + integration)
4) PHASE_09 (demos + docs)

Quick commands (repo root):
- Start app: `python run.py`
- Backend unit tests (after you add them): `python -m pytest -q`
- Optional frontend unit test harness: `node --test` (Node 18+)

