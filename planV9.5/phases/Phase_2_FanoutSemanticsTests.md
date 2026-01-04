# Phase 2 — Verify + Lock Fan-out Semantics with Tests

## Objective
Confirm and lock the runtime semantics you rely on for Moonlight:
- Thought node with multiple outgoing edges = **send token to ALL** (fan-out)
- Start node may remain sequential/queued (current behavior), but must be explicit and tested

## Agent(s) (from agentsV9.5.zip)
- `Agent_Backend_RuntimeSemantics`
- `Agent_QA_BackendTests`

## Files to change/create
- `backend/mind_api/mind_core/stream_runtime.py` (ideally no behavior change)
- `backend/tests/test_fanout_semantics.py` (new)
- Any existing test utilities used to instantiate runtime

## Implementation steps
1) Add tests that build a minimal flow graph:
   - Start → ThoughtA
   - ThoughtA → ThoughtB
   - ThoughtA → ThoughtC
2) Drive the runtime across a bar boundary where ThoughtA completes.
3) Assert:
   - Both ThoughtB and ThoughtC become active at the same logical time
   - Both produce events in subsequent compile windows
4) Add a second test for Start behavior:
   - Start with two outgoing edges
   - Assert sequential launch/queue behavior (documented)

## Success checklist
- [ ] Tests pass locally and in CI
- [ ] Behavior is explicit in tests (no “assumed” semantics)
- [ ] No regressions in other runtime tests

## Stop / Hold criteria
Stop if:
- Tests reveal semantics differ from expectations (e.g., Thought picks only one edge)
- You discover the UI disallows multi-edge creation (Phase 6 will cover the UX; runtime must still be correct)

