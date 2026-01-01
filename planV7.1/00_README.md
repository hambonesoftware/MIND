# planV7.1 — Moonlight-accurate equation engine upgrades

Goal: upgrade MindV7.0 → **MindV7.1** so that `equation(...)` can produce a Moonlight-like arpeggio texture with
correct inversion/register behavior and (optionally) beat-level harmonic motion.

This plan is **test-driven** and must remain **backward compatible** with existing scripts.

## Definition of Done (DoD)
- `pytest` passes with **zero** failures.
- `python run.py` starts the server with **no** tracebacks.
- Existing equation scripts still compile and play deterministically.
- New features work:
  - `arpeggiate(..., mode=tones, order=..., start=..., voicing=moonlight)`
  - chord symbols in `harmony=` (e.g. `C#m/G#`, `G#7sus4`) in addition to roman numerals
  - beat-aware harmony ranges (e.g. `4.2-4.4:G#7`) (Step 07+)
- Dev verification script confirms Moonlight bar 1 uses the expected pitch contour (see `snippets/expected_bar1_pitches.txt`).

## Must-run commands (every step that changes code)
- Install deps (first time only):
  - `python -m venv .venv`
  - Windows: `.venv\Scripts\activate`
  - mac/linux: `source .venv/bin/activate`
  - `pip install -r requirements.txt`
- Run unit tests:
  - `pytest -q`
- Smoke start server:
  - `python run.py`

## Step order
Execute files in numeric order:

01_STEP_Preflight_and_Baseline.md  
02_STEP_Fix_Voicing_Order.md  
03_STEP_Add_Motion_Kwarg_Parser.md  
04_STEP_Add_Arpeggiate_Mode_Tones.md  
05_STEP_Add_Chord_Symbols_and_Slash_Bass.md  
06_STEP_Add_Beat_Aware_HarmonyPlan.md  
07_STEP_Solver_Stepwise_Harmony.md  
08_STEP_Add_Moonlight_Voicing_Preset.md  
09_STEP_Update_Moonlight_Verify_and_Examples.md  
10_STEP_Add_Tests_and_Regression_Suite.md  
11_STEP_Final_Full_Run_and_Packaging.md  

## Reference snippet (target Moonlight equation for v7.1)
See: `snippets/moonlight_equation_v7_1.txt`
