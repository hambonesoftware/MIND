# Phase 06 — Preset Library Curation (Coverage Across Families, Styles, and Moods)

## Objective
Curate presets that:
- exercise non-arp generators,
- cover each style and mood with at least one strong example,
- serve as manual “golden” references for whether style/mood is working.

## Components
Frontend:
- `frontend/src/music/presetLibrary.js` (existing)
- `frontend/src/ui/flowInspector.js` (preset apply UI)

Backend:
- `/compile` pipeline (must compile each preset successfully)

Docs:
- Add `docs/presets/preset_library_v9_10.md`

## Work items

### 6.1 Expand preset library with coverage targets
For each style:
- At least 3 presets:
  - Lead-focused (Hook/Riff family)
  - Harmony-focused (Stabs/Pad/Pulse family)
  - Bass-focused (Walking/Pulse/Pedal family)
For Drums:
- At least 1 groove preset per style (or per 2 styles if shared)

Each preset entry must:
- specify `MIND|PS2|GV1|...` code with valid fields and a non-arp `pat` where intended
- include a short label and tags

### 6.2 Add a simple preset “golden check”
Add a lightweight script (node or python) that:
- compiles each preset
- asserts it produces events
- prints which pattern family was used

## Testing
Automated:
- run the preset compile check script and ensure no failures

Manual:
- in UI, apply a few presets and confirm they sound distinct

## Success checklist
- [ ] Preset library covers non-arp families per style
- [ ] Preset compile check script passes
- [ ] Presets are useful as golden references for QA
