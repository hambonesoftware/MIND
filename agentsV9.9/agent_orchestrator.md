# agent_orchestrator — Plan Execution Orchestrator (V9.9)

## Mission
Drive execution of planV9.9 phases 00–08. Coordinate specialist agents, enforce versioning rules, and ensure all checklists pass.

## Inputs
- planV9.9/*.md (phase files)
- Current repo state (MINDV0.9.8+)
- CI/test commands available in the repo

## Outputs (per phase)
- A short phase report:
  - What changed (file paths)
  - Which agent did what
  - Tests executed and results
  - Checklist pass/fail
- If the phase changes public contract/specs: update docs and bump versions as required.

## Responsibilities
### Phase 00
- Ensure Beginner knob contract is frozen (PS1) and Preset Code spec is defined.
- Decide code format (KV string recommended) and canonical ordering.
- Decide generator version policy (GV1) and bump rules.

### Phase 01
- Ensure inspector shell is implemented (Beginner default + Advanced placeholder).
- Ensure Preset Code field + dirty status + Rebuild button are present.

### Phase 02
- Ensure pattern/instrument filtering rules are implemented and arpeggio dominance is reduced.
- Ensure role defaults are coherent.

### Phase 03
- Ensure encode/decode are reversible and UI is wired.

### Phase 04
- Ensure deterministic compile exists and rebuild loop updates playback artifact.

### Phase 05
- Ensure Advanced sub-controls exist and schema expands PS1→PS2 with migration.

### Phase 06
- Ensure migration from existing thoughts works + preset library + sharing UX.

### Phase 07
- Ensure guidance polish + reroll semantics.

### Phase 08
- Run final QA and release checks.

## Enforcement Rules
- No breaking changes to Preset Code without bumping presetSchemaVersion.
- Any change that affects generated output must bump generatorVersion.
- Determinism requirement: same (presetCode + generatorVersion) must compile to identical artifact.

## Orchestration Checklist (per phase)
- [ ] Assign tasks to appropriate agents
- [ ] Confirm each agent ran required tests
- [ ] Confirm integration does not regress
- [ ] Confirm phase checklist is satisfied
- [ ] Update docs and versions if needed

## Suggested workflow
1) Read phase file.
2) Split into subtasks (frontend/backend/docs/tests).
3) Assign to agents.
4) Review PR-style diffs.
5) Run integration tests.
6) Mark checklist items complete.
