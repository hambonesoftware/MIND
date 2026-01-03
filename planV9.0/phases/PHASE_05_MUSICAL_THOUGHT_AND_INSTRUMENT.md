# PHASE 05 — Musical Thought V9 (Pattern + Rhythm/Syncopation/Warp + Instrument)

Agent: `AGENT_V9_PHASE05_MUSICAL_THOUGHT` (assumed to exist in agentsV9.0.zip)

## Objective
Make a V9 Musical Thought fully authorable and playable:
- dropdown-driven pattern semantics (theory-light)
- rhythm + syncopation + timing warp separation
- register bounds + duration
- **SoundFont instrument selection (sf2/sf3 preset)**

## Current V8 anchors
Backend music building blocks already exist:
- `backend/mind_api/mind_core/music_elements/` (plans/recipes)
- theory + equation parsing modules
Frontend audio:
- `frontend/src/audio/audioEngine.js`
- `frontend/src/audio/sf2/` and `frontend/src/audio/spessa/` (SoundFont engine)
- `frontend/src/audio/transport.js`

## V9 Thought contract
Thought params must include:
- durationBars
- key
- chord source (explicit root/quality OR inherit)
- pattern type + pattern params
- rhythm (grid / note value)
- syncopation (mask)
- timing warp (swing/shuffle intensity)
- register bounds
- soundfont selection + preset selection (bank/program, optionally drum mode)

## Instructions
1. Define the Thought inspector UI layout:
   - Pitch context (key, chord root/inherit)
   - Pattern type + pattern params (arpeggio 3-step vs 4-step, order, octave spread)
   - Rhythm dropdown (e.g., Triplet 1/12 vs 1/16 etc.)
   - Syncopation dropdown (Offbeat, Anticipation, etc.)
   - Timing warp dropdown (None/Swing/Shuffle + intensity)
   - Register bounds
   - Duration (bars)
   - Instrument (SoundFont + preset picker)
2. Implement backend generation mapping:
   - Convert Thought params into existing `music_elements` structures where possible
   - If a mapping is missing, add a small adapter layer (do not rewrite the whole music system)
3. Ensure instrument selection is propagated into Event outputs:
   - Events should carry enough info for engine routing (channel/preset)
4. Add “Moonlight Opening Arp” as a canonical Thought preset (example project):
   - Key: C# minor
   - Pattern: Arpeggio, 3-step low→mid→high
   - Rhythm: triplet 1/12 continuous
   - Timing warp: none
   - Instrument: Piano (SoundFont preset)

## Files to change/create
Frontend:
- CHANGE: `frontend/src/state/nodeRegistry.js` (Thought params schema)
- CHANGE: Thought inspector component(s) (where config UI lives)
- CHANGE: `frontend/src/state/compilePayload.js` (include Thought params)
- OPTIONAL: preset picker UI helper under `frontend/src/ui/`

Backend:
- CHANGE: `backend/mind_api/mind_core/stream_runtime.py` (execute musical thoughts)
- CHANGE: `backend/mind_api/mind_core/*` adapters (as needed)
- CHANGE: `backend/mind_api/models.py` (Event includes instrument routing fields if needed)

## Completion checklist
- [ ] Thought plays with selected SoundFont preset (sf2/sf3)
- [ ] Rhythm / syncopation / timing warp are separate and behave as expected
- [ ] Thought respects register bounds and duration
- [ ] Thought can be reused in multiple places (same definition, different wiring)
- [ ] Moonlight Opening Arp Thought can be created via dropdowns and sounds correct

## Required tests
- [ ] Create and preview a Thought with Piano preset; confirm audible output
- [ ] Change instrument preset; confirm timbre changes without changing pattern
- [ ] Triplet vs 16th rhythm toggles change timing as expected

