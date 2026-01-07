# planV9.8 — “Joined Musical Thought Params” (Minimized)

Goal: Reduce the visible parameter surface for **Music Thought** in MIND v9.7 by introducing **joined/grouped param objects** with **progressive disclosure**, while keeping **full backward compatibility** with existing saved thoughts and node JSON.

This plan is written for **ChatGPT Codex** to execute in order.

---

## Definition of Done (DoD)

### Functional
- A Music Thought supports **both**:
  - **Legacy flat params** (v9.7 keys), and
  - **Joined params** (new grouped objects) **without breaking playback**.
- Inspector UI offers **Simple / Advanced / Expert** views:
  - Simple: quick creation (few fields)
  - Advanced: musician-level controls
  - Expert: raw overrides + legacy knobs (if still needed)
- The compile/playback pipeline accepts joined params as the primary input; legacy keys are treated as fallback.
- Existing projects/thoughts load and play **unchanged**.

### Compatibility
- No breaking changes to existing stored documents: old nodes still render in the UI and compile/play.
- Joined params can be introduced incrementally; migration is optional but supported.

### Quality
- No console errors in dev.
- Lint + unit tests (if present) pass.
- A small set of manual smoke tests (defined in Phase 0) pass.

---

## Primary files involved (expected)
- `frontend/src/state/nodeRegistry.js` (param schema + defaults)
- `frontend/src/ui/flowInspector.js` (inspector UI + option lists)
- `frontend/src/state/compilePayload.js` (compile-time normalization)
- `frontend/src/music/*` catalogs (pattern/harmony/feel/instrument resolver helpers)
- Anywhere “style resolver” currently lives (may be in `frontend/src/music/`)

---

## New joined objects (target shape)

These will become the **preferred** schema, while legacy keys remain supported.

- `style`
- `harmony`
- `pattern`
- `feel`
- `voice`
- (optional) `resolved` (compile-time resolved output; see Phase 3)

### Joined objects (recommended minimal schema)

```js
style: {
  id,                  // formerly styleId
  seed,                // formerly styleSeed
  mood: { mode, id },  // formerly moodMode, moodId
  resolution: {
    modes,             // formerly styleOptionModes
    locks,             // formerly styleOptionLocks
    overrides          // formerly styleOptionOverrides
  },
  ui: { dropdownViewPrefs } // formerly dropdownViewPrefs (UI-only)
}

harmony: {
  mode: "single" | "preset" | "custom",
  single: { root, quality, notesOverride },
  preset: { id, variantId, chordsPerBar, fill, length },
  custom: { roman, variantStyle, chordsPerBar, fill, length }
}

pattern: {
  mode: "generated" | "custom",
  generated: { id },
  custom: { grid, bars }
}

feel: {
  mode: "preset" | "manual",
  presetId,
  manual: { grid, syncopation, warp, intensity }
}

voice: {
  soundfont,
  preset,
  register: { min, max }
}
```

---

## Execution order
1) Phase 0 — Baseline + guardrails
2) Phase 1 — Schema join + normalization shim
3) Phase 2 — Inspector progressive disclosure UI
4) Phase 3 — “resolved” output + optional migration helpers

