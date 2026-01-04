# Phase 0 — Baseline / Repro Harness

## Context
- Repo: `/workspace/MIND`
- Branch: `work`
- Server command: `python run.py`
- Browser automation: Playwright Firefox (headless) for reproducible steps, DevTools console logs saved to `docs/v9.5/phase-0/console.log.txt`.

## Repro steps executed
1. Started backend/frontend via `python run.py`.
2. Opened `http://127.0.0.1:8000` with DevTools console capturing.
3. Per harness: hard refresh, waited 3 seconds, then ran Play/Stop three times (10s run between Play and Stop each cycle).
4. Captured console output and a full-page screenshot (`docs/v9.5/phase-0/screenshot.png`).

## Observations
- **Autoplay/gesture warnings** on load: repeated "AudioContext was prevented from starting automatically" warnings before any gesture. (See console log lines ~5–25.)
- **Engine init fallback:** `WorkerSynthesizer isReady timed out` triggered; engine fell back to `WorkletSynthesizer` and reported `SpessaSynth mode: worklet`. (Console log mid-run.)
- **No events scheduled:** During Play, console showed `schedule(): no events` even after compile requests, and only BPM setter spam appeared—implies transport started but had no queued events to play.
- No transport ReferenceErrors observed; backend `/api/compile` returned 200s during runs.

## Artifacts
- Console log: `docs/v9.5/phase-0/console.log.txt`
- Screenshot: `docs/v9.5/phase-0/screenshot.png`
