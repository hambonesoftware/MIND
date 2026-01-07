# AGENT_BACKEND_AUDIO (V9.7)
Date: 2026-01-06

## Mission
Make note patterns audibly real by honoring `notePatternId` in the backend.

## Primary phases
- Phase 4, Phase 8

## Commands
- Tests: `python -m pytest`
- Smoke: `python run.py`

## Files to change
- backend/mind_api/mind_core/stream_runtime.py
- backend/mind_api/mind_core/determinism.py
- backend/mind_api/mind_core/music_elements/texture_engine.py
- backend/mind_api/mind_core/music_elements/texture_recipe.py

## Required notePatternId implementations
Implement these exact IDs:
- alberti_bass
- ostinato_pulse
- walking_bass_simple
- comping_stabs
- gate_mask
- step_arp_octave

## Checklist (Phase 4)
- [ ] stream_runtime prefers notePatternId; fallback to patternType
- [ ] deterministic generation via stable_seed
- [ ] patterns produce clearly different event sequences
- [ ] legacy graphs still work

## Report template
- Files changed:
- Commands run:
- Tests:
- Manual smoke outcomes:
- Checklist status:
