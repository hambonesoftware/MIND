# Phase 09 — Polish / Regressions / Release Checklist

**Agent reference (assumed to exist):** `agentsV9.5/Phase_09_Polish_Regressions_Release_Agent.md`

## Purpose
Stabilize the full feature set for V9.5, reduce log spam, tighten UX, and ensure a clean handoff.

## Scope
- Quality and resilience improvements
- No major new features

## Tasks

### 9.1 Logging cleanup
- Reduce repeated warnings:
  - WorkerSynthesizer readiness timeouts: log once per init attempt
  - Compile errors: rate-limit repeated prints (e.g., only once per second)

### 9.2 UX cleanup
- Disable Start Play unless Start reaches a Thought (already planned earlier)
- Show tooltip explaining why Play is disabled
- Add small “Now Playing” indicator in executions panel (optional)

### 9.3 Performance sanity
- Ensure glow updates do not cause excessive re-rendering
- Ensure latch strip is efficient (no full reflow per click)

### 9.4 Regression tests
Create/extend `docs/v9.5/test_matrix.md` with final pass results.

### 9.5 Release artifacts
- Update changelog / version markers (wherever your project tracks versions)
- Create a short “What’s New in V9.5” page in docs

## Files to change/create (expected)
- `frontend/src/audio/transport.js` (log rate-limiting)
- `frontend/src/audio/spessa/SpessaSynthEngine.js` (log policy)
- `docs/v9.5/test_matrix.md` (final results)
- `docs/v9.5/whats_new_v9_5.md` (new)

## Success checklist
- [ ] Console is clean during normal playback (no spam).
- [ ] Start Play disable/enable rule works and is understandable.
- [ ] All tests pass.
- [ ] Docs updated with final test matrix + whats new.
- [ ] Version bump complete.

## Required tests
- [ ] Frontend build passes.
- [ ] Backend tests pass.
- [ ] Manual smoke on desktop + mobile.
