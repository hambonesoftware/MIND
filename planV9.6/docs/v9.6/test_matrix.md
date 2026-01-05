# V9.6 Test Matrix

This matrix defines the minimum tests that must pass at each phase gate.

## Backend (must always pass)
- Command:
  - `cd backend`
  - `pytest -q`

## Frontend / Node (new in V9.6)
### Determinism resolver test (new)
- Command:
  - `node scripts/test_style_resolver.mjs`
- Verifies:
  - Same inputs => same outputs
  - Different seeds => different outputs (at least one field changes)
  - Locks prevent changes
  - Overrides prevent changes

### Manual UI smoke (must be done at least once per phase)
- Start app:
  - `python run.py`
- In the browser:
  1. Load an existing saved graph (or default demo)
  2. Ensure Thought nodes appear and inspector opens
  3. Ensure Play/Stop works
  4. Ensure no console errors

## Phase-specific tests
See each phase file’s “Testing that must pass” section.

## Regression scenarios (high priority)
1. Existing graph sound does not change (unless user enables Auto).
2. Custom Melody editor still works (`melodyMode = custom`).
3. Harmony modes:
   - Single chord
   - Preset progression
   - Custom progression
4. Flow runtime:
   - fan-out concurrency test graphs still compile/play
5. Determinism:
   - same seed yields same resolved values
