# Agent — Protocol & Schema

## Mission
Make export/import protocol-ready with versioned root, schema, and round-trip safety.

## Deliverables
- `docs/mind-protocol/schema/*`
- `docs/mind-protocol/examples/*`
- Backend round-trip test: `backend/tests/test_protocol_round_trip.py`

## Rules
- Include: protocolVersion, graphVersion, resolverVersion, nodes, edges
- Preserve unknown `extensions` fields (round-trip safe)

## Verification
- `cd backend && python -m pytest -q`
