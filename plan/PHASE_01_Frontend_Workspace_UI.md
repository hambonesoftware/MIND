# PHASE_01 — Frontend NOTE workspace + Render/Theory block UI (drag/drop nesting)

Agent reference (assumed to exist):
- `agents/phase_01_frontend_workspace.md`

## Goal
Replace “single text box per lane” (for NOTE lane) with a **workspace** that supports:
- Multiple blocks (cards)
- Two block types:
  - TheoryBlockCard: contains a text editor for `equation(...)` or `beat(...)` (initially allow either)
  - RenderBlockCard: has UI controls for render params + a **drop slot** for exactly one child
- Drag/drop: user drags a Theory block into a Render block

## Scope
Frontend-only UI changes (no backend payload changes yet).
Backend can stay untouched; you can keep compiling the single NOTE lane script until Phase 02.

## Files to change / create (frontend)
### Modify
- `frontend/src/main.js`
- `frontend/styles.css`

### Optional: refactor helper components (recommended)
- `frontend/src/ui/app.js`
- `frontend/src/ui/nodeCard.js`
- `frontend/src/ui/nodeStack.js`

## Implementation steps (recommended approach)
### 1) Introduce a NOTE-lane workspace state model
In `frontend/src/state/store.js` (or inside `main.js` if you want minimal refactor), create a NOTE workspace state:

- `blocks: Array<Block>` where Block is:
  - `id: string`
  - `kind: "theory" | "render"`
  - `title: string`
  - `enabled: boolean`
  - `text?: string` (theory)
  - `render?: RenderSpec` (render)
  - `childId?: string` (render)

For this phase:
- You do NOT need `render` to be sent to backend yet.
- You just need to store it.

### 2) Create UI cards
Implement cards either inline in `main.js` or as modules in `frontend/src/ui/`.

TheoryBlockCard UI:
- Title
- Enabled checkbox
- Text area (script)
- Parse status indicator (optional)
- Drag handle (entire header draggable)

RenderBlockCard UI:
- Title
- Enabled checkbox
- UI controls (sliders/toggles) for:
  - Strum enabled
  - Spread (ms)
  - Direction pattern (simple default: DUDUDUDU)
  - Perc enabled
  - Hat/kick/snare patterns (8 steps MVP)
- Drop slot area:
  - Shows “Drop a Theory block here” if empty
  - Shows child block summary if assigned
  - Allow “Remove child” button

### 3) Implement drag/drop
Use the HTML Drag and Drop API:
- On TheoryBlockCard `dragstart`: set `dataTransfer.setData("text/plain", theoryId)`
- On RenderBlockCard dropzone:
  - `dragover`: `preventDefault` and highlight
  - `drop`: read id, set `renderBlock.childId = theoryId`

Enforce constraints:
- Only allow theory blocks to be dropped
- Only allow one child; dropping replaces existing child (or reject; your call)
- Prevent cycles (trivial with one-level nesting)

### 4) Rendering the workspace
In NOTE lane, show:
- A toolbar: “+ Theory Block”, “+ Render Block”
- A list of root blocks (blocks that are not a child of any render block)
- If a render block has a child, render it visually nested within the render block card

### 5) CSS styling
Add CSS for:
- `.workspace`
- `.block-card`
- `.block-card-header`
- `.dropzone` (normal + `.dropzone.dragover`)
- `.nested-child`

## Success checklist
- [ ] NOTE lane shows a workspace instead of a single text editor
- [ ] You can create multiple blocks
- [ ] You can drag a Theory block into a Render block
- [ ] Render block shows the nested child visually
- [ ] Removing a child restores the child as a root block
- [ ] Nothing else (kick/snare/hat lanes) is broken

## Unit testing / verification
Frontend in this repo is vanilla JS without a test harness. Use these checks:

Manual UI checks:
- [ ] Create Theory block
- [ ] Create Render block
- [ ] Drag Theory into Render
- [ ] Reload page (optional): verify whether your state persists as intended (session store or not)

Optional automated checks (Node built-in test runner):
- Add `frontend/tests/test_workspace_state.mjs` and run `node --test`.
- The test should verify:
  - assigning `childId` removes child from roots
  - removing `childId` restores child to roots
  - invalid drop does not change state

Example `frontend/tests/test_workspace_state.mjs` content (create later in Phase 02 if desired):
- Use `node:test` and `assert/strict`.
- Test pure functions only (no DOM).
