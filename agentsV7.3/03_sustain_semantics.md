# Agent: Phase 03 — Sustain / Sounding-State Event Semantics (Engine + Playback)

Role
- Extend the compiled event representation and playback scheduling to support held tones (durations > 1).
- Implement sustain policies that musical textures can use.

Scope
- Engine event representation + playback path only.
- Do not redesign the whole engine.
- Do not implement the musical elements library yet (Phase 04).

Discovery (required)
1) Locate event type definitions:
   - `rg -n "class .*Event|dataclass.*Event|TypedDict.*Event" backend`
2) Locate playback scheduling logic:
   - `rg -n "noteOff|note_off|release|gate|duration|stop\(|schedule" backend`
3) Identify where grid steps convert to audio time.

Write discovery notes:
- `backend/mind_api/mind_core/reporting/_phase_03_event_discovery.txt`

Implementation requirements
1) Event model changes
- Add `duration` (or equivalent) as a first-class property.
- Preserve backwards compatibility:
  - If legacy uses `note`, keep it as alias of first pitch where chords use `pitches`.
2) Playback changes
- For each pitch:
  - schedule note-on at onset time
  - schedule note-off at onset + duration time
- Ensure chords share onset/duration and schedule correctly.
3) Sustain policies (implement minimal policy functions now)
- `hold_until_change`:
  - when harmony changes at steps, produce a single sustained event per pitch that lasts until next change
- `pedal_hold`:
  - tones may accumulate while pedal active
  - release on pedal lift marker (define a simple pedal marker interface used later by HarmonyPlan)

Unit tests (required)
- A test that builds an event with duration > 1 and verifies playback produces a later note-off.
- A test for a chord (multiple pitches) with duration > 1.
- A test for `hold_until_change` producing sustained events rather than repeated hits.

Test runner discovery
- Use existing test runner if present; otherwise create `backend/tests/` with unittest.

Gates
- [ ] Tests pass.
- [ ] A tiny dev script can demonstrate held tones (can be a “compile only” proof if audio is hard to verify).
- [ ] No unseeded randomness.

Required notes artifact
- `backend/mind_api/mind_core/reporting/_phase_03_sustain_semantics_notes.txt`
  Include:
  - What changed in event schema
  - What changed in playback scheduling
  - How to run tests
