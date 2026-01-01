# PHASE_09 — Demos, docs, and operational acceptance

Agent reference (assumed to exist):
- `agents/phase_09_demos_docs_acceptance.md`

## Goal
Ship user-visible proof that the new system works:
- UI blocks (Theory + Render nesting)
- Example nodes:
  - Moonlight (theory) + Moonlight render texture
  - Wonderwall Oasis (theory) + Oasis render (strum+perc)
  - Wonderwall Ryan Adams (theory) + Ryan render (arpeggiate/no drums)
- Update docs and add a “known good” demo workspace snapshot

## Files to change / create
### Modify docs
- `docs/whitepapers/mind_language_v0_1.md`
- `docs/whitepapers/mind_overview.md`
- `docs/whitepapers/runtime_and_timing.md`
- `README.md`

### Optional (frontend)
- `frontend/src/state/session.js` (save/load workspace snapshot)
- `frontend/src/main.js` (Add “Load Demo Workspace” button)

## Implementation steps
1) Provide demo scripts (copy/paste ready)
- Moonlight Theory (equation)
- Moonlight Render (arpeggiate texture; optional pedal later)
- Wonderwall Theory (harmony plan)
- Render variants

2) Add “Load Demo Workspace”
- Button that loads a predefined workspace JSON into NOTE lane:
  - one Theory block
  - one Render block containing it
  - render spec preconfigured

3) Documentation updates
- Explain the difference between:
  - Theory (intent)
  - Render (gesture)
- Explain nesting UI and compile graph traversal
- Add troubleshooting section:
  - no audio → fallback engine
  - SF2 not present → add General-GS.sf2 locally

## Success checklist (product-level)
- [ ] A user can build and nest Theory + Render blocks without writing JSON
- [ ] A user can load the demo workspace and press Play
- [ ] Moonlight demo produces continuous arpeggiated texture
- [ ] Wonderwall demos differ primarily in render (strum vs arpeggiate)
- [ ] Docs clearly explain the model and how to extend it

## Unit testing / verification
- Backend: run full pytest suite
- Manual: demo workspace playback
- Optional: add a Playwright smoke test that:
  - loads app
  - clicks “Load Demo Workspace”
  - clicks Play
  - checks console logs for “compile ok” and event counts
