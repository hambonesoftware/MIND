# Phase 07 — MIND Protocol Export/Import + Schema Assets

## Objective
Make export/import protocol-ready:
- Versioned root object keys (contracted)
- Round-trip safe load/save
- Schema and example assets ready for open source

## Changes

### A) Protocol root versioning
Ensure the exported graph includes:
- `protocolVersion`
- `graphVersion`
- `resolverVersion`
- `extensions` (optional object)

Update export/import code where the graph is serialized/deserialized.

### B) Add schema + examples
Create:
- `docs/mind-protocol/schema/mind_protocol_root.schema.json`
- `docs/mind-protocol/examples/` (tiny, medium)

### C) Add a round-trip test
Create:
- `backend/tests/test_protocol_round_trip.py`

Test:
- Load an example protocol JSON
- Save it back
- Assert stable keys preserved; unknown fields not dropped

## Tests that must be run (and pass)
From repo root:

- `cd backend && python -m pytest -q`

## Success checklist
- ✅ Exported JSON matches the protocol root contract shape
- ✅ Import/export round-trip preserves meaning and unknown extensions
- ✅ Docs and examples exist and are ready to publish
