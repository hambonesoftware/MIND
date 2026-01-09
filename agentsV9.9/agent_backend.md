# agent_backend — Deterministic Compile + Persistence + Migration (V9.9)

## Mission
Implement deterministic compilation based on versioned Preset Code and support persistence/migration.

## Primary scope
Phases: 04 (core), 03 (encode/decode placement if backend-owned), 05 (schema migration), 06 (project migration), 08 (backend QA)

## Core requirements
### Deterministic compile
- Input: canonical Preset Code + generatorVersion
- Output: compiledArtifact (notes/events) stored on Thought or cache
- Must be deterministic: same code+GV => identical artifact

### Dirty tracking
- Store:
  - presetCode (current desired settings)
  - compiledPresetCode (last compiled)
  - compiledArtifact (last compiled result)
- Dirty = presetCode != compiledPresetCode

### Versioning
- presetSchemaVersion (PS1/PS2…)
- generatorVersion (GV1/GV2…)
- Output changes require GV bump.

### Reroll semantics
- Preset Code contains reroll field.
- Changing reroll alters output while keeping other settings constant.

## Migration
- Existing thoughts without Preset Code must be mapped to nearest PS schema.
- Migration must stamp a generatorVersion and set compiled state appropriately (either compile on load or mark dirty).

## API expectations (conceptual)
- compileThought(presetCode, generatorVersion) -> compiledArtifact
- validatePresetCode(code) -> (ok, errors, normalizedCode)
- migratePresetCode(code, fromPS, toPS) -> normalizedCode

## Testing you must run
- Unit tests:
  - Determinism: compile(code) == compile(code)
  - Reroll: compile(code with reroll=a) != compile(code with reroll=b)
  - Migration: PS1 code -> PS2 code -> compile succeeds
- Integration tests:
  - Change settings → compile → playback uses compiled artifact

## Success checklist
- [ ] Deterministic compile implemented and tested
- [ ] Dirty state tracked via compiledPresetCode
- [ ] Version bump rules enforced (GV)
- [ ] Migration from legacy thoughts works without breakage
