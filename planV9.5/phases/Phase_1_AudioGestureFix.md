# Phase 1 — Audio Gesture Fix + Engine Init Reliability

## Objective
Eliminate browser autoplay restrictions breaking init:
- No “AudioContext was not allowed to start…” spam on load
- Audio engine initializes/resumes ONLY after a user gesture (Play click)
- Reduce/avoid WorkerSynthesizer ready-timeout by ensuring init ordering is correct

## Agent(s) (from agentsV9.5.zip)
- `Agent_Frontend_AudioGestureFix`
- `Agent_Frontend_SpessaSynthInit`

## Problem statement
Current behavior suggests the AudioContext is being created/resumed outside a user gesture, typically:
- during page boot
- during module import side-effects
- during engine constructor/init called before a click handler executes

This causes:
- AudioContext resume to be blocked
- SpessaSynth worker/worklet init to stall or race
- downstream transport scheduling to operate without a stable audio clock

## Files to change (expected)
- `frontend/src/audio/audioEngine.js`
- `frontend/src/main.js`
- `frontend/src/audio/spessa/SpessaSynthEngine.js`
- (if present) `frontend/src/worker/*` and any worker bootstrap wiring
- any place that calls `audioEngine.init()` on boot rather than on click

## Implementation steps (no code, but specific)
1) Ensure audio engine creation does NOT automatically:
   - create AudioContext
   - resume AudioContext
   - start worklets/workers
2) Move “init/resume” behind a user gesture:
   - the click handler for Play (or Start-node Play)
   - a single-shot “ensureAudioStarted()” gate that:
     - creates context if missing
     - resumes if suspended
     - returns when ready
3) Ensure transport `startPlayback()` calls the gate BEFORE `audioEngine.start()` and before the scheduler begins.
4) Ensure Stop does not permanently break subsequent Play:
   - stopping should not destroy the ability to resume the context later
5) Add a console diagnostic line (temporary) confirming:
   - init path and whether it was gesture-gated
   - context state transitions (suspended → running)

## Success checklist
- [ ] Hard refresh: no AudioContext gesture warnings before any click
- [ ] First click Play: audio starts or engine becomes ready without gesture errors
- [ ] 3x Play/Stop: stable, no progressive failures
- [ ] WorkerSynthesizer timeout either:
  - no longer happens, OR
  - happens rarely and consistently falls back to Worklet cleanly (no broken audio)
- [ ] Executions panel reflects “Playing” state correctly

## Tests
Manual
- Run Phase 0 repro steps; compare console logs (must be improved).
Automated (optional but recommended)
- Add a small frontend unit test (if you have a framework) that verifies:
  - `ensureAudioStarted()` is only called from click-driven code paths

## Stop / Hold criteria
Stop if:
- Playback requires multiple clicks to start
- Audio starts but transport scheduling becomes erratic (time jumps / NaN)
- Worker/worklet init crashes the page

