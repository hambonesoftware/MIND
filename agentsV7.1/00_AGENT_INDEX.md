# agentsV7.1 — agent prompt pack for MindV7.1

This zip contains the **agent definitions/prompts** referenced by planV7.1.
Each agent file is written as an “Agent Mode” instruction set: what to read, what to change,
what to run, what to output, and the fix loop to reach a green state.

## How to use
- Follow `../planV7.1/00_README.md` step order.
- For each step file, invoke the named agent(s) and provide:
  1) the repo zip (MindV7.0.zip)
  2) the step file content
  3) any prior step artifacts (patches, logs)

## Hard rules
- Every code-changing step MUST end with:
  - `pytest -q` (0 failures)
  - `python run.py` (no tracebacks)
- If errors occur, the agent must fix and re-run until green.

## Agents included
- RepoAuditAgent
- TheoryVoicingAgent
- MotionParserAgent
- ArpeggiateAgent
- ChordSymbolAgent
- HarmonyPlanAgent
- SolverIntegrationAgent
- TestHarnessAgent
- RegressionFixAgent
- ReleaseAgent

## Outputs
Agents should output either:
- a patch zip (if used mid-stream), or
- the full updated repo zip at the end of v7.1 work.

