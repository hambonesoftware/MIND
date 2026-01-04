# Phase 04 — Custom Melody Data Model + Compile Payload

**Agent reference (assumed to exist):** `agentsV9.5/Phase_04_CustomMelody_DataModelAndPayload_Agent.md`

## Purpose
Add the minimal “Custom Melody” capability to Thought nodes so the treble melody can be authored accurately without redefining Thought globally.

We keep existing “Generated” behavior for harmony/arp use-cases, and add a new mode:
- Thought.melodyMode: `generated | custom`

## Scope
- Frontend: node params schema + inspector UI scaffolding + payload wiring
- Backend: request schema accepts custom fields (no compile yet; Phase 05 handles that)

## Data model (minimal)
Add these parameters to Thought:

- `melodyMode`: `'generated' | 'custom'` (default `'generated'`)
- `customMelody` (only used when `melodyMode==='custom'`):
  - `grid`: `'1/16' | '1/12' | ...` (default `'1/16'`)
  - `bars`: array of bar entries (indexed from 0 within the thought)
    - each bar entry:
      - `rhythm`: string of step tokens (visual editor writes this)
        - recommended tokens:
          - `9` = note-on at this step
          - `-` = hold/tie from previous note
          - `.` = rest
      - `notes`: string containing space-separated note names/pitches
        - consumed in order by each `9` in rhythm

Optional but recommended:
- `voiceTag` or `midiChannel`: helps isolate concurrent voices later

## Implementation steps

### 4.1 Add schema/defaults
Update node registry so Thought nodes include:
- `melodyMode` default
- `customMelody.grid` default
- `customMelody.bars` default sized to `durationBars` (or lazy-expand on edit)

### 4.2 Update inspector UI (scaffolding only)
In Thought editor:
- Add a selector: Melody Mode (Generated / Custom)
- When Custom selected:
  - show Grid selector
  - show Bar selector (bar 1..N within thought)
  - show placeholder areas for:
    - Rhythm Editor (graphical latch strip) — implemented in Phase 06
    - Notes editor (text list) — minimal text list is OK now

### 4.3 Ensure payload carries these values
Update compile payload builder so custom fields reach backend unchanged.

### 4.4 Backend request schema accepts custom
Wherever you validate node params on backend, ensure these fields do not get dropped.

## Files to change
Frontend:
- `frontend/src/state/nodeRegistry.js`
- `frontend/src/ui/flowInspector.js`
- `frontend/src/state/compilePayload.js`

Backend:
- request model/schema file(s) that validate node params (location varies)
- No compiler logic change yet

## Success checklist
- [ ] You can create a Thought and set Melody Mode = Custom.
- [ ] You can edit bar 1 rhythm string and note list (even if crude for now).
- [ ] Saving/reloading preserves the custom fields.
- [ ] Compile payload includes `melodyMode` + `customMelody` fields.

## Required tests
- [ ] Frontend build passes.
- [ ] Manual: open devtools, confirm payload includes the new fields when playing/compiling.
