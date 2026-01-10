# Phase 04 — Style + Mood to Pattern Selection Heuristics (Make Defaults Match Intent)

## Objective
After wiring and validation are correct, improve compliance with style/mood intent by changing how defaults are chosen.

In MindV9.9, selection often ends up in fallback patterns because:
- catalogs are truncated,
- selection weighting is shallow,
- pattern families are not strongly tied to mood tags.

In V9.10:
- style membership (which patterns are candidates) is reliable,
- mood tags bias families and density,
- role influences which families are allowed by default.

## Components
Frontend selection:
- `frontend/src/music/styleResolver.js`
- `frontend/src/music/moodCatalog.js`
- `frontend/src/music/patternCatalog.js` (tags, capability requirements)
- `frontend/src/music/feelCatalog.js`
- `frontend/src/music/instrumentCatalog.js`
- `frontend/src/music/catalogSnapshot.json` (membership)

Optional backend refinements:
- `backend/mind_api/mind_core/style_lofi.py` (if any backend-side style transforms exist)

## Work items

### 4.1 Define family biases by (role, style, mood)
In `styleResolver.js`, introduce a clear, testable scoring model:
- Start with candidate patterns for the selected style from the snapshot membership list.
- Filter by contract allowlists (role/voice/capability).
- Score remaining candidates by:
  - overlap between mood tags and pattern tags
  - role-family preferences (Lead prefers Hook/Riff over Walking, Bass prefers Walking/Pulse over Stabs, etc.)
  - energy and complexity fields
- Pick deterministically using the existing seeded RNG.

The scoring must be visible for debugging:
- Expose an optional “resolver diagnostics” object in resolved output (or behind a debug flag),
  including top 5 candidates and scores.

### 4.2 Make “auto” choices stable but meaningful
When beginner fields are `auto`:
- ensure choices remain stable for a given seed, but change when reroll changes
- ensure style and mood changes perturb the sub-seeds so selection changes

### 4.3 Ensure defaults avoid ArpTexture unless user selects it
Default selection policy:
- For Lead and Bass in `auto` pattern mode:
  - avoid ArpTexture unless no other patterns are available for the style
- For Harmony:
  - allow ArpTexture as a minority option, but prefer Stabs/Pad/Pulse families
- For Drums:
  - never use ArpTexture; drum patterns must be percussive generators

## Testing
Automated:
- Extend `scripts/test_style_resolver.mjs` with fixtures:
  - same seed + style/mood => same pattern id
  - changing mood shifts the selected family in expected direction
  - Lead defaults are rarely ArpTexture
- Add backend or python audit for arp dominance in Phase05.

Manual:
- In UI, create 4 thoughts with the same seed:
  - change only mood and confirm audible and visible pattern family changes
  - change only style and confirm pattern family and instrument suggestions change

## Success checklist
- [ ] Resolver includes family/mood based scoring
- [ ] Diagnostics available for debugging
- [ ] Default selection avoids ArpTexture where appropriate
- [ ] Determinism preserved
- [ ] Node script tests updated and passing
