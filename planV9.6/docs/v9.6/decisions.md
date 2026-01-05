# V9.6 Decisions (Style + Seed Thought UX)

## D1 — Backward compatibility strategy
**Decision:** Keep existing V9.5 Thought param fields as the runtime source of truth.
- We will *add* style metadata fields in V9.6.
- The frontend resolver writes concrete values into the existing fields when Auto is enabled.
**Rationale:** Avoid backend changes and protect playback correctness.

## D2 — Determinism definition
**Decision:** “Same seed + same style + same overrides” must produce the same resolved params.
Determinism applies to:
- Selection of progression preset + variant (when Auto)
- Selection of note pattern (when Auto)
- Selection of feel defaults (grid/syncopation/warp/intensity) (when Auto)
- Optional: instrument preset and register range when Auto

## D3 — Seeded RNG implementation
**Decision:** Use a seeded PRNG (e.g., mulberry32 or xorshift32) — **no Math.random()** for any Auto choice.
**Decision:** Derive sub-seeds by hashing:
- styleSeed
- styleId
- node id (stable node.id)
- namespace string (e.g., “harmony”, “pattern”, “feel”, “instrument”, “register”)

## D4 — Catalog-driven options
**Decision:** The style resolver must take all candidates from a catalog file.
We will add:
- `frontend/src/music/styleCatalog.js` (or .json)
- `frontend/src/music/styleResolver.js`
**Rationale:** Adding styles/patterns later should be “data entry”, not UI surgery.

## D5 — List ordering stability
**Decision:** When selecting an index from candidates, candidates must be sorted by stable ID.
**Rationale:** Prevent seed results from shifting when the UI order changes.

## D6 — Migration defaults for existing graphs
**Decision:** Existing thoughts default to “manual / legacy” behavior:
- styleId = 'legacy'
- styleSeed = 0
- All Style Options set to Override by default
**Rationale:** No surprise sound changes on upgrade.

## D7 — UX grouping
**Decision:** Group Harmony + Pattern under Style Options, with Seed first.
**Rationale:** Reduces noise; matches how users think (“choose a vibe, then tweak”).

## D8 — Explicit “Advanced” escape hatch
**Decision:** Keep an Advanced section that exposes the original raw fields.
**Rationale:** Power users and debugging; reduces fear of losing control.
