# Step 04 — Add `arpeggiate(..., mode=tones, order=..., start=...)` (ArpeggiateAgent)

## Goal
Extend arpeggiate so it can generate Moonlight’s “tone order” arpeggio
without bouncing between low/mid/high register bins.

New behavior:
- Default mode remains current register-based behavior.
- `mode=tones` interprets pattern tokens `low/mid/high` as **tone indexes** (0/1/2) within a voiced chord.
- `order=5-1-3` maps to tone-index order for triads (see instructions).
- `start=` provides an offset into the order cycle.

## Agents
- ArpeggiateAgent (primary)
- MotionParserAgent
- TestHarnessAgent
- RegressionFixAgent

## Files
- Modify: `backend/mind_api/mind_core/motions/arpeggiate.py`
- Modify: `backend/mind_api/mind_core/solver.py`
- Add tests: `backend/tests/test_arpeggiate_modes.py`

## Instructions
1) Update `apply_arpeggiate()` to accept optional keyword args:
   - `mode: str = "registers"`
   - `order: str | None = None`
   - `start: int = 0`
   - `chord_by_step: list[list[int]] | None = None`
2) Maintain legacy behavior:
   - If mode == "registers": use existing `chord_by_register` logic unchanged.
3) Implement `mode == "tones"`:
   - Determine the “base chord” per step:
     - if `chord_by_step` provided: chord = chord_by_step[step]
     - else: chord = chord_by_register[1] (mid) (fallback)
   - Choose tone index for each step:
     - Parse `pattern` via existing `_parse_pattern()` -> [0,1,2,...]
     - If `order` provided, remap indexes so:
       - For triads, interpret order numbers as chord degrees:
         - 1 = root (tone index 0)
         - 3 = third (tone index 1)
         - 5 = fifth (tone index 2)
       - Example `order=5-1-3` => cycle [2,0,1]
     - Apply `start` offset into the order cycle.
   - Pitch selected = chord[tone_index % len(chord)]
   - Add onset each step (dur_steps=1) as today.
4) Update solver to pass through kwargs:
   - parse arpeggiate motion call and feed `mode/order/start` into apply_arpeggiate.

## Success checklist
- [ ] Old arpeggiate still works without changes to scripts
- [ ] New mode=tones works for a simple triad (unit test)
- [ ] `pytest -q` passes

## Must-run tests
- `pytest -q`

## Fix loop (if errors occur)
- If deterministic tests break, RegressionFixAgent must:
  - ensure arpeggiate still emits same number of events for default mode
  - keep ordering stable for old scripts
