# PHASE 01 — Semantics Lock + Canon Docs (V9)

Agent: `AGENT_V9_PHASE01_SEMANTICS` (assumed to exist in agentsV9.0.zip)

## Objective
Create a canonical, unambiguous definition of MINDV9 behavior so implementation does not drift.

## Why this phase exists (V8 reality)
In MINDV8.0:
- The compiler (`backend/mind_api/mind_core/compiler.py`) performs a reachable-walk and **hard-errors on cycles**.
- “Render/Theory” nesting implies a tree-like relationship, not a token-executed flow graph.
- There is no explicit definition of OR-merge vs AND-join vs fan-out parallelism.

V9 changes meaning, so the team needs a single source of truth.

## Deliverables
- `docs/V9_SEMANTICS.md`
- `docs/V9_NODE_TYPES.md` (Musical Thought vs Logic Thoughts)
- `docs/V9_RUNTIME_MODEL.md` (token model, quantization, safety caps)
- `docs/V9_UI_CONTRACT.md` (Switch/Join editors + Rivulet)

## Instructions
1. Write the 4 docs above using the definitions we agreed:
   - Stream = canvas + runtime + scheduler
   - Thought = musical pattern object + SoundFont instrument
   - Fan-out = parallel
   - Merge = OR by default
   - AND requires Join/Barrier node
   - Counter is pre-increment (0→1 on first hit)
   - Switch is conditional routing with branch table, First Match default, Default branch
   - Quantize node activations to next bar boundary by default
2. Add a short “V8 → V9 migration notes” section in `V9_SEMANTICS.md`
   - explicitly call out: cycles are allowed, “cycle detected” is no longer a normal error
3. Define “Draft vs Published Thought” and version pinning expectations.
4. Include 2 canonical example graphs in `V9_RUNTIME_MODEL.md`:
   - Loop N times then exit (Counter+Switch)
   - Parallel fan-out + Join barrier

## Files to change/create
Create:
- `docs/V9_SEMANTICS.md`
- `docs/V9_NODE_TYPES.md`
- `docs/V9_RUNTIME_MODEL.md`
- `docs/V9_UI_CONTRACT.md`

(Do not modify runtime code yet.)

## Completion checklist
- [ ] All four docs exist and are internally consistent
- [ ] Docs explicitly define OR-merge vs Join AND semantics
- [ ] Docs define the meaning of fan-out (parallel)
- [ ] Docs define Counter pre-increment behavior with a worked example
- [ ] Docs define Switch condition sources (Counter, BarIndex, Manual, Random seeded, Always)
- [ ] Docs define Rivulet harness controls and readiness checks

## Required tests
- [ ] None (documentation-only phase)

