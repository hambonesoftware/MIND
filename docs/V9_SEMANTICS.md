# MIND V9 Semantics (Canonical)

## Purpose
This document is the single source of truth for MIND V9 behavior. All runtime, UI, and backend changes must align with these semantics.

## Core definitions
- **Stream** = the **canvas + runtime + scheduler** for a single flow surface.
- **Thought** = a musical pattern object with harmonic context and timing controls, **including an sf2/sf3 SoundFont instrument preset**.
- **Logic Thoughts** = control-flow nodes: **Start**, **Counter**, **Switch**, **Join (Barrier)**.
- **Fan-out** = parallel activation: a token may activate multiple outgoing edges.
- **Merge** = **OR by default**: any incoming token may activate the node.
- **AND** = explicit **Join/Barrier** node only.
- **Loops** = allowed and expected; cycles are a normal graph feature.

## Runtime token model
- Tokens traverse a directed graph of nodes.
- A node may receive multiple tokens; it may emit 0..N outgoing tokens depending on its rules.
- **Default quantization:** node activations are quantized to the **next bar boundary** unless a node explicitly overrides timing.
- Safety caps apply to prevent runaway graphs (see `V9_RUNTIME_MODEL.md`).

## Control-flow semantics
- **Start:** emits one token when the stream starts.
- **Counter:** **pre-increment** semantics. On each token hit, the counter increments first, then the value is read.
  - Example: initialized to 0. First hit → value becomes 1.
- **Switch:** conditional routing by a branch table.
  - **First Match** order: branches evaluated top-to-bottom.
  - **Default** branch is taken if no condition matches.
  - Condition sources: **Counter**, **BarIndex**, **Manual**, **Random (seeded)**, **Always**.
- **Join (Barrier):** AND semantics; releases only when all required inputs have been received in the current barrier window.

## Draft vs Published Thought
- **Draft Thought:** editable, not yet locked for runtime execution. Its parameters can change without migration.
- **Published Thought:** versioned and pinned. Runtime references are **pinned to a specific version** so playback is reproducible.
- Publishing creates an immutable snapshot of parameters (pattern, harmony, timing, instrument).

## V8 → V9 migration notes
- **Cycles are allowed in V9.** The V8 compiler’s “Cycle detected” error is **no longer** a normal error condition.
- V8’s implicit Render/Theory tree becomes an explicit token-flow graph in V9.
- Fan-out and merge semantics are explicit and consistent across the graph.

## Acceptance demo note (V9)
- The canonical acceptance demo includes the **Moonlight loop** with a Counter-driven loop count and a Switch exit path.
