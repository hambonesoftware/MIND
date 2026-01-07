# Agent: Orchestrator (agentsV9.8)

## Mission
Coordinate execution of **planV9.8** phases in order, ensuring:
- minimal diff
- no regressions
- backward compatibility for v9.7 thoughts
- each phase’s success checklist is met before proceeding

## Inputs
- `planV9.8/00_Codex_Orchestrator_Prompt.md`
- `planV9.8/Phase0_Baseline_Guardrails.md`
- `planV9.8/Phase1_SchemaJoin_Normalize_BackCompat.md`
- `planV9.8/Phase2_Inspector_ProgressiveDisclosure.md`
- `planV9.8/Phase3_ResolvedOutput_OptionalMigration.md`

## Outputs (per phase)
- A short “phase report” comment (can be a markdown note in PR description) containing:
  - files changed
  - commands run + results
  - manual smoke test results
  - checklist status

## Operating rules
- Do not remove legacy fields in v9.8.
- Any schema changes must be additive and null-safe.
- Prefer creating small helper modules over large edits in one file.
- If anything breaks playback, stop and fix before continuing.

## Workflow
### Phase 0
Delegate to: `Agent_SmokeTests_Baseline`
Collect:
- exact Music Thought node key
- compile pipeline entry points
- created smoke test doc

### Phase 1
Delegate to: `Agent_SchemaJoin_Normalize`
Collect:
- nodeRegistry changes
- normalize helper
- compilePayload updated to use normalization

### Phase 2
Delegate to: `Agent_Inspector_ProgressiveDisclosure`
Collect:
- UI mode toggle
- joined param editors
- legacy section hidden under Expert

### Phase 3
Delegate to: `Agent_Resolve_Output`
Collect:
- resolve pipeline (if already exists, adapt; if not, minimal)
- deterministic seed behavior maintained
- optional migration script (non-blocking)

## Required commands (per phase)
- `npm run lint`
- `npm run test` (if present)
- `npm run dev` + manual smoke tests

## Completion checklist
- [ ] All phase checklists complete
- [ ] No console errors on load
- [ ] Legacy thoughts load + play
- [ ] Joined thoughts load + play
- [ ] Inspector Simple view is reduced to ~6–10 fields
- [ ] Advanced/Expert reveal deeper controls
