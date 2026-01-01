# ORCHESTRATOR — how to apply agents to planV7.1

This file is a helper to map plan steps → agents.

## Step → Agents
01 Preflight + Baseline
- RepoAuditAgent (then RegressionFixAgent if needed)

02 Fix voicing order
- TheoryVoicingAgent + TestHarnessAgent
- RegressionFixAgent as needed

03 Motion kwarg parser
- MotionParserAgent + TestHarnessAgent
- RegressionFixAgent as needed

04 Arpeggiate mode=tones
- ArpeggiateAgent + MotionParserAgent + TestHarnessAgent
- RegressionFixAgent as needed

05 Chord symbols + slash bass
- ChordSymbolAgent + SolverIntegrationAgent + TestHarnessAgent
- RegressionFixAgent as needed

06 Beat-aware HarmonyPlan
- HarmonyPlanAgent + TestHarnessAgent
- RegressionFixAgent as needed

07 Solver step-wise harmony
- SolverIntegrationAgent + ArpeggiateAgent + HarmonyPlanAgent + ChordSymbolAgent + TestHarnessAgent
- RegressionFixAgent as needed

08 Moonlight voicing preset
- TheoryVoicingAgent + SolverIntegrationAgent + TestHarnessAgent
- RegressionFixAgent as needed

09 Update verifier + examples
- ReleaseAgent + TestHarnessAgent
- RegressionFixAgent as needed

10 Full regression suite
- TestHarnessAgent
- RegressionFixAgent as needed

11 Final run + packaging
- ReleaseAgent + RepoAuditAgent
- RegressionFixAgent as needed

## Non-negotiable
After every step that changes code:
- run `pytest -q`
- run `python run.py`

