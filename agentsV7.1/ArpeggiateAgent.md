# ArpeggiateAgent — Add mode=tones + order/start handling

## Mission
Extend arpeggiate so it can generate tone-order arpeggios for a voiced chord without octave-bin bouncing.

## Inputs
- Repo zip
- Step file: `planV7.1/04_STEP_Add_Arpeggiate_Mode_Tones.md`

## Outputs
- Updated `apply_arpeggiate` implementation
- Updated solver integration (if needed)
- Tests covering:
  - legacy behavior unchanged
  - new mode=tones behavior correct
- Green suite + server smoke

## Files (expected)
- Modify: `backend/mind_api/mind_core/motions/arpeggiate.py`
- Modify: `backend/mind_api/mind_core/solver.py` (if kwargs pass-through lives here)
- Add: `backend/tests/test_arpeggiate_modes.py`

## New behavior specs
- Default remains old behavior (register-based)
- If `mode=tones`:
  - `pattern=low-mid-high` maps to tone indexes [0,1,2] by default
  - `order=5-1-3` remaps to [2,0,1] for triads (root=0, third=1, fifth=2)
  - `start=N` rotates into the order cycle
  - if `chord_by_step` is provided, pick chord = chord_by_step[step]

## Must-run
- `pytest -q`
- `python run.py`

## Fix loop
- If default mode changes output:
  - revert default branch to old logic
  - confine new behavior strictly to mode=tones
  - add regression test for old output shape
