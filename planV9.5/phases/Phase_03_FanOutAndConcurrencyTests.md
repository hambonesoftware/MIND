# Phase 03 — Fan-out + Concurrency Semantics (Tests + UI Constraints)

**Agent reference (assumed to exist):** `agentsV9.5/Phase_03_FanOutAndConcurrencyTests_Agent.md`

## Purpose
Lock in the correct semantics for Moonlight treble layering:

- **Thought fan-out = send to all outgoing edges** (concurrent)
- **Start sequential = send to one and queue others** (current behavior)

Also ensure the editor can create multiple outgoing edges from a Thought output (UX prerequisite).

## Scope
- Backend runtime semantics tests
- Frontend UI validation: allow multiple edges from a Thought output port

## Implementation steps

### 3.1 Backend tests for semantics
Add tests proving:
1) A Thought with 2 outgoing edges creates 2 active tokens in the next tick.
2) A Start node with 2 outgoing edges schedules sequentially (queued), not concurrent (unless you explicitly change it later).

### 3.2 Frontend edge creation policy
Confirm/implement:
- For Thought output ports: allow multiple edges
- If you must restrict (for UX simplicity), then create a Split node (NOT preferred for Moonlight treble)

This phase expects you keep fan-out enabled for Thought outputs.

### 3.3 Document the rules
Update `docs/v9.5/decisions.md` with:
- “Start is sequential; Thought fan-outs are concurrent.”

## Files to change/create
Backend:
- `backend/mind_api/mind_core/stream_runtime.py` (no semantic change required unless tests reveal bugs)
- `backend/tests/test_flow_fanout_semantics.py` (new)

Frontend:
- `frontend/src/ui/flowCanvas.js` (edge creation constraints)
- Possibly `frontend/src/state/flowGraph.js` (edge store rules, if any)

Docs:
- `docs/v9.5/decisions.md`

## Success checklist
- [ ] Backend tests pass proving fan-out and sequential behavior.
- [ ] UI allows drawing 2+ edges from a Thought output without deleting prior edge.
- [ ] Docs updated.

## Required tests
- [ ] `pytest -q` passes (includes new tests).
- [ ] Manual: create a Thought, connect out → Thought1 and out → Thought2; both edges remain.
