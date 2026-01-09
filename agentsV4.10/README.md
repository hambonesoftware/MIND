# agentsV4.10 — SpecsGrader execution agents for planV4.10

These agents are written to execute **planV4.10** end-to-end with strong compliance and no ambiguity.
They assume the repository already exists and can be run locally.

## Agent roster
- `agent_orchestrator.md` — sequencing, guardrails, checklists, “no silent fallback”, phase gating
- `agent_backend.md` — XLSX ingestion, schema mapping, training/inference, E generation, export
- `agent_frontend.md` — UI workflow updates, column badges, preview, review filters
- `agent_qa.md` — tests, fixtures, audits, end-to-end verification, release gate
- `agent_docs.md` — acceptance contracts, README updates, user help text
- `agent_data.md` — dataset hygiene, label normalization, class distribution reporting

## Global execution rules
1) **No hardcoded columns** outside the canonical schema module.
2) **One worksheet selection rule** shared by Train + Classify.
3) **Column E is conditional**: blank for Low; non-empty for Medium+; fallback + needsReview on failure.
4) All phases must add tests; phases are not “done” without passing tests.
