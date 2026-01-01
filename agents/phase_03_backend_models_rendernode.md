You are ChatGPT in Agent Mode with full repo-edit + local execution capability.

PHASE: 03 — Backend models: NodeInput.kind + RenderSpec
REF: plan.zip → PHASE_03_Backend_Models_NodeGraph.md

PRIMARY GOALS
1) Update backend request models so /api/compile accepts node graph payload from Phase 02.
2) Maintain backward compatibility with old payloads.
3) Add structured RenderSpec models (StrumSpec, PercSpec).
4) Add optional debug fields to compile request/response.

FILES TO MODIFY
- backend/mind_api/models.py

OPTIONAL DEV FILES
- backend/requirements-dev.txt (pytest)
- backend/tests/test_models_nodeinput.py

IMPLEMENTATION PLAN
A) Update NodeInput model
- kind: Literal['theory','render'] default 'theory'
- text: Optional[str]
- childId: Optional[str]
- render: Optional[RenderSpec]
- Keep enabled, id, lane fields as they exist

B) Validators
- If kind=='theory': require text present (unless legacy mode permits empty? choose strict)
- If kind=='render': require childId; allow render empty for identity wrapper OR require render — decide and document

C) Render specs
- StrumSpec: enabled, grid?, directionByStep, spreadMs
- PercSpec: enabled, grid, kick, snare, hat
- RenderSpec: optional strum, optional perc

D) Backward compatibility
- If payload nodes omit kind, it defaults to theory.
- If older payload uses only text, continue to accept it.

E) Add debug toggles (recommended)
- CompileRequest.debug: bool = False
- CompileResponse.debugText / debugLattice optional

SUCCESS CHECKLIST
- [ ] Old payload validates
- [ ] New graph payload validates
- [ ] Missing childId on render yields clear validation error
- [ ] Missing text on theory yields clear validation error (or clear diagnostic)

UNIT TESTS (REQUIRED)
Add pytest if missing and write:
- backend/tests/test_models_nodeinput.py

Run:
- python -m pytest -q

OUTPUT REQUIRED
- Updated models + passing tests
