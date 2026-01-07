# MIND Agents V9.7
Date: 2026-01-06
Timezone: America/Detroit

These agents are written to execute **planV9.7** phase-by-phase without needing additional clarification.
They assume the repo is already checked out locally and runnable via:

- `python run.py`
- tests: `python -m pytest`

## Shared rules (all agents)
1. **Do not change file paths** referenced in planV9.7 unless the plan explicitly allows it.
2. Preserve backward compatibility: older graphs must load and play.
3. Never remove existing Thought params; add/ignore as needed.
4. Prefer deterministic behavior: seeded randomness must not depend on unseeded `Math.random()`.
5. After any phase changes, rerun:
   - `python -m pytest`
   - a minimal manual smoke test (create Thought, play 4 bars)
6. Any new IDs added to catalogs must be stable and unique.
7. No placeholder implementations. If something is gated, gate it cleanly and document it.

## Repo paths (canonical for V9.7)
Frontend:
- frontend/src/ui/flowInspector.js
- frontend/src/state/nodeRegistry.js
- frontend/src/music/styleCatalog.js
- frontend/src/music/moodCatalog.js
- frontend/src/music/patternCatalog.js
- frontend/src/music/harmonyCatalog.js
- frontend/src/music/feelCatalog.js
- frontend/src/music/instrumentCatalog.js
- frontend/src/music/capabilities.js
- frontend/src/music/styleResolver.js
- frontend/src/music/progressions.js

Backend:
- backend/mind_api/mind_core/stream_runtime.py
- backend/mind_api/mind_core/determinism.py
- backend/mind_api/mind_core/music_elements/texture_engine.py
- backend/mind_api/mind_core/music_elements/texture_recipe.py
- backend/mind_api/mind_core/music_elements/harmony_plan.py
- backend/mind_api/mind_core/music_elements/phrase_plan.py

Tests:
- backend/tests/

## Agents assumed to exist (do not create here)
- AGENT_FRONTEND: owns inspector UX + catalogs + resolver
- AGENT_BACKEND_AUDIO: owns runtime note pattern generators
- AGENT_TEST: owns pytest additions + regression
- AGENT_DOCS: owns documentation + smoke test scripts
