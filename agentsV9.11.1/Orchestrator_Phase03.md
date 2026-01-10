# Orchestrator — Phase 03: Resolver Role/Motion + Non-Arp Defaults + Variety Test

## Read first
- Plan file: `planV9.11.1/Phase03_Resolver_RoleMotion_NonArp.md`

## Execution steps (minimal, exact)
1) Open the plan file and execute the **Changes** section top-to-bottom.
2) Copy templates exactly where instructed (no edits unless the plan requires).
3) Implement code deltas with small, separable commits if needed.
4) Run the required tests below **verbatim**.
5) Validate the success checklist (must be all ✅).
6) Commit: `v9.11.1 Phase03: Resolver Role/Motion + Non-Arp Defaults + Variety Test`

## Required tests (must pass)
- `node scripts/test_pattern_variety_role_motion.mjs`
- `node scripts/test_style_resolver.mjs`
- `cd backend && python -m pytest -q`

## Success checklist
- ☐ Role+Motion change notePatternId meaningfully
- ☐ Bass/Harmony not dominated by arp families
- ☐ Variety test passes

## Notes / common failure modes
- If any test fails, do not proceed. Fix and re-run.
- Keep new UI/audio code modular to avoid Phase08 file-length surprises.
