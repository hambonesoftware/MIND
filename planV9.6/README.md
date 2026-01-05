# planV9.6 — Thought “Style + Seed + Auto Options” Inspector Reorg

Date: 2026-01-05

## Goal
Reorganize the **Thought** inspector to match the new authoring model:

**Core**
- Label
- DurationBars
- Key
- Style
- Instrument (Auto-from-style or Override)

**Style Options** (collapsed by default)
- Seed (first)
- Note Pattern (Auto/Override + optional Lock)
- Chord Progression (Auto/Override + optional Lock)
- Harmony Mode (Auto/Override + optional Lock)
- Feel defaults (grid/syncopation/warp/intensity) (Auto/Override + optional Lock)
- Register min/max (Auto/Override + optional Lock)

### Critical constraint (V9.6 scope)
**Do not change backend runtime semantics.**
V9.6 is a **frontend + data-model UX upgrade** that writes into the existing V9.5 param fields so playback/compile remains stable.

## High-level approach
We will implement a **deterministic style resolver** in the frontend:
- Inputs: `styleId`, `styleSeed`, and “Auto/Override/Lock” selections
- Output: concrete existing Thought params (`progressionPresetId`, `patternType`, `rhythmGrid`, etc.)

We will store *style metadata* (styleId/seed/modes/locks/overrides) alongside the existing params for forward compatibility.

## Repos / paths
This plan assumes the codebase structure inside `MINDV9.5.zip`:
- `frontend/src/ui/flowInspector.js`
- `frontend/src/state/nodeRegistry.js`
- `frontend/src/state/flowGraph.js`
- (optional) `frontend/styles.css`
- Backend tests live in `backend/tests/`

## Agents assumed to exist (see agentsV9.6.zip)
- `Agent_Frontend_StyleCatalogResolver`
- `Agent_Frontend_ThoughtInspectorReorg`
- `Agent_Frontend_ThoughtMigrations`
- `Agent_QA_TestMatrixAndRegression`
- `Agent_Backend_RuntimeCompatibility`

## How to use this plan
Work phases in order:

- `phases/Phase_0_Baseline.md`
- `phases/Phase_1_StyleCatalog_SeedResolver.md`
- `phases/Phase_2_ThoughtSchema_Migrations.md`
- `phases/Phase_3_InspectorLayout.md`
- `phases/Phase_4_AutoOverrideLocks_Reroll.md`
- `phases/Phase_5_StylePickers_HarmonyPattern.md`
- `phases/Phase_6_Polish_Docs_Release.md`

## Required test gates
At minimum, every phase must finish with:
- `cd backend && pytest -q` (all backend tests pass)
- The phase-specific tests listed in that phase file
- The phase success checklist completed

See `docs/v9.6/test_matrix.md` for the full matrix.

## Definition of Done (DoD)
- Existing graphs load and play **without audible change** until the user enables Auto style options.
- Style Options show Seed first, with Reroll/Copy/Paste.
- Same (styleId, seed) yields the same resolved params deterministically.
- Auto/Override/Lock behavior is correct and intuitive.
- All tests pass.
