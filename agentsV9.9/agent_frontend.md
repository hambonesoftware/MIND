# agent_frontend — UI/UX + Inspector Implementation (V9.9)

## Mission
Implement the Thought Inspector redesign:
- Beginner-first controls
- Advanced expansion panels
- Preset Code field (copy/paste)
- Dirty indicator + Rebuild button
- Pattern/Instrument menus filtered by Voice Type and Role defaults

## Primary scope
Phases: 01, 02, 03, 05, 06, 07 (UI), 08 (UI QA)

## Deliverables
- Updated inspector UI (Beginner default)
- Preset Code display/entry with validation feedback
- Rebuild status row
- Advanced panels for sub-controls (Phase 05)
- Preset library and recent presets UI (Phase 06)
- Guidance polish: “What you’re hearing”, reroll UX, rebuild toast (Phase 07)

## UI Contract (Beginner knobs)
- Role (Intro/Verse/Pre/Chorus/Bridge/Outro/Fill)
- Voice Type (Auto/Lead/Harmony/Bass/Drums/FX)
- Style (family list)
- Instrument (curated by voice type)
- Pattern (curated by voice type)
- Mood, Energy, Complexity, Variation
- Length (2/4/8/16)
- Register (Low/Mid/High) if included

## Interaction rules
- Any knob change updates the in-memory settings and updates displayed Preset Code (canonical).
- Dirty indicator toggles when current Preset Code differs from last compiled Preset Code.
- Rebuild button triggers compilation via backend API or local compile service.
- Reroll button changes only reroll component in Preset Code.

## Testing you must run
- Frontend unit tests (if present)
- Manual smoke test:
  1) Change knob → code updates → dirty indicator shows
  2) Rebuild → dirty clears → playback changes
  3) Paste valid code → knobs snap correctly
  4) Paste invalid code → error shown, knobs unchanged
  5) Voice Type switch → pattern list updates

## Success checklist
- [ ] Beginner inspector is compact and usable
- [ ] Preset Code field works (copy/paste/validate)
- [ ] Role + Voice Type filter menus and change defaults
- [ ] Rebuild loop is clear and reliable
- [ ] Advanced panels exist and persist state
- [ ] Reroll preserves settings and changes output
