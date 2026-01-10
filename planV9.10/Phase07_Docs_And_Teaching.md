# Phase 07 — Docs and Teaching (Make the System Understandable)

## Objective
Update documentation so contributors understand:
- the Pattern Contract
- how style + mood selection works
- what fields control what
- how to debug pattern selection

## Components
Docs:
- Add/Update: `docs/contracts/pattern_contract.v1.md`
- Add: `docs/v9.10/pattern_wiring_and_debugging.md`
- Optional update: `README.md` (root)

UI:
- Optional: add a “Why this pattern?” tooltip that uses resolver diagnostics (if Phase04 added them)

## Work items

### 7.1 Write a debugging guide
Create `docs/v9.10/pattern_wiring_and_debugging.md` including:
- How `pat` in preset code becomes `notePatternId`
- Where the frontend resolver chooses defaults (`styleResolver.js`)
- Where the backend enforces routing (`stream_runtime.py`)
- How to run audits and interpret failures

### 7.2 Document the “no silent fallback” policy
Ensure the docs clearly state:
- Only ArpTexture patterns may route to generic arp texture
- Any other mismatch is a compile error

## Testing
Manual:
- A new contributor can follow the doc to:
  - add a new pattern id to contract
  - wire it to a backend generator
  - see it appear in the UI

## Success checklist
- [ ] v9.10 docs exist and are accurate
- [ ] Pattern contract docs match actual enforcement
- [ ] Debugging steps are actionable
