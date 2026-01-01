# Step 03 — Add robust motion kwarg parsing (MotionParserAgent)

## Goal
Replace the brittle motion parsing (`_pattern_from_motion`) with a small parser that can extract:
- motion name
- kwargs (string/int/bool tokens without quotes)

So motion strings like:
`arpeggiate(pattern=low-mid-high,mode=tones,voicing=moonlight,order=5-1-3,start=0)`
can be parsed reliably.

## Agents
- MotionParserAgent (primary)
- TestHarnessAgent
- RegressionFixAgent

## Files
- Modify: `backend/mind_api/mind_core/solver.py`
- Add: `backend/mind_api/mind_core/motions/motion_call.py` (recommended utility)
- Add tests: `backend/tests/test_motion_call_parser.py`

## Instructions
1) Implement `parse_motion_call(text: str) -> (name: str, kwargs: dict[str,str])`
   - Accept `name(...)` and `name` (no parens)
   - Inside parens, split on commas at top-level (no nesting needed for v7.1)
   - Parse `key=value` pairs where value is a raw token (e.g. `tones`, `moonlight`, `0`, `low-mid-high`)
   - Ignore/strip whitespace
2) In solver:
   - Replace `_pattern_from_motion()` usage with the new parser.
   - Keep backward compatibility:
     - old motion strings must still work:
       - `arpeggiate(grid=1/12, pattern=low-mid-high-mid)`
       - `sustain(chord)`
3) Add tests:
   - parses arpeggiate example
   - parses sustain example
   - ignores unknown kwargs safely (or surfaces a diagnostic if your project supports it)

## Success checklist
- [ ] motion parsing handles new kwargs without breaking old motion strings
- [ ] `pytest -q` passes

## Must-run tests
- `pytest -q`

## Fix loop (if errors occur)
- If any existing scripts break, RegressionFixAgent must:
  - add a regression test capturing the old behavior
  - update parser to handle that case
  - keep behavior stable unless explicitly changed by v7.1 spec
