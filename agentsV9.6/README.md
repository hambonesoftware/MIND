# agentsV9.6 — Agent Prompts for Thought “Style + Seed + Auto Options” Inspector Reorg

Date: 2026-01-05

These agents are referenced by `planV9.6.zip` and are written as if they already exist and can be invoked by an orchestrator.

## Agents included
- Agent_Frontend_StyleCatalogResolver
- Agent_Frontend_ThoughtInspectorReorg
- Agent_Frontend_ThoughtMigrations
- Agent_QA_TestMatrixAndRegression
- Agent_Backend_RuntimeCompatibility

## Shared constraints (all agents)
1. **No backend semantic changes** in V9.6. Frontend resolver writes into existing V9.5 fields.
2. **Determinism required**: same (styleId, seed, overrides/locks, nodeId) => same resolved params.
3. **No surprise changes**: existing graphs must not change unless the user enables Auto options.
4. **Do not delete legacy controls**: keep “Advanced” section with raw fields.
5. Every phase ends with:
   - `cd backend && pytest -q` passing
   - phase-specific tests passing
   - success checklist completed

## Communication format
When reporting progress, each agent must produce:
- Summary (what changed)
- Files changed/added (explicit list)
- Commands run + results (copy output or summarize failures)
- Checklist status (checkboxes)
- Next actions / blockers (if any)

## Orchestrator usage
The orchestrator should run phases 0→6. Each phase has a primary agent and supporting agents.
