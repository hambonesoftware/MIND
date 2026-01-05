# Phase 5 — Style-aware Pickers (Chord Progressions + Note Patterns)

## Objective
Replace the old “flat” preset lists with style-filtered pickers:
- Chord progression dropdown depends on Style
- Note pattern dropdown depends on Style
- Variants shown based on selected progression/pattern

This phase finishes the “style-driven authoring” feel.

## Primary agent
- Agent_Frontend_StyleCatalogResolver

## Supporting agents
- Agent_Frontend_ThoughtInspectorReorg
- Agent_QA_TestMatrixAndRegression

## Files to modify
- `frontend/src/ui/flowInspector.js`
- `frontend/src/music/styleCatalog.js`
- (optional) `frontend/src/music/patternCatalog.js`
- (optional) `frontend/src/music/harmonyCatalog.js`

## Tasks

### 5.1 Introduce stable IDs for note patterns
If needed, add:
- `notePatternId` as a stable selection
Map `notePatternId` => existing `patternType` (for V9.5 compatibility).
Examples:
- `arp_up_3` => `patternType = 'arp-3-up'`
- `arp_updown_4` => `patternType = 'arp-4-updown'`

### 5.2 Style-filtered progression picker
- Filter progression presets by `styleId`
- Provide a Variant dropdown filtered by preset
- When mode is Auto, show the resolved preset+variant read-only; allow “Override” to pick manually

### 5.3 Style-filtered note pattern picker
- Filter note patterns by `styleId`
- Show pattern-specific params only if supported later (out of V9.6 scope unless already present)

### 5.4 Harmony Mode UX cleanup
- Under Harmony section, show:
  - Harmony Mode (Auto/Override)
  - Mode-specific fields
- Ensure Custom progression and Single chord fields remain accessible.

## Testing that must pass
- Manual UI tests:
  - Style change updates available progression + pattern options
  - Existing values stay selected if still valid; otherwise fall back safely
  - Overrides persist across reload
- `cd backend && pytest -q`

## Success checklist
- [ ] Progression picker is style-aware
- [ ] Note pattern picker is style-aware
- [ ] Variants behave correctly
- [ ] Old raw fields still accessible in Advanced
- [ ] Backend tests pass
