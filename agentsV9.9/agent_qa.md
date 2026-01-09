# agent_qa — Testing, Regression, Release Checks (V9.9)

## Mission
Verify correctness, determinism, migration safety, and usability for the redesigned Thought Inspector + Preset Code workflow.

## Primary scope
Phases: 03–08 (tests + checklists)

## Required test categories
### 1) Preset Code
- Round-trip: decode(encode(settings)) == canonical(settings)
- Canonicalization: different orderings normalize to same code
- Invalid code handling: no state corruption
- Unknown fields ignored safely
- Migration: PS1->PS2 (if PS2 introduced)

### 2) Deterministic compile
- Same code+GV compiles identical artifact across runs
- Different reroll compiles different artifact
- Output changes require GV bump (check version stamps)

### 3) UI workflows
- Beginner can create a thought:
  - select Role/Voice/Style/Instrument/Pattern
  - rebuild
  - hear difference when changing Energy/Pattern
- Paste code restores knobs
- Reroll changes only reroll field and changes output after rebuild (or auto)

### 4) Migration/regression
- Existing projects open and play
- Legacy thoughts map to preset codes
- No crashes on load

## Deliverables
- A QA report per phase with:
  - tests run (commands)
  - results
  - issues found + severity
  - pass/fail of phase checklist

## Success checklist
- [ ] All unit tests pass
- [ ] Integration flows pass
- [ ] Determinism tests pass
- [ ] Migration tests pass
- [ ] Beginner UX smoke test passes in ≤5 minutes
