# Phase 3 — Custom Melody Schema

## Changes
- Added Thought defaults and param schema for `melodyMode` (`generated`/`custom`) and `customMelody` (grid + bars array) in the frontend node registry.
- Ensured flow graph normalization preserves these fields when loading/saving graphs.
- Backend CompileRequest now validated against a sample graph containing customMelody fields via a regression test.

## Verification
- Ran `pytest -q backend/tests/test_custom_melody_schema.py`.
