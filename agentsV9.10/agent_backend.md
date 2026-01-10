# agent_backend — Compile Enforcement and Generator Routing (V9.10)

## Mission
Enforce that a pattern id selected in the UI maps to a real generator, and prevent silent fallback to arp texture.

## Primary phases
- Phase03 (core backend routing and enforcement)
- Phase05 (regression tests + audits integration support)
- Phase06 (compile checks for preset library support)

## Files you will change (expected)
- `backend/mind_api/routes.py`
- `backend/mind_api/models.py`
- `backend/mind_api/mind_core/compiler.py`
- `backend/mind_api/mind_core/stream_runtime.py`
- `backend/mind_api/mind_core/music_elements/texture_engine.py`
- (optional) `backend/mind_api/mind_core/determinism.py`

Tests:
- `backend/tests/test_pattern_contract_enforcement.py` (new)
- Existing: `backend/tests/test_style_patterns_realness.py` (ensure still passes)

## Hard requirements
1) Unknown `notePatternId` must fail fast with a structured compile error.
2) If contract entry has `allowArpTextureFallback=false`, backend must never route it to generic arp texture.
3) Only explicit ArpTexture patterns may route to generic arp texture.
4) Provide an explicit routing table for `notePatternId` -> generator function.

## Implementation steps (Phase03)
- Decide where to load the pattern contract:
  - Option A: load `docs/contracts/pattern_contract.v1.json` at startup and cache
  - Option B: generate a python module at build-time (less preferred unless packaging requires it)

- In `stream_runtime.py`:
  - Build `PATTERN_GENERATORS = { "walking_bass_simple": gen_walking_bass_simple, ... }`
  - Implement:
    - resolve alias
    - validate existence
    - validate arp fallback policy
    - call generator
  - If invalid:
    - raise/return a structured error object (do not print and continue)

- In `/compile` path:
  - Ensure compile errors are returned to frontend with:
    - field name
    - reason enum
    - user-facing message
    - optional suggested pattern id

## Implement/alias remaining patterns
If UI contract includes patterns that aren’t real generators yet:
- either implement a generator
- or require contract to alias them to a real generator
Do not let them fall through to generic arp texture unless they are explicitly ArpTexture.

## Tests you must add (Phase03/05)
Create `backend/tests/test_pattern_contract_enforcement.py`:
- unknown pattern id => structured error
- non-arp pattern trying to route to arp => error
- ArpTexture pattern routes to arp => success and events generated

Run:
- `python -m pytest -q`

## Deliverable checklist
- [ ] Explicit generator routing table exists
- [ ] Contract validation enforced before generation
- [ ] No silent fallback (only ArpTexture allowed)
- [ ] Structured errors surface to frontend
- [ ] Tests added and passing
