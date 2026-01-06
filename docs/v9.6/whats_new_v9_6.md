# What's New in V9.6 — Thought Style + Seed

## Highlights
- Deterministic style authoring: Style + Seed drives Auto selections for harmony, pattern, feel, instrument, and register with locks and overrides.
- Style-aware pickers: progression and pattern dropdowns filter to the active style with variant handling and safe fallbacks.
- Inspector reorg: Core, Style, Style Options (collapsed by default), and Advanced (legacy/raw) layout with seed actions (Reroll/Copy/Paste).

## Upgrade Notes
- Existing graphs remain unchanged until Auto is enabled; legacy values are preserved and loaded with “override” semantics.
- Style catalog IDs and seeds together produce deterministic outputs; changing the catalog may change resolved outputs unless versioned.
- Custom text fields (progressionCustom, chordNotes) are never overwritten by Auto.

## Known Limitations
- Catalog is minimal for V9.6; expanding it later may alter Auto results for the same seed unless catalog versions are introduced.
- Copy/Paste seed relies on clipboard availability in the host browser.
