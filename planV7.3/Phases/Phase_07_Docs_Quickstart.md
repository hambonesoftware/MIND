# Phase 07 — Documentation + Quickstart Examples

Agent: `agents/07_docs_quickstart.md`  
Goal: Provide clear docs for building reusable theory-based musical parts (textures, phrases, harmony).

## Scope
- Add a concise but practical doc:
  - `docs/music_elements.md`
- Add a small quickstart example (not Moonlight):
  - `docs/examples/texture_quickstart_v7_3.txt`
- Document deterministic variation rules and sustain policies.

## Required doc sections
1. Overview: why musical elements (not transcription)
2. HarmonyPlan: chord changes, pedal, cadence markers
3. TextureRecipe: pattern family, register policy, sustain policy, accent policy
4. PhrasePlan: density/register/dynamics curves
5. Deterministic variation: recommended seeding and safe variation families
6. Example: a 4–8 bar piece built from elements
7. How to add a new texture safely (testing + determinism checklist)

## Gates
- [ ] Docs exist and are readable.
- [ ] Quickstart example runs through the standard pipeline (compile/play/report) without errors.
- [ ] No contradictions with implemented APIs.
