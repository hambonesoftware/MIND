# Orchestrator — Running the phases

Use each phase file as a standalone agent prompt.
Recommended flow:

1) Open repo root
2) Run `python run.py` and confirm baseline audio
3) Execute phases in sequence:

- agents/phase_00_baseline_and_hygiene.md
- agents/phase_01_frontend_workspace.md
- agents/phase_02_frontend_payload_graph.md
- agents/phase_03_backend_models_rendernode.md
- agents/phase_04_backend_compiler_graph_traversal.md
- agents/phase_05_backend_postprocessors.md
- agents/phase_06_equation_parser_ast.md
- agents/phase_07_lattice_solver_theory.md
- agents/phase_08_integrate_equation_and_render.md
- agents/phase_09_demos_docs_acceptance.md

Stop rules:
- If any phase breaks existing playback for a known-good `beat(...)` node, stop and fix before continuing.
- If tests fail, fix them before continuing.
- Keep diffs minimal per phase; do not “pre-implement” future phases unless required.

