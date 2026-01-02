# Phase 04 — Musical Elements Library (Reusable Theory Blocks)

Agent: `agents/04_music_elements_library.md`  
Goal: Implement reusable music-theory elements that generate events with controlled variation and phrase shaping.

## Core idea
Music is built from layered reusable objects:
- HarmonyPlan: chord progression + change points + pedal markers
- TextureRecipe: how harmony is realized (patterns, register, sustain policy, accent)
- PhrasePlan: how it evolves over time (density/dynamics/register curves, cadence emphasis)

## Scope
- Add new modules under a stable path (proposed):
  - `backend/mind_api/mind_core/music_elements/`
- Provide a small “texture engine” that converts elements into events.
- Deterministic variation only.

## Proposed module layout
- `music_elements/harmony_plan.py`
- `music_elements/texture_recipe.py`
- `music_elements/phrase_plan.py`
- `music_elements/texture_engine.py`
- `music_elements/__init__.py`

## Deterministic variation requirements
- Any variation must be derived from stable inputs:
  - bar index, phrase index, section label, piece id, and/or an explicit seed
- No use of global random without explicit seed.

## Required features (minimal v7.3 set)
1. HarmonyPlan
- Chords with changeSteps (grid steps per bar) or changeBars.
- Optional pedal state markers.
2. TextureRecipe
- Pattern family (A/B/C variants)
- Register policy (fixed band with slow drift)
- Sustain policy (from Phase 03)
- Accent policy (beat-weighted)
3. PhrasePlan
- Density curve (more attacks at peaks)
- Register curve (lift or settle)
- Optional ornament rate curve

## Unit tests (required)
- Deterministic pattern selection given identical inputs.
- Phrase curve changes density across bars in a predictable way.
- Sustain policy integration: generated output contains durations > 1 where expected.

## Gates
- [ ] Tests pass.
- [ ] Elements can generate a short 4-bar example that demonstrates non-uniform but style-safe variation.
- [ ] No transcription logic added.

## Output artifacts
- `backend/mind_api/mind_core/reporting/_phase_04_music_elements_notes.txt`
