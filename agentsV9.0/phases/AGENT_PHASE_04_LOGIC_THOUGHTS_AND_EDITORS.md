# AGENT PHASE 04 — Logic Thoughts + Switch/Join Editors

Plan reference: `phases/PHASE_04_LOGIC_THOUGHTS_AND_EDITORS.md`

## Goal
Implement Start, Counter, Switch, Join as logic node types in the runtime and provide the inspector/editor UI for Switch conditions and Join configuration.

## Primary touch-points (MINDV8.0)
Frontend:
- `frontend/src/ui/flowInspector.js` (editors)
- `frontend/src/ui/nodeCard.js` (visual badges: counter value, join waiting)
- `frontend/src/ui/flowPalette.js` (create logic nodes)
Backend:
- `backend/mind_api/...` runtime module for counter/switch/join semantics

## Step-by-step actions
1) Implement Counter semantics:
   - reset on Play (default)
   - pre-increment on enter (0→1 first hit)
2) Implement Switch semantics:
   - First match default (priority order = row order)
   - Condition sources: Counter compare, BarIndex compare, Manual, Random seeded, Always
3) Implement Switch Condition Editor UI (as spec’d):
   - branch table, labels, connected status, enabled checkbox, default branch
4) Implement Join semantics:
   - wait for all connected inputs
   - show waiting count
   - fire on next bar boundary
5) Add runtime visualization:
   - chosen switch branch highlights
   - join shows waiting progress
   - counter shows current value badge

## Evidence to capture
- Screenshot: Switch editor table and labeled output ports
- Screenshot: Join node showing “Waiting 1/2” while running
- Demo: loop N times then exit works

## Completion checklist (must be explicit)
- [ ] Counter increments on enter; first read is 1
- [ ] Switch first-match routing works and is editable in UI
- [ ] Join acts as explicit AND barrier and resets after firing
- [ ] UI shows live badges (counter value, join waiting)
- [ ] Loop demo (counter+switch) works deterministically


## Notes / Decisions (append as you work)
- 
