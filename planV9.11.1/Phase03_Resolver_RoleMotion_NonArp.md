# Phase 03 — Resolver: Role/Motion + Non-Arp Defaults + Variety Test

## Objective
Stop the “everything becomes 3 arpeggios” failure mode by making pattern selection driven by:
- Role (lead/harmony/bass/drums/fx)
- Motion family (flowing, punchy, walking, choppy, swell, groove, fill)

## Changes

### A) Add role + motion catalogs
Create:
- `frontend/src/music/roleCatalog.js`
- `frontend/src/music/motionCatalog.js`

### B) Extend the pattern catalog with role/motion tags
Edit:
- `frontend/src/music/patternCatalog.js`

For each pattern entry, add:
- `roles: []`
- `motions: []`

Rebalance:
- Bass/Harmony recommended patterns must not default to arp families unless explicitly requested.

### C) Update styleResolver to filter patterns by role/motion
Edit:
- `frontend/src/music/styleResolver.js`

Add inputs (from Intent):
- `role`
- `motionId`

Pattern resolve logic:
- Filter candidate patterns by:
  - match role (or pattern has no roles meaning “generic”)
  - match motion (or generic)
- Apply “avoid arps” heuristics for Bass/Harmony unless motion explicitly says “arpeggiate”.

### D) Add a pattern variety test (role/motion)
Copy:
- `planV9.11.1/templates/scripts/test_pattern_variety_role_motion.mjs` → `scripts/test_pattern_variety_role_motion.mjs`

This script must:
- Sample multiple seeds for several (style, mood, role, motion) combinations
- Assert that unique `notePatternId` count meets a minimum threshold
- Assert that `arp-3-*` dominance stays under a max percentage for Bass/Harmony cases

## Tests that must be run (and pass)
From repo root:

- `node scripts/test_pattern_variety_role_motion.mjs`
- `node scripts/test_style_resolver.mjs`
- `cd backend && python -m pytest -q`

## Success checklist
- ✅ Role/Motion materially change selected `notePatternId`
- ✅ Bass/Harmony no longer default to arp families
- ✅ Variety test passes and prevents regressions
