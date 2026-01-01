# ReleaseAgent — final verification + docs + packaging

## Mission
Prepare MindV7.1 release readiness:
- update dev verifier for new Moonlight motion signature
- add example docs
- run final commands and ensure clean output

## Inputs
- Repo after steps 1–10 are complete
- Step files:
  - `planV7.1/09_STEP_Update_Moonlight_Verify_and_Examples.md`
  - `planV7.1/11_STEP_Final_Full_Run_and_Packaging.md`

## Outputs
- Updated verifier: `backend/mind_api/mind_core/_dev_verify_moonlight.py`
- Example file in docs
- Final “release_checklist.md” with command outputs

## Final commands (must include output)
- `pytest -q`
- `python backend/mind_api/mind_core/_dev_verify_moonlight.py`
- `python run.py`

## Fix loop
- If any fails, route to RegressionFixAgent with:
  - exact failing command
  - full output
  - suspected module
Then rerun all final commands.
