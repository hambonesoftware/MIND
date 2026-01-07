# agentsV9.8 — Matching Agents for planV9.8

These agent briefs are designed for ChatGPT Codex (agent mode) to execute **planV9.8** with minimal risk.

## How to use
1) Unzip `planV9.8.zip` and `agentsV9.8.zip` into the repo (or keep external and reference paths).
2) Run the Orchestrator agent first.
3) The Orchestrator delegates to phase agents (Phase 0 → Phase 3), collecting outputs and ensuring checklists pass.

## Repo assumptions
- You are in a local clone of the MIND repo.
- Frontend is under `frontend/`.
- Commands use npm (adjust if your repo uses pnpm/yarn).

## Deliverable expectation
- One coherent patch/PR implementing joined params + progressive disclosure UI
- Backward compatibility preserved for v9.7 thoughts
