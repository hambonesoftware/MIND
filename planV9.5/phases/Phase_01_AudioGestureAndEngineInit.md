# Phase 01 — Audio Gesture + Engine Init Reliability

**Agent reference (assumed to exist):** `agentsV9.5/Phase_01_AudioGestureAndEngineInit_Agent.md`

## Purpose
Eliminate autoplay/gesture errors and reduce synth init failures by ensuring AudioContext creation/resume and synth initialization happen only after a user gesture (Play/Start Play).

This addresses console spam like:
- `The AudioContext was not allowed to start...`
and improves WorkerSynthesizer readiness by avoiding early init in a blocked context.

## Scope
- Frontend audio initialization lifecycle only.
- No change to musical correctness yet.

## Root cause (expected)
Some portion of the audio engine / synth is initializing (creating/resuming AudioContext or starting the engine) on page load or without a gesture.

## Implementation steps

### 1.1 Make audio init lazy
Locate where `SpessaSynthEngine.init()` (or equivalent) is invoked.
- Ensure it is **NOT** called during module import or page load.
- Ensure it is called:
  - during a user click handler for Play (transport), OR
  - during Start node Play click (flow canvas), OR
  - the first time any user triggers playback.

### 1.2 Explicit resume policy
When starting playback:
- If AudioContext state is `suspended`, call `resume()` inside the click handler path.
- If AudioContext doesn’t exist yet, create it inside the click handler path.

### 1.3 Tighten fallback behavior
If WorkerSynthesizer is selected but times out:
- Ensure you log a single concise warning, then fallback to WorkletSynthesizer.
- Avoid repeated init loops that spam logs.

### 1.4 Smoke test for gesture
Open app:
- do not click anything → confirm no repeated “AudioContext not allowed” warnings
- click Play → audio starts

## Files to change (expected)
- `frontend/src/audio/audioEngine.js` (or similar factory)
- `frontend/src/main.js` (bootstrap wiring for transport start)
- `frontend/src/audio/spessa/SpessaSynthEngine.js` (or wherever AudioContext is created/resumed)
- Potentially `frontend/src/ui/flowCanvas.js` if Start node play triggers engine

## Success checklist
- [ ] Page load shows **no repeating** AudioContext gesture warnings.
- [ ] First user click on Play/Start Play consistently starts audio.
- [ ] WorkerSynthesizer timeout does not loop; fallback is clean.
- [ ] Repeated Play/Stop works without dead audio.

## Required tests
- [ ] Manual: Chrome desktop — refresh page, click Play, hear audio.
- [ ] Manual: Chrome mobile — same.
- [ ] Automated (if available): add a minimal unit test that engine init is not invoked at import time (optional).
