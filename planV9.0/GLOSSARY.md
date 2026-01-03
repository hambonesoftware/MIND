# Glossary (MINDV9)

## Stream
The **single canvas** where nodes live and edges are drawn. In V9, Stream also owns the **runtime**:
- master bar/beat clock
- token execution
- scheduling

There is no separate “MindFlow” entity.

## Thought (Musical Thought)
A reusable musical pattern object. A Thought does not “play itself”; it is **executed by the Stream runtime**.
Key fields:
- Key / scale context
- Chord root (or inherit)
- Pattern type (arpeggio, sustain, motif, scale walk, cadence...)
- Rhythm (base grid)
- Syncopation (placement/accents)
- Timing warp (swing/shuffle/humanize)
- Register bounds
- Duration (bars)
- **SoundFont instrument** (sf2/sf3 preset)

## Logic Thoughts
Non-audio graph nodes that route/coordinate execution:
- Start
- Counter (pre-increment: first hit reads 1)
- Switch (conditional routing)
- Join/Barrier (explicit AND)

## Token
An execution activation traveling along edges. Tokens are how the Stream runtime decides “what runs next”.

## Fan-out
One node has multiple outgoing edges. In V9, fan-out activates **all** downstream targets in parallel.

## Merge
A node has multiple incoming edges. In V9, merge is **OR** by default: any incoming activation can start the node.

## Join/Barrier
Explicit AND. Waits for all configured inputs to arrive, then fires one activation forward and resets.

## Rivulet (Lab Preview)
A compact preview strip above the canvas to audition a single Thought with harness overrides before using/publishing it.

