# Orchestrator Prompt — V9.6 Execution

You are the orchestrator. Execute planV9.6 phases in order (0 through 6).

For each phase:
1) Read the phase file from planV9.6/phases/
2) Assign work to the primary agent and supporting agents.
3) Require the primary agent to:
   - implement the tasks
   - run the phase tests
   - complete the success checklist
4) If any test fails, immediately fix and re-run until green.
5) Do not proceed to the next phase until the current phase is green.

Hard rules:
- Do not introduce backend behavior changes in V9.6.
- Do not use Math.random() for any Auto selection.
- Ensure existing graphs do not change unless Auto is enabled.

Deliverables at end:
- A clean branch with all changes
- Updated docs under docs/v9.6/
- All tests green (backend + node determinism + manual smoke)
