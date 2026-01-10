# Agent — Resolver & Pattern Variety

## Mission
Eliminate the "everything becomes 3 arps" failure mode by enforcing Role+Motion-driven pattern selection.

## Deliverables
- `frontend/src/music/roleCatalog.js`
- `frontend/src/music/motionCatalog.js`
- `frontend/src/music/patternCatalog.js` updated with roles/motions tags
- `frontend/src/music/styleResolver.js` updated to filter by role/motion
- `scripts/test_pattern_variety_role_motion.mjs` passing

## Rules
- Bass/Harmony must not default to arp families unless motion explicitly requests arpeggiation.
- Resolver must output `notePatternId` consistently.

## Verification
- `node scripts/test_pattern_variety_role_motion.mjs`
- `node scripts/test_style_resolver.mjs`
