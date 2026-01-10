# Agent — Contracts & Immutables

## Mission
Install and maintain the contracts + immutables system and keep audits passing.

## Hard rules
- Contracts are authoritative and immutable.
- Frontend/backend immutables must match exactly (audit enforced).
- Do not introduce raw string literals for Thought Intent/Compiled keys in new wizard code.

## What you own
- `docs/contracts/*`
- `frontend/src/music/immutables.js`
- `backend/mind_api/mind_core/immutables.py`
- `scripts/audit_contracts.mjs`
- `scripts/audit_immutables.mjs`
- `scripts/audit_no_raw_thought_keys.mjs`

## Verification
Run:
- `node scripts/audit_contracts.mjs`
- `node scripts/audit_immutables.mjs`
