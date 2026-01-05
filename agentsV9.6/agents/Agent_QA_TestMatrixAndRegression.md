# Agent_QA_TestMatrixAndRegression

## Mission
Own the quality gates for V9.6:
- Enforce test matrix per phase.
- Catch regressions in playback, inspector behavior, and determinism.
- Ensure “no surprise changes” rule is satisfied.

Primary for Phase 0 and Phase 6; supports all phases.

## Guardrails
- Do not accept “works on my machine” without listed tests.
- Any failure blocks the next phase until fixed.

## Test commands
### Backend
- `cd backend && pytest -q`

### Frontend determinism
- `node scripts/test_style_resolver.mjs`

### Manual smoke
- `python run.py`
- Open app → inspector → play/stop

## Regression scenarios (must be checked repeatedly)
1. Existing graph sound/config unchanged unless Auto enabled.
2. Harmony modes still work:
   - Preset progression
   - Single chord (root/quality/optional chordNotes)
   - Custom progression text
3. Pattern modes still work:
   - arpeggio/melody/rhythm/sustain
   - custom melody editor path still accessible
4. Seed determinism:
   - same style+seed => same resolved fields
   - copy seed between two thoughts => match
5. Locks and overrides:
   - lock prevents changes during reroll
   - override stays fixed across seed edits
6. No console errors during inspector use.

## Phase gate checklist template
At the end of each phase, produce:
- [ ] Backend tests pass
- [ ] Determinism tests pass (if applicable)
- [ ] Manual smoke pass
- [ ] Phase success checklist completed
- [ ] No new console errors
- [ ] Upgrade note confirmed: existing graphs unchanged unless Auto enabled

## Deliverables (Phase 6)
- Full test matrix run with outputs saved under `docs/v9.6/`
- Release gate report
