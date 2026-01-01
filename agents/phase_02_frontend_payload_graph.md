You are ChatGPT in Agent Mode with full repo-edit + local execution capability.

PHASE: 02 — Frontend compile payload: send node graph (Theory + Render)
REF: plan.zip → PHASE_02_Frontend_Payload_NodeGraph.md

PRIMARY GOALS
1) Update the /api/compile request payload to include ALL relevant nodes:
   - theory nodes (text)
   - render nodes (childId + render spec)
2) Keep existing drum lane nodes unchanged for now (they can default to kind=theory).
3) Ensure payload is deterministic and stable (sort by id or creation order).
4) Add an optional compatibility toggle to send legacy payload if needed.

FILES TO MODIFY
- frontend/src/main.js
- frontend/src/api/client.js
- frontend/src/state/store.js
Optional (recommended for testability):
- Create frontend/src/state/compilePayload.js (pure function builder)
- Create frontend/tests/test_compile_payload.mjs (Node test runner)

IMPLEMENTATION PLAN
A) Define payload shape
Each node in payload:
- id: string
- kind: 'theory'|'render'
- enabled: boolean
- text?: string (theory)
- childId?: string (render)
- render?: { strum?: {...}, perc?: {...} }

B) Build nodes list
- Include existing lane nodes (kick/snare/hat + legacy NOTE if you still keep it) as kind='theory' with text.
- Include NOTE workspace blocks as individual nodes.
- Ensure ids are unique across all nodes.

C) Send nodes list to backend
- Update client compile call to send nodes array as above.

D) Optional legacy toggle
- Add config flag USE_NODE_GRAPH = true
- If false, send the old payload format (single note node text).

SUCCESS CHECKLIST
- [ ] DevTools Network shows compile payload contains multiple nodes
- [ ] Render nodes include childId + render settings
- [ ] Theory nodes include text
- [ ] App still plays under legacy behavior (until backend supports graph traversal)

VERIFICATION
- python run.py
- Browser DevTools → Network → /api/compile → request payload inspection

OPTIONAL FRONTEND TEST
- node --test frontend/tests
(Only if you add the pure payload builder function.)
