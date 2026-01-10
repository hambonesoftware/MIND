# Phase 03 — Backend Generator Routing and Strict Validation (No Silent Arp Fallback)

## Objective
Make the backend enforce the contract:
- Unknown pattern ids must produce a structured compile error.
- Non-ArpTexture patterns must never route to generic arp texture.
- Provide an explicit routing table for `notePatternId` to generator implementations.
- Expand generator implementations or aliases so UI patterns are real.

## Components
Backend:
- `backend/mind_api/routes.py` (compile endpoint error reporting)
- `backend/mind_api/models.py` (error model if needed)
- `backend/mind_api/mind_core/compiler.py`
- `backend/mind_api/mind_core/stream_runtime.py`
- `backend/mind_api/mind_core/music_elements/texture_engine.py`
- `backend/mind_api/mind_core/music_elements/texture_recipe.py`
- `backend/mind_api/mind_core/determinism.py` (seed derivation consistency)

Docs/contracts:
- `docs/contracts/pattern_contract.v1.json`

Tests:
- `backend/tests/test_style_patterns_realness.py`
- Add new tests: `backend/tests/test_pattern_contract_enforcement.py`

## Work items

### 3.1 Create an explicit routing table in the backend
In `stream_runtime.py` (or a dedicated module):
- Build a dict mapping `notePatternId` to a generator function:
  - Example names already used in tests: `alberti_bass`, `walking_bass_simple`, `gate_mask`
- Route selection must:
  1) validate `notePatternId` exists in contract (load contract at startup or embed a generated routing list)
  2) resolve any aliasing
  3) call the correct generator
  4) return a structured error if invalid or not implemented

### 3.2 Enforce “no silent fallback”
If contract pattern has `allowArpTextureFallback=false`:
- It is a compile error for backend to route it to the generic arp texture path.

Only if `allowArpTextureFallback=true`:
- It may call the generic arp texture family generator.

### 3.3 Improve error payloads
Ensure `/compile` responses surface pattern errors clearly:
- include `field`: `"notePatternId"` or `"pat"`
- include `reason`: `"unknown_pattern" | "disallowed_arp_fallback" | "not_implemented"`
- include `suggestedPatternId` if you can propose a safe default

### 3.4 Implement or alias remaining UI patterns
For each UI pattern that is not a real generator:
- Either implement a generator in `texture_engine.py` or related modules
- Or explicitly alias in the contract to a generator that matches the label

Priority implementation order (high impact families):
- Harmony: comping stabs / chords
- Bass: walking / pulse / pedal
- Lead: riffs / hook fragments / fills
- Drums: groove patterns should be in percussion generator path (avoid arp logic)

## Testing
Automated:
- Add `backend/tests/test_pattern_contract_enforcement.py` to cover:
  - unknown pattern id returns structured error
  - non-arp pattern attempting to route to arp fails
  - ArpTexture pattern is allowed to route to arp and still generates events
- Run:
  - `python -m pytest -q`
  - `python scripts/audit_pattern_contract.py`

Manual:
- Use the UI to select a known non-arp pattern and confirm compile succeeds and produces events.

## Success checklist
- [ ] Backend has explicit routing table for `notePatternId`
- [ ] Unknown ids fail fast with structured error
- [ ] Non-arp patterns cannot silently route to generic arp texture
- [ ] Unit tests cover enforcement
- [ ] Existing tests still pass
