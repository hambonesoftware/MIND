You are ChatGPT in Agent Mode with full repo-edit + local execution capability.

PHASE: 00 — Baseline sanity + repo hygiene
REF: plan.zip → PHASE_00_Baseline_and_Hygiene.md

PRIMARY GOALS
1) Confirm the app boots and existing beat nodes still parse/compile/play.
2) Remove distribution artifacts (no feature changes):
   - remove backend __pycache__ and .pyc
   - ensure .git/ is excluded from deliverable zips
3) Record SoundFont decision (SF2 optional vs required). Do NOT invent the file.

DO NOT
- Change runtime behavior
- Refactor code
- Modify audio engines
- Add new endpoints

STEPS
A) Boot smoke test
1) From repo root:
   - python run.py
2) Load the app in the browser.
3) Confirm Play produces sound for an existing known-good beat node.

B) Endpoint sanity
1) Trigger /api/parse for a beat node (via UI or curl).
2) Trigger /api/compile for barIndex=0 and confirm it returns events.

C) Hygiene cleanup
1) Delete any backend __pycache__ folders and .pyc files.
2) Update .gitignore (only if needed) to ignore:
   - __pycache__/
   - *.pyc
3) Ensure your packaging step excludes .git/.
   - If you have a build script, adjust it.
   - If you zip manually, document: “exclude .git/”.

D) SoundFont note
1) Check whether assets/soundfonts/General-GS.sf2 exists.
2) If missing:
   - Do NOT add a placeholder binary.
   - Document that SF2 is optional and fallback engine is used.
3) If present locally (not in repo):
   - Ensure dev console logs it loaded (later phases may add this).

SUCCESS CHECKLIST
- [ ] python run.py starts without errors
- [ ] Existing beat node plays audio
- [ ] /api/parse and /api/compile succeed for beat nodes
- [ ] No backend __pycache__ / .pyc tracked
- [ ] Distribution zip excludes .git/

VERIFICATION COMMANDS
- python run.py
Optional:
- python -c "import compileall; import sys; sys.exit(0)"

OUTPUT REQUIRED
- Updated repo (no feature changes)
- Short note in README or docs about SF2 decision (optional)
