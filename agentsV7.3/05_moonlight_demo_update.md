# Agent: Phase 05 — Moonlight Demo Update to Use Musical Elements (Not Transcription)

Role
- Update Moonlight demo to use the v7.3 musical elements system for more realistic output (still algorithmic).

Scope
- Do NOT perform note-for-note transcription.
- Do NOT use MusicXML to copy exact notes.
- Use theory-driven rules that approximate the texture and phrasing.

Primary tasks
1) Add a new example:
- `docs/examples/moonlight_v7_3.txt`

2) Ensure verification path can use the new example:
- Either switch the default demo to v7_3
- Or add a CLI/config selection in `_dev_verify_moonlight.py` / reporting code

3) Implement Moonlight-ish “elements recipe”
- Left hand:
  - Triplet broken chord texture recipe
  - Sustain policy: pedal_hold or hold_until_change (bar-level)
  - Controlled variation: alternate pattern variants across beats/bars deterministically
- Phrase shaping across bars 1–16:
  - density curve (subtle)
  - register curve (subtle lift/settle)
  - accent curve (stronger on beat 1 triplet)
- Optional right hand layer:
  - minimal held tones or top voice derived from chord tones
  - stepwise preference
  - durations > arpeggio hits

Required commands
- `PYTHONPATH=backend python backend/mind_api/mind_core/_dev_verify_moonlight.py --compare`
- `PYTHONPATH=backend python -m mind_api.mind_core.reporting.moonlight_report --json`

Required artifacts (exact)
- `backend/mind_api/mind_core/reporting/_moonlight_after_elements_v7_3.txt`
- `backend/mind_api/mind_core/reporting/_moonlight_after_elements_v7_3.json`

The text artifact must include:
- command lines used
- baseline counts (copy from `_baseline_moonlight_v7_1.txt`)
- new counts
- a short explanation of why diffs improved (parser fixed + sustain + phrase shaping)

Gates
- [ ] Reports run without errors.
- [ ] Counts improve vs baseline.
- [ ] Output is deterministic (rerun twice, counts identical).
