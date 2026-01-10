# Orchestrator — Phase 01: Contracts + Immutables Foundation

## Read first
- Plan file: `planV9.11.1/Phase01_Contracts_Immutables_Foundation.md`

## Execution steps (minimal, exact)
1) Open the plan file and execute the **Changes** section top-to-bottom.
2) Copy templates exactly where instructed (no edits unless the plan requires).
3) Implement code deltas with small, separable commits if needed.
4) Run the required tests below **verbatim**.
5) Validate the success checklist (must be all ✅).
6) Commit: `v9.11.1 Phase01: Contracts + Immutables Foundation`

## Required tests (must pass)
- `node scripts/audit_contracts.mjs`
- `node scripts/audit_immutables.mjs`
- `node scripts/audit_no_placeholders.mjs`
- `MAX_LINES=5000 node scripts/audit_file_lengths.mjs`
- `node scripts/test_style_resolver.mjs`
- `cd backend && python -m pytest -q`

## Success checklist
- ☐ Contract JSON files copied into docs/contracts
- ☐ Frontend + backend immutables copied and match
- ☐ Contract + immutables audits pass

## Notes / common failure modes
- If any test fails, do not proceed. Fix and re-run.
- Keep new UI/audio code modular to avoid Phase08 file-length surprises.
