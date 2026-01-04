# planV9.5 — Moonlight Treble (MIND) Upgrade Plan

This plan upgrades **MINDV9.4 → MINDV9.5** to support:

1) Reliable playback start (no AudioContext gesture errors; more stable SpessaSynth init)
2) Confirmed + test-covered flow **fan-out semantics** (Thought → multiple edges runs concurrently)
3) **Custom Melody** authoring on Thoughts (graphical step-latch editor + explicit notes)
4) Backend compilation of custom melody into events (with holds/ties)
5) Runtime “now playing” **glow/highlight** on the active Thought(s)
6) A “Moonlight Treble (bars 1–16)” template that builds the graph:
   - Start → Treble Intro (bars 1–4)
   - Treble Intro (out) → Treble Triplets (bars 5–16)
   - Treble Intro (out) → Treble Melody (bars 5–16)

> Note: The companion **agentsV9.5.zip** will contain prebuilt agents referenced throughout these phases.
> Each phase file assumes those agents already exist and can be invoked in your Codex workflow.

## How to use these phase files

- Execute phases in order (0 → 7).  
- Each phase has:
  - Objective
  - Files to change/create
  - Step-by-step instructions
  - Success checklist + tests
  - “Stop/hold” criteria (when not to proceed)
- Keep PRs small: one phase per branch/PR (recommended), or merge sequentially once verified.

## Naming conventions

- Branch: `v9.5/phase-N-short-name`
- PR title: `V9.5 Phase N — <short name>`
- Tag (optional): `mind-v9.5.0`

## Assumptions (current codebase)

- Frontend uses `frontend/src/audio/transport.js` scheduler + `compileSession`.
- Flow graph is in `flowStore` and supports a runtime slice (playback state, debug trace).
- Backend runtime resides in `backend/mind_api/mind_core/stream_runtime.py`.
- V9.4 runtime semantics:
  - **Thought node fan-out** is “send to all outgoing edges”
  - **Start node** behavior is “send to one (queued)”

If any of these assumptions are false in your local repo, stop and correct the plan at Phase 0.

