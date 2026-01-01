You are ChatGPT in Agent Mode with full repo-edit + local execution capability.

PHASE: 01 — Frontend NOTE workspace UI (Theory + Render blocks with drag/drop nesting)
REF: plan.zip → PHASE_01_Frontend_Workspace_UI.md

PRIMARY GOALS
1) In the NOTE lane, replace the single editor with a WORKSPACE that supports multiple blocks.
2) Implement two block types:
   - TheoryBlockCard (draggable; contains a script editor)
   - RenderBlockCard (container; has render controls + a drop zone for one child theory block)
3) Drag/drop: allow a Theory block to be dropped into a Render block (one child only).
4) Do not break kick/snare/hat lanes. They can remain as they are today.

SCOPE LIMITS
- This phase is UI only.
- Do not change backend payload shape yet.
- The existing compile/play flow may still use the legacy NOTE lane single script until Phase 02.
  (If needed, choose one “active” theory block to feed into compile as an interim bridge.)

FILES TO MODIFY
- frontend/src/main.js
- frontend/styles.css
Optional refactor targets (only if useful and low-risk):
- frontend/src/ui/app.js
- frontend/src/ui/nodeCard.js
- frontend/src/ui/nodeStack.js
- frontend/src/state/store.js (if you introduce workspace state there)

IMPLEMENTATION PLAN (MVP)
A) Workspace data model
- Maintain a NOTE workspace state:
  blocks: [{ id, kind:'theory'|'render', title, enabled, text?, render?, childId? }]
- Enforce: Render supports exactly one childId.

B) UI: Workspace view
- Add toolbar: “+ Theory”, “+ Render”
- Render root blocks (blocks that are not any render.childId)
- When a render block has childId, show nested child summary within render card.

C) Drag/drop
- Theory card header is draggable.
- Render card has dropzone:
  - highlight on dragover
  - accept only theory block ids
  - set render.childId on drop

D) Legacy bridging
Until Phase 02 payload changes, choose one block to compile for the NOTE lane:
- If any render block has a child, compile that child’s script (or the child script wrapped, but render won’t apply yet).
- Otherwise compile the first enabled theory block.
Add a small UI hint: “Using Theory Block <id> for playback (Phase 02 will send full graph).”

E) Styling
- Add CSS for workspace, cards, dropzone, nesting.

SUCCESS CHECKLIST
- [ ] NOTE lane shows workspace UI
- [ ] Can add Theory blocks and edit scripts
- [ ] Can add Render blocks and adjust controls (even if not applied yet)
- [ ] Can drag a Theory block into a Render block dropzone
- [ ] Removing child works (child becomes root again)
- [ ] Kick/snare/hat lanes still operate

VERIFICATION
1) Start app: python run.py
2) In browser:
   - create Theory + Render blocks
   - drag Theory into Render
   - press Play: existing behavior should still function (even if render not applied yet)

OUTPUT REQUIRED
- Updated frontend workspace UI with drag/drop nesting (MVP)
