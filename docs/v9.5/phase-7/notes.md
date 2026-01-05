# Phase 7 — Moonlight Treble Template

- Added a “Insert Moonlight Treble (Bars 1–16)” template button in the inspector when nothing is selected.
- Template creates Start → Intro → {Triplets, Melody} fan-out, sets grids (1/12 intro/triplets, 1/16 melody), and initializes custom melody bars for 12-bar authoring (bar 1 seeded with Preset A + starter notes).
- Duplicate insertions auto-suffix node ids to avoid collisions while keeping edges valid; nodes are positioned for quick visibility.
