You are ChatGPT in Agent Mode with full repo-edit + local execution capability.

PHASE: 05 — Post-processors: strum + perc + render chain
REF: plan.zip → PHASE_05_Backend_PostProcessors.md

PRIMARY GOALS
1) Implement render transforms as event post-processors:
   - strum: stagger chord pitches in time
   - perc: generate drum events from step masks
2) Implement render chain that applies enabled transforms in order.
3) Wire render chain into compiler render node branch.
4) Keep transforms deterministic.

FILES TO CREATE
- backend/mind_api/mind_core/post/__init__.py
- backend/mind_api/mind_core/post/chain.py
- backend/mind_api/mind_core/post/strum.py
- backend/mind_api/mind_core/post/perc.py

FILES TO MODIFY
- backend/mind_api/mind_core/compiler.py

TEST FILES TO CREATE (REQUIRED)
- backend/tests/test_post_strum.py
- backend/tests/test_post_perc.py
- backend/tests/test_post_chain.py

IMPLEMENTATION DETAILS (MVP)
A) Strum
- Operate on events with pitches length >=2
- Convert spread_ms to beat offsets using bpm
- Apply direction pattern (default down/up)
- Emit N single-pitch events (or keep chord but add onsets; choose split)
- Reduce durations so they don’t overlap weirdly

B) Perc
- Parse grid string to steps_per_bar
- For each 'x' in mask, emit a short drum event at correct tBeat
- Use GM drum notes (kick 36, snare 38, hat 42)
- Lane assignment: 'kick','snare','hat' (or unified 'drums' if your system expects it; match your existing lanes)

C) Chain
- Apply strum then perc (perc appends)
- Return sorted events

SUCCESS CHECKLIST
- [ ] Render wrapper with strum changes chord timing
- [ ] Perc adds kick/snare/hat events per mask
- [ ] Disabled transforms do nothing
- [ ] Tests pass

RUN
- python -m pytest -q
- python run.py → manual listen test with a simple chord theory node wrapped in render
