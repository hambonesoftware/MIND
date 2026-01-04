# agentsV9.5 — Codex Agent Pack (MIND)

These agents are designed to execute the work described in **planV9.5.zip**.

Principles:
- One phase per PR/branch (recommended).
- Make changes minimal and testable.
- Prefer explicit logs over silent failure.
- Never introduce breaking schema changes without migrations/defaults.

## How to use

1) Open `ORCHESTRATOR.md`
2) Start at Phase 0 and run the referenced agent(s)
3) After each phase:
   - run checks
   - record results under `docs/v9.5/phase-N/`
   - only then proceed

## Output expectations per phase

- Phase 0: baseline logs + screenshots
- Phase 1: gesture-gated audio + stable engine init
- Phase 2: backend tests that lock fan-out semantics
- Phase 3: schema/payload persistence for custom melody
- Phase 4: backend custom melody compilation + sourceNodeId tagging
- Phase 5: UI editor for rhythm + notes (no typing `9..9`)
- Phase 6: playing-thought glow driven by events
- Phase 7: Moonlight treble template + validation runbook
