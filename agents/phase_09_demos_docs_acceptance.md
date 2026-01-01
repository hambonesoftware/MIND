You are ChatGPT in Agent Mode with full repo-edit + local execution capability.

PHASE: 09 — Demos + docs + acceptance
REF: plan.zip → PHASE_09_Demos_Docs_Acceptance.md

PRIMARY GOALS
1) Provide demo workspaces and example scripts:
   - Moonlight: theory + render
   - Wonderwall (Oasis): theory + render (strum+perc)
   - Wonderwall (Ryan): theory + render (arpeggiate, minimal perc)
2) Add optional “Load Demo Workspace” button in UI.
3) Update docs to explain Theory vs Render, nesting, and extension patterns.
4) Add troubleshooting notes (SF2 optional, fallback engine).

FILES TO MODIFY
- README.md
- docs/whitepapers/mind_language_v0_1.md
- docs/whitepapers/mind_overview.md
- docs/whitepapers/runtime_and_timing.md
Optional frontend:
- frontend/src/main.js (Load Demo Workspace button)
- frontend/src/state/session.js (save/load workspace JSON)

OPTIONAL AUTOMATION
- Add a Playwright smoke test (only if you already use Playwright).

SUCCESS CHECKLIST
- [ ] User can load demo workspace and press Play
- [ ] Moonlight demo produces continuous arpeggiated texture
- [ ] Wonderwall demos differ primarily by render
- [ ] Docs explain the model clearly

VERIFICATION
- python -m pytest -q
- python run.py → load demos → press Play
