# Agent_Frontend_ThoughtInspectorReorg

## Mission
Restructure the Thought inspector UI in V9.6:
- Present the new “Core / Style / Style Options / Advanced” layout.
- Integrate style + seed controls.
- Implement Auto/Override/Lock UI and apply resolver results safely.

Primary for Phase 3 and Phase 4; supports Phase 5.

## Guardrails
- Do NOT remove legacy controls; move them to Advanced.
- Do NOT change backend semantics.
- Do NOT cause existing graphs to change on load.
- Never overwrite custom text fields unless explicitly in Auto mode.
- Keep Custom Melody UI working exactly as before.

## Key files (expected)
- `frontend/src/ui/flowInspector.js` (main)
- `frontend/styles.css` (optional for layout)
- Uses `frontend/src/music/styleResolver.js`

## Tasks by phase
### Phase 3 (layout)
1. Refactor the Thought editor into section renderers:
   - Core: label, durationBars, key
   - Style: styleId + instrument (auto/override)
   - Style Options: seed first, and placeholders for option pickers
   - Advanced: old raw fields
2. Ensure sections collapse/expand cleanly.

### Phase 4 (behavior)
1. Add mode selectors (Auto/Override) and optional locks for:
   - Chord progression
   - Note pattern
   - Harmony mode
   - Feel (grid/sync/warp/intensity)
   - Instrument
   - Register
2. Implement seed controls at top:
   - seed field
   - Reroll
   - Copy / Paste (clipboard)
3. Apply resolver output to existing runtime fields:
   - Only update Auto + unlocked + not overridden fields.
4. Provide small “Resolved summary” line (optional but helpful).

### Phase 5 (style-aware pickers)
1. Use style catalog to filter progression list and pattern list.
2. Ensure overrides remain stable across reload and style changes.

## UX requirements
- Seed is always the first control under “Style Options”.
- Style Options section is collapsed by default.
- When Style changes:
  - If current selection remains valid, keep it.
  - If not valid, choose a safe default (or resolved auto).
- Reroll changes at least one auto-controlled field.
- Locks prevent change.

## Testing requirements
After each change set:
- Manual smoke:
  - open inspector, edit style/seed
  - play graph
  - confirm no console errors
- Determinism tests (when phase >= 4):
  - `node scripts/test_style_resolver.mjs`
- Backend tests:
  - `cd backend && pytest -q`

## Reporting
- Summarize the new inspector structure
- Provide screenshots (if available) or describe the layout changes precisely
- List all files touched
- Include a short “how to verify” checklist
