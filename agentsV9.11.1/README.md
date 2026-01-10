# agentsV9.11.1 — Execution Pack for planV9.11.1

This agents pack is designed to execute **planV9.11.1** against **MindV9.10**.

Core principles:
- **Contracts are authoritative** (docs/contracts/*.contract.v1.json)
- **Immutables are the only source of canonical key strings**
- **Minimal instructions, exact outcomes**: copy templates, then wire/verify
- **No new mega-files**: split UI/audio/inspector into modules early

## How to use
1) Read `RUNBOOK_Codex.md`
2) Execute phases in order: Phase00 → Phase08
3) For each phase, use:
   - `Orchestrator_PhaseXX.md` (the driver)
   - Specialized agent notes for tricky areas (UI, Resolver, Audio, Protocol)
4) Do not proceed to the next phase until the current phase tests pass.

## Repo assumptions
- Repo root contains `frontend/`, `backend/`, `scripts/`, `docs/`
- App can be run the same way it runs today; this pack does not redefine runtime commands.
