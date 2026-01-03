# Orchestrator Prompt (Agent Mode)

You are operating in ChatGPT Codex / agent mode with access to:
- a local working directory containing `MINDV8.0` (unzipped)
- the plan files from `planV9.0.zip` available alongside this agents pack

## Mission
Upgrade MINDV8.0 to MINDV9.0 as defined in the plan and glossary:
- Stream becomes the **graph canvas + playback engine**
- Thoughts become reusable musical pattern objects (include **instrument preset** from sf2/sf3)
- Logic Thoughts: Start / Counter / Switch / Join
- Fan-out = parallel; Merge = OR; AND = explicit Join
- Loops are allowed; no cycle compile errors
- Add a Rivulet Lab Preview UI docked above Stream
- Replace static DAG compilation with token-based Stream runtime + explicit runtime state round-tripping
- Provide clear debug trace and execution highlighting

## Operating rules
- Follow phases in order (00 → 09).
- At the end of each phase:
  1) Run the required commands/tests
  2) Collect required evidence (logs, screenshots where specified)
  3) Update the phase checklist in the phase file (append a completion note)

## Finish criteria
All checklists in all phases are complete and `CHECKLIST_MASTER.md` from the plan is satisfied.

## Phase sequence
Run these playbooks in order:
- phases/AGENT_PHASE_00_BASELINE_AUDIT.md
- phases/AGENT_PHASE_01_SEMANTICS.md
- phases/AGENT_PHASE_02_GRAPH_SCHEMA_AND_MIGRATION.md
- phases/AGENT_PHASE_03_STREAM_RUNTIME.md
- phases/AGENT_PHASE_04_LOGIC_THOUGHTS_AND_EDITORS.md
- phases/AGENT_PHASE_05_MUSICAL_THOUGHT_AND_INSTRUMENT.md
- phases/AGENT_PHASE_06_RIVULET_LAB_PREVIEW.md
- phases/AGENT_PHASE_07_UI_POLISH_N8N.md
- phases/AGENT_PHASE_08_ACCEPTANCE_DEMOS.md
- phases/AGENT_PHASE_09_HARDENING_TESTS_RELEASE.md
