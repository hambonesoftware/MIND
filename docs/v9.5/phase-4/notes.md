# Phase 4 — Custom Melody Compile

## Updates
- Added custom melody compile path in the backend runtime: parses `customMelody` bars (grid, rhythm with holds, note list) and produces events tagged with `sourceNodeId`.
- Added warning diagnostics for missing bars/rhythm or insufficient notes.
- Added backend tests for custom melody event generation (holds + source tagging) and acceptance of custom melody schema.

## Tests
- `pytest -q backend/tests/test_custom_melody_compile.py`
