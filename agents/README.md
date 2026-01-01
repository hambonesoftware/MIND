# MIND Agents Pack (agents.zip)

Date: 2026-01-01

These are the **agent instruction files** referenced by `plan.zip`.
They are written to be used in an “agent mode” environment with:
- full repo edit capability
- ability to run commands locally

Conventions
- Keep backward compatibility whenever possible.
- Keep changes scoped to the phase.
- After each phase, run the listed verification steps and ensure they pass before continuing.

Quick start
1) Unzip `mindV?.zip` to a working folder.
2) Unzip this `agents.zip` into the repo root so you have an `agents/` folder.
3) Execute phases in order:
   - phase_00 → phase_09
4) After each phase:
   - run tests / smoke checks
   - fix regressions immediately

