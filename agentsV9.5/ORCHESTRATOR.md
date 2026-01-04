# ORCHESTRATOR — V9.5 Execution Flow

This orchestrator is written as if you are running a Codex-style “agent mode” workflow.

## Shared rules (all phases)
- Work on a fresh branch per phase:
  - `v9.5/phase-N-short-name`
- Keep PR focused to the phase goals.
- Add docs artifacts in `docs/v9.5/phase-N/`:
  - `console.log.txt`
  - `notes.md`
  - screenshots (optional)
- If a phase introduces a new concept (state field, schema field), update the runbook.

---

## Phase 0 — Baseline + Repro Harness
Run:
- `Agent_QA_BaselineHarness`
- `Agent_Frontend_Runbook`

Deliverables:
- baseline logs/screenshots
- a reproducible “repro steps” doc

---

## Phase 1 — Audio Gesture Fix + Engine Init Reliability
Run:
- `Agent_Frontend_AudioGestureFix`
- `Agent_Frontend_SpessaSynthInit`

Deliverables:
- no autoplay/gesture warnings on load
- playback starts reliably on first click

---

## Phase 2 — Verify + Lock Fan-out Semantics with Tests
Run:
- `Agent_Backend_RuntimeSemantics`
- `Agent_QA_BackendTests`

Deliverables:
- tests: fan-out for Thought nodes
- explicit Start behavior documented

---

## Phase 3 — Thought Schema Extensions for Custom Melody
Run:
- `Agent_Frontend_SchemaAndPayload`
- `Agent_Backend_SchemaValidation`

Deliverables:
- new Thought fields persisted and accepted by backend

---

## Phase 4 — Backend: Compile Custom Melody to Events
Run:
- `Agent_Backend_CustomMelodyCompiler`
- `Agent_QA_BackendEventTests`

Deliverables:
- custom melody → events (holds supported)
- events include `sourceNodeId`

---

## Phase 5 — Frontend: Graphical Custom Melody Editor
Run:
- `Agent_Frontend_ThoughtInspectorCustomMelody`
- `Agent_Frontend_StepLatchUI`
- `Agent_QA_UIRegression`

Deliverables:
- click-based rhythm + notes editor
- presets A/B + copy/paste

---

## Phase 6 — Now Playing Glow/Highlight
Run:
- `Agent_Frontend_PlaybackHighlight`
- `Agent_Backend_EventSourceTagging` (only if missing after Phase 4)

Deliverables:
- active Thoughts glow based on scheduled events

---

## Phase 7 — Moonlight Treble Template + Validation
Run:
- `Agent_Frontend_TemplateBuilder`
- `Agent_QA_MoonlightScenario`

Deliverables:
- insert template builds graph + edges
- playback: bars 1–4 then concurrent melody+triplets at bar 5
- glow works concurrently
