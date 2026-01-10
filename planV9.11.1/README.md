# planV9.11.1 — Guided Thought Builder Modal + Contracts/Immutables + Preview

This plan upgrades **MindV9.10** to a new authoring structure:

- **Stream Workspace stays a node canvas** (Start → nodes → End/Render; resequence/branch/loop unchanged)
- **Thought authoring becomes a vertically guided modal** (Option B) that writes an **Intent** object
- **Top-of-modal playback bar** previews **the full Thought** while editing
- Output is protocol-ready with **versioned contracts** and **immutables** (canonical keys)

## Global rules (apply to every phase)

### Contracts
- Contracts live in `docs/contracts/`.
- Contracts are versioned and **immutable**: never rename/remove fields.
- You may add new optional fields or extend enum values **only if the contract explicitly says it is extensible**.

### Immutables
- Canonical key strings live in:
  - `frontend/src/music/immutables.js`
  - `backend/mind_api/mind_core/immutables.py`
- New code must **not** introduce raw string literals for Intent/Compiled keys.
  - Use the immutables exports instead.

### File size (Separation of concerns)
- A repo-wide 1000-line limit is enforced in **Phase 08**.
- Earlier phases may temporarily exceed it, but any file you touch should trend downward.
- For new UI work, split into multiple files from day one (wizard steps, preview helpers, etc.).

## Templates included
This plan zip includes ready-to-copy templates under `planV9.11.1/templates/`:

- `templates/contracts/*` → copy to `docs/contracts/`
- `templates/immutables/*` → copy to repo paths
- `templates/scripts/*` → copy to `scripts/`

Phases reference these templates so instructions stay minimal and exact.

## Standard test commands used by this plan

Frontend (repo root):
- `node scripts/test_style_catalog_coverage.mjs`
- `node scripts/test_style_resolver.mjs`

Backend:
- `cd backend && python -m pytest -q`

New audits (added in this plan):
- `node scripts/audit_no_placeholders.mjs`
- `MAX_LINES=5000 node scripts/audit_file_lengths.mjs` (Phase 00 smoke)
- `node scripts/audit_contracts.mjs`
- `node scripts/audit_immutables.mjs`
- `node scripts/audit_no_raw_thought_keys.mjs`
- `node scripts/test_no_truncated_preset_strings.mjs` (Phase 02)
- `node scripts/test_pattern_variety_role_motion.mjs` (Phase 03)
