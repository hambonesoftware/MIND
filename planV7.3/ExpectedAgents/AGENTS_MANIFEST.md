# Expected Agents Manifest (Referenced by Plan)

These files are expected to exist in the **agents.zip** (created next).
The plan references them as if present at `agents/<name>.md`.

Each agent file should contain:
- A short role statement
- Strict scope boundaries (what it must and must not do)
- Step-by-step repo edit instructions
- Required commands to run locally
- Expected outputs/artifacts
- Completion checklist

## Agents

### agents/manager_orchestrator.md
Role: Orchestrate phases in order, enforce gates, collect before/after metrics, and stop on failures.

### agents/00_baseline_runner.md
Role: Run baseline tooling, capture outputs, write baseline artifact files exactly as specified in Phase 00.

### agents/01_mxl_timing_fix.md
Role: Implement `<backup>/<forward>/<chord/>` timing semantics in the MusicXML parser + add unit tests.

### agents/02_tie_merge.md
Role: Implement tie merging into sustained durations + add unit tests.

### agents/03_sustain_semantics.md
Role: Extend the compiled event representation + playback path to support durations > 1 and sustain policies.

### agents/04_music_elements_library.md
Role: Implement HarmonyPlan / TextureRecipe / PhrasePlan modules and a small deterministic texture engine + tests.

### agents/05_moonlight_demo_update.md
Role: Update Moonlight demo equation to use elements (not transcription) + record new report artifacts.

### agents/06_reporting_compare_upgrade.md
Role: Improve moonlight reporting comparisons with optional “sounding state” mode + tests.

### agents/07_docs_quickstart.md
Role: Add docs + a small quickstart example for musical elements and controlled variation.

### agents/08_release_packaging.md
Role: Final regression run + version bump + package mindv7.3.zip and record final metrics.
