# PHASE_00 — Baseline sanity + repo hygiene

Agent reference (assumed to exist):
- `agents/phase_00_baseline_and_hygiene.md`

## Goal
Lock a known-good baseline and remove zip artifacts that will confuse future diffs and CI.

## Scope
- NO feature changes.
- Ensure the project boots and existing `beat(...)` nodes still work.
- Remove stray compiled artifacts and oversized folders from the repo zip output.

## Files to change / create
### Remove from distribution artifacts
- `.git/` (entire folder)
- `backend/**/__pycache__/`
- `backend/**/*.pyc`

### Update ignore rules (optional but recommended)
- `.gitignore` (repo root)

## Step-by-step
1) Boot check (baseline)
   - From repo root: `python run.py`
   - Open the app in browser.
   - Confirm you can press Play and hear the fallback audio (or SF2 if configured).

2) Endpoint sanity
   - Ensure `/api/parse` accepts an existing `beat(...)` node.
   - Ensure `/api/compile` returns events for `barIndex=0`.

3) Hygiene
   - Delete `backend/mind_api/__pycache__` and `backend/mind_api/mind_core/__pycache__` and any `.pyc` files.
   - Ensure you do NOT include `.git/` in future zips.

4) SoundFont availability (note)
   - Your repo currently includes `assets/soundfonts/.keep` but not `General-GS.sf2`.
   - Decide one of:
     A) Keep fallback sample engine as default, OR
     B) Add `assets/soundfonts/General-GS.sf2` locally (not necessarily committed) and ensure the SF2 engine loads it.
   - This phase does not require changing behavior; it only records the decision.

## Success checklist
- [ ] `python run.py` starts without errors
- [ ] Existing `beat(...)` scripts still parse and play
- [ ] No `__pycache__` or `.pyc` files remain in the repo tree
- [ ] No `.git/` folder included in distribution zips
- [ ] You wrote down whether SF2 should be required or optional for dev

## Unit testing / verification
This phase is a smoke-test phase.

Manual verification:
- [ ] App loads in browser
- [ ] Press Play on a known working node and hear audio

Optional automated check (backend):
- Create `backend/tests/test_boot.py` (you will do this in Phase 03 when pytest is added).
- For now, just confirm boot manually.
