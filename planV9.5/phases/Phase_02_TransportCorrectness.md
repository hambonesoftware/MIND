# Phase 02 — Transport Correctness (Fix windowStartBeat bug + Scheduling Stability)

**Agent reference (assumed to exist):** `agentsV9.5/Phase_02_TransportCorrectness_Agent.md`

## Purpose
Fix transport scheduling correctness and remove compile spam:

- `Compile error ReferenceError: windowStartBeat is not defined`
- repeated compile failures leading to `schedule(): no events`

## Scope
- `frontend/src/audio/transport.js` scheduling loop
- Any related UI hooks that depend on schedule windows

## Root cause (known)
In `requestWindow(...)`, `updateExecutionsPanel(windowStartBeat, windowEndBeat, diagnostics)` is called, but `windowStartBeat` / `windowEndBeat` are not defined in that function scope. They exist in `tickScheduler()` only.

## Implementation steps

### 2.1 Fix the missing variables
Choose one correct approach (recommended):
- Add `windowStartBeat` and `windowEndBeat` to the `requestWindow` argument object.
- Pass them from `tickScheduler()` into each `requestWindow()` call.

Alternative (acceptable but less explicit):
- Move the executions panel update out of `requestWindow` and do it only in `tickScheduler()`.

### 2.2 Protect compileQueue
Ensure compile scheduling cannot accumulate infinite queue when compile errors occur:
- Keep `.catch(...)` at the queue boundary.
- Ensure a compile failure does not permanently break subsequent scheduling.

### 2.3 Wraparound scheduling correctness
When scheduling crosses loop boundary (wraparound):
- Confirm `cycleStartBeat` math is correct.
- Confirm events from barOffset mapping remain consistent.
- Confirm executions panel shows meaningful window.

### 2.4 Reduce log spam
If compile errors occur, don’t log thousands of times:
- Consider “error cooldown” or “only log first N errors per second” (optional in Phase 09, not required now).
- For Phase 02: correctness first; spam reduction optional.

## Files to change
- `frontend/src/audio/transport.js`

## Success checklist
- [ ] No `windowStartBeat is not defined` in console.
- [ ] Compile requests happen during playback and return events.
- [ ] `schedule(): no events` only appears when genuinely no events are generated (not due to JS errors).
- [ ] Executions panel updates correctly during play.

## Required tests
- [ ] Manual: click Play, let it run 10 seconds; no repeated JS ReferenceErrors.
- [ ] Manual: change BPM while playing; scheduler continues without errors.
- [ ] If you have unit tests: add a tiny test that `requestWindow` does not reference undefined variables (optional).
