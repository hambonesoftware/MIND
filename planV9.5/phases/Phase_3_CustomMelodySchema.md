# Phase 3 — Thought Schema Extensions for Custom Melody (Data/Contracts)

## Objective
Add the minimal fields required to represent Moonlight treble melody accurately:
- A Thought can remain “generated” OR switch to “custom melody”
- Custom melody stores:
  - grid (e.g., 1/16)
  - per-bar rhythm step states (note-on, rest, hold/tie)
  - explicit notes aligned to note-on steps

No UI yet. This phase is purely:
- schema
- defaults
- compile payload wiring
- persistence

## Agent(s) (from agentsV9.5.zip)
- `Agent_Frontend_SchemaAndPayload`
- `Agent_Backend_SchemaValidation`

## Files to change
Frontend
- `frontend/src/state/nodeRegistry.js` (extend thought paramSchema + defaults)
- `frontend/src/state/compilePayload.js` (ensure custom fields are included)
- `frontend/src/state/flowGraph.js` (ensure serialization / runtime store won’t drop fields)

Backend
- Wherever node params are validated/typed (examples):
  - `backend/mind_api/mind_core/models.py`
  - `backend/mind_api/mind_core/validate.py`
  - (adjust to your actual structure)

## Proposed minimal fields
Within Thought params:
- `melodyMode`: `"generated" | "custom"`
- `customMelody` object:
  - `grid`: `"1/16" | "1/12" | ..."`
  - `bars`: array of bar entries (relative to this Thought’s local bar index)
    - `rhythm`: serialized step string (example: `9..9--..` / `9.-.` etc)
    - `notes`: explicit pitch sequence (space-separated or array)

Notes on representation
- Keep the serialized rhythm string as the canonical storage format.
- The graphical editor (Phase 5) will edit this string.
- Holds/ties should be representable (recommend `-` = hold).

## Implementation steps
1) Add schema and defaults so existing Thoughts remain valid (default = generated).
2) Ensure compile payload includes:
   - the entire flowGraph state
   - the node params including new fields
3) Add a small payload snapshot test (if you have test infra):
   - create a thought with customMelody filled
   - assert payload includes it

## Success checklist
- [ ] Existing projects load without migration errors
- [ ] New fields persist through save/load cycles
- [ ] Backend accepts payload with customMelody fields (even if ignored for now)
- [ ] A Thought can be marked custom without UI

## Stop / Hold criteria
Stop if:
- Adding fields breaks existing graph load
- Backend rejects payload due to schema strictness (fix validation, not UI)

