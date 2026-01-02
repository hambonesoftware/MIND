# MIND v7.3 — Musical Elements + Sustain + Correct MXL Timing (Plan)

This plan upgrades **MIND v7.1 → v7.3** to improve musical realism using reusable music-theory elements (not transcription),
and to make the Moonlight verification/reporting meaningful by fixing MusicXML timing parsing.

Key principles:
- **Not a literal transcription** of Moonlight (no note-for-note copying).
- **Reusable musical elements** (HarmonyPlan / TextureRecipe / PhrasePlan).
- **Sustain / sounding-state semantics** (durations > 1; pedal/hold behaviors).
- **Deterministic variation** (no unseeded randomness).
- **Test-gated, phase-by-phase** with recorded baselines.

## Starting point
- Repository: `mindv7.1` (current).
- Primary verification commands:
  - `PYTHONPATH=backend python backend/mind_api/mind_core/_dev_verify_moonlight.py --compare`
  - `PYTHONPATH=backend python -m mind_api.mind_core.reporting.moonlight_report --json`

## Deliverables
1. Parser correctness:
   - MusicXML parser handles `<backup>`, `<forward>`, and `<chord/>` correctly.
   - Tie chains merge into sustained durations.
2. Engine semantics:
   - Compiled events can represent **durations > 1** (hold/legato/pedal), not only 1-step retriggers.
3. Musical element library:
   - `HarmonyPlan`, `TextureRecipe`, `PhrasePlan` + a small texture engine to generate events.
4. Moonlight demo (still algorithmic, not transcription):
   - Uses a triplet broken-chord texture + sustain + phrase shaping + controlled variation.
   - Optional minimal top-voice layer driven by harmony rules (not copying notes).
5. Reporting improvements:
   - Optional comparison mode that compares **sounding state** (active pitches per step) as well as note-on events.
6. Documentation:
   - Developer docs for creating new textures and using elements.

## How to run this plan
Each phase file in `Phases/` contains:
- Goal and scope
- Agent to run (referencing the separate `agents.zip` you will create next)
- Exact steps and commands
- Outputs/artifacts created
- Unit tests and success gates

### Phase order
- Phase 00: Baseline snapshot
- Phase 01: Fix MusicXML timing `<backup>/<forward>/<chord/>`
- Phase 02: Tie merging (durations)
- Phase 03: Sustain / sounding-state event semantics
- Phase 04: Musical elements library (HarmonyPlan/TextureRecipe/PhrasePlan)
- Phase 05: Moonlight demo update to v7.3 elements (not transcription)
- Phase 06: Reporting comparison upgrades (sounding-state mode)
- Phase 07: Docs + quickstart examples
- Phase 08: Regression + release packaging (mindv7.3)

## Agents
This plan references agent prompt files **as if they already exist** under the following paths:

- `agents/00_baseline_runner.md`
- `agents/01_mxl_timing_fix.md`
- `agents/02_tie_merge.md`
- `agents/03_sustain_semantics.md`
- `agents/04_music_elements_library.md`
- `agents/05_moonlight_demo_update.md`
- `agents/06_reporting_compare_upgrade.md`
- `agents/07_docs_quickstart.md`
- `agents/08_release_packaging.md`
- `agents/manager_orchestrator.md`

See `ExpectedAgents/AGENTS_MANIFEST.md` for required scope and outputs per agent.

## Global gates (must hold for v7.3)
- All unit tests pass.
- Server starts: `python run.py` (or your project’s standard run command).
- Moonlight report outputs are recorded:
  - baseline file from Phase 00
  - post-upgrade file from Phase 05/08
- Output remains deterministic given the same inputs.
- No “note-for-note” transcription logic is introduced; Moonlight remains an algorithmic demo.
