# Step 05 — Add chord symbols + slash bass (ChordSymbolAgent)

## Goal
Allow `harmony=` plan segments to use chord symbols in addition to Roman numerals, e.g.:
- `C#m/G#`
- `G#7`
- `G#7sus4`
- `Bmaj7`
- `Gdim7`

This is required so Moonlight can specify its inversion/register intent cleanly.

## Agents
- ChordSymbolAgent (primary)
- TheoryVoicingAgent
- SolverIntegrationAgent
- TestHarnessAgent
- RegressionFixAgent

## Files
- Add: `backend/mind_api/mind_core/theory/chord_symbols.py`
- Modify: `backend/mind_api/mind_core/solver.py`
- Modify: `backend/mind_api/mind_core/theory/__init__.py` (exports)
- Add tests: `backend/tests/test_chord_symbols.py`

## Instructions
1) Implement chord symbol parsing:
   - Parse root note name A–G with optional accidental (# or b)
   - Parse quality:
     - major (default), minor (m), dim (dim), aug (aug)
     - sus4
   - Parse extensions:
     - 7, maj7, dim7
   - Parse slash bass `/X` (root note name)
2) Convert to pitch classes (0–11). Support enharmonic spellings required for C# minor context.
3) Return chord pitch classes in **ordered form**:
   - If slash bass is present: bass pitch class must be first.
   - Remaining chord tones follow in musically sensible order (root/third/fifth/7th).
4) Integrate into solver:
   - When harmony symbol begins with [A-G], use chord symbol parser.
   - Otherwise, treat it as Roman numeral and call `resolve_roman(...)`.
5) Add tests for:
   - `C#m` => [C#, E, G#]
   - `C#m/G#` => [G#, C#, E] (bass first)
   - `G#7` => [G#, B#, D#, F#] (pitch classes)
   - `G#7sus4` => [G#, C#, D#, F#] (or your chosen consistent sus voicing)
   - `Bmaj7` => [B, D#, F#, A#]

## Success checklist
- [ ] chord symbols compile without exceptions
- [ ] slash bass forces bass-first ordering
- [ ] roman numerals still work unchanged
- [ ] `pytest -q` passes

## Must-run tests
- `pytest -q`

## Fix loop (if errors occur)
- If chord spelling ambiguity causes failures, RegressionFixAgent must:
  - lock down the pitch-class mapping in tests
  - keep consistent internal conventions (e.g., # preferred in sharp keys)
