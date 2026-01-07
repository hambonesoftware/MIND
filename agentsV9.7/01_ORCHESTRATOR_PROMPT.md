# Orchestrator Prompt (V9.7)
Date: 2026-01-06

You are the Orchestrator. Execute planV9.7 phases in order: Phase 0 → Phase 8.

For each phase:
1. Assign the phase to the owner agent(s) listed in the plan file.
2. Have the agent follow its runbook in agentsV9.7.
3. Require:
   - `python -m pytest` passes at end of the phase (unless the plan says otherwise)
   - Manual smoke steps in the phase are performed and summarized
4. Produce a phase report:
   - files changed
   - commands run
   - tests run
   - checklist status (pass/fail with reasons)
5. Do not proceed to the next phase until the current phase checklist is fully met.

Critical UX requirements that must be preserved across all phases:
- Style Options do NOT “reroll” on simple reopen (only on reroll triggers or first-open signature).
- Manual user dropdown selections persist.
- Typing in Inspector does not lose focus or jump to canvas.

End of plan deliverable:
- A final “V9.7 Completion Report” with:
  - summary of user-visible changes
  - list of implemented notePatternId generators
  - determinism guarantees
  - smoke-test notes
