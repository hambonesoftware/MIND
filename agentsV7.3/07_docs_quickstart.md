# Agent: Phase 07 — Docs + Quickstart Examples

Role
- Document the musical elements system and provide a small quickstart example.

Scope
- Documentation and small example only.
- No deep refactors.

Required files
- `docs/music_elements.md`
- `docs/examples/texture_quickstart_v7_3.txt`

Doc must cover
1) The three-layer concept:
   - HarmonyPlan (what)
   - TextureRecipe (how)
   - PhrasePlan (why / evolution)
2) Sustain semantics:
   - durations > 1
   - hold_until_change
   - pedal_hold
3) Deterministic variation:
   - stable seeds
   - pattern families
4) How to add a new texture:
   - testing checklist
   - determinism checklist

Quickstart example requirements
- 4–8 bars
- demonstrates:
  - pattern family variation
  - phrase density or register curve
  - at least one sustained tone layer
- Must compile/run via existing pipeline commands (document exact commands in the doc).

Gates
- [ ] Docs exist and are clear.
- [ ] Quickstart example runs without errors (compile/play/report step as appropriate).
