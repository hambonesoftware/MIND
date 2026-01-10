# agent_docs — Contracts, Debugging Guides, and Contributor Docs (V9.10)

## Mission
Make V9.10 understandable and maintainable:
- document the pattern contract
- document the resolver and routing
- document how to debug mismatches
- ensure plan + agent docs contain no placeholders and match repo reality

## Primary phases
- Phase01 (contract doc)
- Phase07 (debugging/teaching docs)
- Phase08 (release notes)

## Deliverables

### Contract docs
- `docs/contracts/pattern_contract.v1.md`
  - Explain schema fields
  - Explain alias policy
  - Explain arp fallback policy and enforcement

### Debugging guide (Phase07)
Create:
- `docs/v9.10/pattern_wiring_and_debugging.md`
Include:
- how `pat` / `notePatternId` flows from UI -> compile payload -> backend routing
- where selection occurs (`frontend/src/music/styleResolver.js`)
- where enforcement occurs (`backend/mind_api/mind_core/stream_runtime.py`)
- how to run audits and interpret errors

### Phase reports
Work with agent_orchestrator:
- Ensure per-phase reports are written and linked from `docs/v9.10/index.md`

### Release notes (Phase08)
Create/Update:
- `docs/v9.10/release_notes.md`
Include:
- high-level changes
- test gates run
- known limitations (if any)

## Hard rules
- No `...` placeholders in docs/contracts or v9.10 docs.
- Any mention of file paths must match the repo paths exactly.
- Any rules described in docs must match enforcement in code (especially “no silent fallback”).

## Deliverable checklist
- [ ] Contract doc complete and accurate
- [ ] Debugging guide actionable and path-correct
- [ ] Phase reports and release notes exist
- [ ] Docs match code behavior
