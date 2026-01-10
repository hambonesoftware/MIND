# planV9.10 — Make Style + Mood Actually Control Note Patterns (No More “3 Arps”)

This plan upgrades MIND so that **most selectable “note patterns” are real generators** (not labels that collapse to `arp-3-up/down/skip`),
and so that **style + mood** materially influence the resulting rhythm and melodic motion.

This plan is designed specifically for the current MindV9.9 code layout:

## Current relevant components in MindV9.9 (observed)
Frontend:
- `frontend/src/ui/flowInspector.js`  
  - Owns the Thought Inspector UI and also currently contains preset-code parsing/building logic.
- `frontend/src/state/nodeRegistry.js`  
  - Defines the `thought` node schema and defaults, including `notePatternId` and legacy `patternType`.
- `frontend/src/state/compilePayload.js`  
  - Normalizes thought params and resolves style outputs before sending `/compile`.
- `frontend/src/music/*`  
  - `styleResolver.js`, `resolveThought.js`, `normalizeThought.js`
  - catalogs: `styleCatalog.js`, `moodCatalog.js`, `patternCatalog.js`, `feelCatalog.js`, `harmonyCatalog.js`, `instrumentCatalog.js`
  - snapshot: `catalogSnapshot.json`

Backend:
- `backend/mind_api/routes.py` — `/compile`
- `backend/mind_api/models.py` — request/response models
- `backend/mind_api/mind_core/compiler.py` + `stream_runtime.py` — compiles and generates events
- `backend/mind_api/mind_core/music_elements/texture_engine.py` — texture/pattern generation

Existing scripts/tests:
- Node scripts: `scripts/test_style_catalog_coverage.mjs`, `scripts/test_style_resolver.mjs`
- Pytests: `backend/tests/test_style_patterns_realness.py` and other `test_style_*` tests

## Root cause we are fixing
In MindV9.9, many catalog and default strings contain truncated tokens like `...` (literal ellipses),
which breaks matching and causes the resolver to fall back to default/legacy patterns.
Separately, many pattern labels still map to the same underlying 3-note arp families.

## Phase index
- Phase00_RepoIntegrity_NoTruncation.md
- Phase01_PatternContract_SourceOfTruth.md
- Phase02_Frontend_Wiring_PresetCode_Module.md
- Phase03_Backend_GeneratorRouting_StrictValidation.md
- Phase04_StyleMood_To_PatternSelection_Heuristics.md
- Phase05_Audits_And_RegressionTests.md
- Phase06_PresetLibrary_Curation.md
- Phase07_Docs_And_Teaching.md
- Phase08_Release_Gates.md

## Definition of Done (V9.10)
- No user-facing catalog or default contains placeholder ellipses (guarded by automated checks).
- A pattern shown in the UI must exist in a contract and must resolve to a real backend generator.
- Only patterns explicitly labeled as Arp Texture are allowed to route to generic arp texture.
- Style + mood changes produce meaningfully different default pattern families for Lead/Harmony/Bass/Drums.
- All required tests pass (pytest + node scripts + new audits).

## Required commands (must pass by Phase08)
- `python -m pytest -q`
- `node scripts/test_style_catalog_coverage.mjs`
- `node scripts/test_style_resolver.mjs`
- `python scripts/audit_no_truncation.py`
- `python scripts/audit_pattern_contract.py`
- `python scripts/audit_arp_dominance.py`
