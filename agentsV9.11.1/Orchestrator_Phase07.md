# Orchestrator — Phase 07: Protocol Export/Import + Schema

## Read first
- Plan file: `planV9.11.1/Phase07_MINDProtocol_ExportImport_Schema.md`

## Execution steps (minimal, exact)
1) Open the plan file and execute the **Changes** section top-to-bottom.
2) Copy templates exactly where instructed (no edits unless the plan requires).
3) Implement code deltas with small, separable commits if needed.
4) Run the required tests below **verbatim**.
5) Validate the success checklist (must be all ✅).
6) Commit: `v9.11.1 Phase07: Protocol Export/Import + Schema`

## Required tests (must pass)
- `cd backend && python -m pytest -q`

## Success checklist
- ☐ Protocol root keys included on export
- ☐ Schema + examples exist
- ☐ Round-trip test passes

## Notes / common failure modes
- If any test fails, do not proceed. Fix and re-run.
- Keep new UI/audio code modular to avoid Phase08 file-length surprises.
