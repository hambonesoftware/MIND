You are ChatGPT in Agent Mode with full repo-edit + local execution capability.

PHASE: 07 — Lattice + theory + solver (equation → events)
REF: plan.zip → PHASE_07_Lattice_Theory_Solver.md

PRIMARY GOALS
1) Implement Lattice (canonical time grid for a bar) and conversion to Event[].
2) Implement minimal tonal theory:
   - key parsing
   - roman numeral chord resolution (major/minor; harmonic minor V in minor)
   - harmony plan parsing (bar ranges)
   - deterministic voicing to MIDI ranges
3) Implement motions:
   - sustain(chord): long durations at segment start only
   - arpeggiate(...): fill the grid with chord-tone traversal
4) Implement solver: solve_equation_bar(ast, barIndex, bpm) -> events (+ optional debug)

FILES TO CREATE
- backend/mind_api/mind_core/lattice.py
- backend/mind_api/mind_core/solver.py
- backend/mind_api/mind_core/theory/__init__.py
- backend/mind_api/mind_core/theory/key.py
- backend/mind_api/mind_core/theory/roman.py
- backend/mind_api/mind_core/theory/harmony_plan.py
- backend/mind_api/mind_core/theory/voicing.py
- backend/mind_api/mind_core/motions/__init__.py
- backend/mind_api/mind_core/motions/sustain.py
- backend/mind_api/mind_core/motions/arpeggiate.py
- backend/mind_api/mind_core/_dev_verify_moonlight.py

TESTS TO CREATE (REQUIRED)
- backend/tests/test_lattice.py
- backend/tests/test_theory_roman.py
- backend/tests/test_theory_harmony_plan.py
- backend/tests/test_solver_smoke.py

IMPLEMENTATION NOTES
- Keep solver bar-local but allow events with durationBeats > 4 to represent segment sustains.
- Voicing policy must be deterministic; document ranges.
- Arpeggiate should be able to emit 12 onsets per bar for grid 1/12.

SUCCESS CHECKLIST
- [ ] Solver returns deterministic events for a simple equation
- [ ] sustain emits long notes only at segment starts
- [ ] arpeggiate emits consistent onsets each bar
- [ ] moonlight dev verifier prints stable event summaries
- [ ] tests pass

RUN
- python -m pytest -q
- python backend/mind_api/mind_core/_dev_verify_moonlight.py (or equivalent module invocation)
