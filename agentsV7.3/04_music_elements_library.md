# Agent: Phase 04 — Musical Elements Library (HarmonyPlan / TextureRecipe / PhrasePlan)

Role
- Implement reusable music-theory elements and a small deterministic texture engine that generates events.

Scope
- Add a new module area (recommended):
  - `backend/mind_api/mind_core/music_elements/`
- Do not update Moonlight demo yet (Phase 05).
- Keep minimal but complete: implement only the required v7.3 features.

Required modules (suggested)
- `music_elements/harmony_plan.py`
- `music_elements/texture_recipe.py`
- `music_elements/phrase_plan.py`
- `music_elements/texture_engine.py`
- `music_elements/__init__.py`

Hard constraints
- Deterministic variation only:
  - No unseeded random calls
  - Derive variation from stable inputs: piece id, bar index, phrase index, explicit seed
- Not transcription-based.

Minimum feature set
1) HarmonyPlan
- chord progression blocks
- change points (by bar+step or absolute step)
- optional pedal markers (on/off regions)
2) TextureRecipe
- pattern family (A/B/C variants)
- register policy (fixed band + slow drift permitted deterministically)
- sustain policy reference (hold_until_change / pedal_hold)
- accent policy (beat weighting)
3) PhrasePlan
- density curve
- register curve
- optional ornament curve (can be placeholder but must be deterministic and tested)

Texture Engine
- Convert HarmonyPlan + TextureRecipe + PhrasePlan => list of compiled events
- Must support generating:
  - triplet broken chord texture (used later for Moonlight)
  - sustained tones (using Phase 03 semantics)

Unit tests (required)
- Deterministic pattern selection: same inputs => same outputs (byte-for-byte if possible).
- Phrase curve affects density over bars (e.g., more events in peak section).
- Sustain integration: produced events include durations > 1 for sustained layer.
- A small 4-bar generation smoke test that runs compilation without errors.

Gates
- [ ] Tests pass.
- [ ] Engine can generate a short example from elements without touching Moonlight demo.
- [ ] No randomness without explicit seed.

Required notes artifact
- `backend/mind_api/mind_core/reporting/_phase_04_music_elements_notes.txt`
  Include:
  - API summary
  - Example usage snippet (short)
  - How tests are run
