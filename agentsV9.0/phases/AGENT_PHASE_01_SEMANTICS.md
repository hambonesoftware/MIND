# AGENT PHASE 01 — Semantics Lock + Canon Docs

Plan reference: `phases/PHASE_01_SEMANTICS.md`

## Goal
Commit V9 semantics into repo docs so implementation can be verified against the agreed rules. This phase produces the canonical reference used by all subsequent phases.

## Primary touch-points (MINDV8.0)
- Docs: create/update `docs/` (or `docs/v9/`) for V9 semantics
- Frontend: none required beyond linking docs
- Backend: none required beyond referencing docs in comments (optional)

## Step-by-step actions
1) Create a V9 docs folder (e.g., `docs/v9/`).
2) Write canon documents:
   - `SEMANTICS.md` (Stream/Thought definitions, fan-out/merge/join rules, loop rules)
   - `NODE_TYPES.md` (Musical Thought vs Logic Thoughts; required fields)
   - `SWITCH_EDITOR_SPEC.md` (UI behavior and condition sources)
   - `JOIN_SPEC.md` (AND barrier semantics)
   - `RIVULET_LAB_SPEC.md` (lab preview UI behavior)
3) Ensure the docs explicitly state:
   - Stream is the canvas + runtime + scheduler (no separate MindFlow)
   - Merge is OR by default
   - AND requires Join node
   - Counter pre-increment semantics
   - Musical Thoughts include sf2/sf3 instrument preset selection
4) Add a short “V9 acceptance demos” section describing Moonlight loop demo.

## Evidence to capture
- Git diff showing new docs added
- A single place (README or docs index) linking to V9 docs

## Completion checklist (must be explicit)
- [ ] V9 semantics docs exist and match the agreed rules
- [ ] Node type definitions are explicit (fields, defaults, required/optional)
- [ ] Switch + Join + Counter semantics are unambiguous
- [ ] Instrument requirement for Thoughts is explicit (sf2/sf3 preset)


## Notes / Decisions (append as you work)
- 
