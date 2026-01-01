# Agents referenced by planV7.1 (assumed to exist)

This plan is written as if the following agents already exist and can be invoked with repo-edit + local execution:

- **RepoAuditAgent**
  - Scans repo structure, confirms baseline tests, records current behavior.
- **TheoryVoicingAgent**
  - Owns theory voicing changes (ordering, moonlight voicing preset).
- **MotionParserAgent**
  - Implements robust parsing of motion calls and kwargs inside `motions="...; ..."` strings.
- **ArpeggiateAgent**
  - Extends `apply_arpeggiate()` to support `mode=tones`, `order=`, `start=`, and step-wise chords.
- **ChordSymbolAgent**
  - Adds chord symbol parsing (e.g. `C#m/G#`, `G#7sus4`, `Bmaj7`) and integrates it into solver.
- **HarmonyPlanAgent**
  - Adds beat-aware harmony segments (e.g. `4.2-4.3:G#7`) while keeping bar ranges backward compatible.
- **SolverIntegrationAgent**
  - Updates `solve_equation_bar()` to resolve harmony per-step when required, and to pass motion kwargs through.
- **TestHarnessAgent**
  - Adds unit tests + dev verification scripts, ensures backward compatibility tests continue to pass.
- **RegressionFixAgent**
  - When tests fail, iterates quickly: reproduce → isolate → fix → rerun until green.
- **ReleaseAgent**
  - Updates docs/examples, runs final full suite, and prepares v7.1 notes.

If an agent is missing functionality, treat that as a bug in the agent layer and route to **RegressionFixAgent** with clear repro steps.
