# Phase 02 — Thought Intent/Compiled + Back-Compat + Remove Truncation

## Objective
Introduce the new two-layer Thought structure:
- **Intent**: what the user means (guided modal writes this)
- **Compiled**: resolved machine choices used for rendering (deterministic)

Maintain backward compatibility with existing V9.10 graphs.

## Changes

### A) Extend the Thought node schema
Edit:
- `frontend/src/state/nodeRegistry.js`

Add new fields under Thought:
- `intent` (object) — matches `mind_thought_intent.contract.v1.json`
- `compiled` (object) — matches `mind_thought_compiled.contract.v1.json`

Rules:
- Keep existing fields for back-compat
- Do not remove/rename existing keys
- Defaults must not include truncated placeholder strings

### B) Normalize older graphs into Intent
Edit/add:
- `frontend/src/music/resolveThought.js`
- (optional) new helper `frontend/src/music/thoughtIntentNormalize.js`

Behavior:
- If `intent` is missing, derive it from existing fields:
  - `styleId`, `styleSeed`, `moodId`, style option modes/locks/overrides, etc.
- Do not mutate original objects in-place; return new objects.

### C) Compile from Intent deterministically
Update `resolveMusicThought` so that:
- It calls the style resolver using `intent` (not ad-hoc fields)
- It writes results into `compiled`
- It keeps existing `resolved` structure updated (for old code paths)

### D) Remove truncated preset code defaults
In `frontend/src/state/nodeRegistry.js`, remove any defaults like `MIND|...` that contain ellipsis truncation.
- Set defaults to `''` (empty) or a fully valid preset string (no ellipsis).

### E) Add a truncation test
Copy:
- `planV9.11.1/templates/scripts/test_no_truncated_preset_strings.mjs` → `scripts/test_no_truncated_preset_strings.mjs`

This test must fail if any `MIND|` preset string contains `...`.

## Tests that must be run (and pass)
From repo root:

- `node scripts/test_no_truncated_preset_strings.mjs`
- `node scripts/audit_contracts.mjs`
- `node scripts/audit_immutables.mjs`
- `node scripts/audit_no_placeholders.mjs`
- `MAX_LINES=5000 node scripts/audit_file_lengths.mjs`
- `node scripts/test_style_catalog_coverage.mjs`
- `node scripts/test_style_resolver.mjs`
- `cd backend && python -m pytest -q`

## Success checklist
- ✅ New graphs save with `intent` + `compiled`
- ✅ Old graphs load and resolve correctly (no missing fields)
- ✅ No truncated preset strings remain
