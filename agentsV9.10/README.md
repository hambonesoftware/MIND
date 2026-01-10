# agentsV9.10 — Execution Agents for planV9.10

These agent briefs are designed to execute the phase files in `planV9.10/` exactly, with strict compliance:
- No placeholder truncation strings like `...` in authoritative catalogs/defaults.
- Pattern selection must be contract-driven and validated end-to-end.
- No silent fallback to generic arp texture except explicit ArpTexture patterns.

## How these agents are intended to be used
A coordinator (agent_orchestrator) runs phases in order:
- Phase00 → Phase01 → Phase02 → Phase03 → Phase04 → Phase05 → Phase06 → Phase07 → Phase08

Each phase has:
- Ownership (primary + support agents)
- Explicit file targets
- Commands/tests that must run and pass
- A success checklist that must be fully satisfied before moving on

## Hard rules
1) Do not introduce or leave literal `...` placeholders in:
   - `frontend/src/music/*.js`
   - `frontend/src/state/nodeRegistry.js`
   - `docs/contracts/*`
   - plan/agent docs
2) Do not “fix” missing IDs by inventing new ones silently.
   Use `frontend/src/music/catalogSnapshot.json` to recover canonical IDs where needed.
3) Do not implement “pattern labels” that map to `arp-3-up/down/skip` unless the pattern is explicitly ArpTexture in the contract.
4) Any unknown or invalid pattern id must fail fast with a structured error (backend) and a visible warning (frontend).

## Standard deliverables per phase
- Patch commits (or a patch zip) that includes all changed files
- Test outputs (terminal logs or summary)
- A short “Phase Report” bullet list referencing each success checklist item

## Required commands across phases
- `python -m pytest -q`
- `node scripts/test_style_catalog_coverage.mjs`
- `node scripts/test_style_resolver.mjs`
- `python scripts/audit_no_truncation.py`
- `python scripts/audit_pattern_contract.py`
- `python scripts/audit_arp_dominance.py`
