# Phase 0 — Baseline Audit + Guardrails (Required)

## Objective
Establish a safe baseline before changing schemas/UI, and define smoke tests that confirm:
- legacy thoughts still load and play
- compile pipeline unchanged for existing nodes

## Scope
Read-only audit + small additions that help avoid regressions (e.g., helper test script).
No schema/UI changes yet.

## Steps
1) **Locate Music Thought node definition**
   - Open: `frontend/src/state/nodeRegistry.js`
   - Identify the node type key (likely `thought` or `musicThought`)
   - Capture:
     - current `paramSchema`
     - current `defaults`
     - any `ports` or compile hooks

2) **Locate inspector rendering**
   - Open: `frontend/src/ui/flowInspector.js`
   - Find how it:
     - renders the Music Thought parameters
     - uses option lists (style/mood/pattern/progression/feel/instrument)

3) **Locate compile normalization**
   - Open: `frontend/src/state/compilePayload.js`
   - Find how it compiles a Music Thought into audio events / engine payload.
   - Identify:
     - where harmony/pattern/feel/voice are interpreted
     - if there is already a “style resolver” step

4) Add a lightweight **manual smoke-test checklist** to the repo
   - Create: `frontend/src/dev/SMOKE_TESTS_V9_8.md`
   - Include the steps in the “Manual Smoke Tests” section below.

5) (Optional but recommended) Add a **dev-only console guard**
   - If the app already has a debug flag mechanism, add a single guard to warn
     when both legacy + joined keys are set in conflicting ways (but do not break).
   - Keep it behind a dev flag; no noisy logs.

## Manual Smoke Tests (put these in SMOKE_TESTS_V9_8.md)
1) Start dev server
   - `npm install`
   - `npm run dev`

2) Create a new Music Thought in the UI
   - Set: styleId + moodId + a progression preset + pattern
   - Confirm you can press Play and hear output

3) Load an existing saved project containing Music Thoughts (if you have one)
   - Confirm no missing param UI
   - Confirm playback works

4) Switch style/mood and confirm recommendations update (if applicable)

## Required Commands
- `npm run lint` (or the repo’s equivalent)
- `npm run test` (if present; otherwise note “no tests configured” in the phase report)

## Success Checklist
- [ ] You can identify the exact Music Thought node key and its schema location.
- [ ] You can identify compilePayload entry points for Music Thought compilation.
- [ ] SMOKE_TESTS_V9_8.md exists with the above steps.
- [ ] Dev server runs with **zero console errors** on initial load.
