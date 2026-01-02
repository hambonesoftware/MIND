# Agent Interfaces and Expected Artifacts

This file defines the artifacts each agent must produce so the manager can verify completion.

## Shared conventions
- Use deterministic behavior for variation (seeded by stable identifiers such as piece id, bar index, phrase index).
- Add unit tests for any parsing or algorithmic behavior that can regress.
- Prefer small, readable, inline fixtures for tests.

## Artifact locations
All artifacts live in-repo under:
- `backend/mind_api/mind_core/reporting/` for report/baseline logs
- `backend/tests/` (or existing test location) for unit tests
- `docs/` for documentation

## Required artifacts by phase

### Phase 00 baseline artifacts
- `backend/mind_api/mind_core/reporting/_baseline_moonlight_v7_1.txt`
- `backend/mind_api/mind_core/reporting/_baseline_moonlight_v7_1.json` (the JSON report output)

### Phase 01 parser timing artifacts
- Unit tests covering `<backup>`, `<forward>`, `<chord/>`
- Optional diagnostic helper or test assertion ensuring normalized onsets do not explode beyond the bar

### Phase 02 tie artifacts
- Unit tests covering tie merging
- Parser output demonstrates tie chains merged into one event with longer duration

### Phase 03 sustain artifacts
- Unit tests showing durations > 1 are supported end-to-end (compile -> playback scheduling)
- Example script or dev command that demonstrates held chord tones

### Phase 04 elements artifacts
- New modules under a stable path (proposed: `backend/mind_api/mind_core/music_elements/`)
- Unit tests showing deterministic variation + phrase shaping + sustain policies

### Phase 05 moonlight demo artifacts
- New or updated example text file (proposed: `docs/examples/moonlight_v7_3.txt`)
- `backend/mind_api/mind_core/reporting/_moonlight_after_elements_v7_3.txt`
- `backend/mind_api/mind_core/reporting/_moonlight_after_elements_v7_3.json`

### Phase 06 reporting artifacts
- Report gains optional “sounding state” compare mode
- Tests covering the mode on small fixtures

### Phase 07 docs artifacts
- `docs/music_elements.md`
- `docs/examples/texture_quickstart_v7_3.txt`

### Phase 08 release artifacts
- `mindv7.3.zip` created at repo root or output folder per your packaging convention
- `backend/mind_api/mind_core/reporting/_final_moonlight_v7_3_metrics.txt`
