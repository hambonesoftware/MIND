# MIND V9 Node Types

This document defines the canonical node types for MIND V9. Terms used here must match `V9_SEMANTICS.md`.

## Musical Thought (pattern node)
A Musical Thought is a pattern object with harmonic context, timing settings, and an instrument preset.

**Required fields**
- `id`: unique node identifier.
- `type`: `thought` (or equivalent UI label).
- `pattern`: rhythmic/pitch pattern data.
- `timing`: grid, swing, warp, duration controls.
- `context`: key/chord context.
- `instrument`: **SoundFont preset selection** (sf2/sf3).

**Optional fields**
- `register`: octave/register offset.
- `humanize`: micro-timing/jitter parameters.

## Logic Thoughts
Logic Thoughts are control-flow nodes. They do **not** own audio transport.

### Start
- Emits one token at stream start.
- Output ports: 1 flow output.

### Counter
- Maintains a counter state.
- **Pre-increment:** increments on token hit, then emits the updated value for downstream use.
- Output ports: 1 flow output.

### Switch
- Routes incoming token to one of N branches.
- First-match rules; default branch if none match.
- Condition sources: **Counter**, **BarIndex**, **Manual**, **Random (seeded)**, **Always**.
- Output ports: N flow outputs.

### Join (Barrier)
- AND-join semantics. Releases a token only when **all required inputs** arrive within the barrier window.
- Output ports: 1 flow output.

## Port semantics
- All control-flow ports are `flow`.
- Musical Thoughts consume `flow` and emit `events` downstream to the scheduler.

## Versioning
- **Published Thoughts** are immutable and version-pinned by referencing nodes.
- **Draft Thoughts** can be modified without bumping a version.
