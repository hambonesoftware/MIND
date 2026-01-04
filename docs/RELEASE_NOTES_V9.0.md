# MIND V9.0 Release Notes

## Highlights
- Token-based Stream runtime with loops, fan-out, OR merges, and explicit Join barriers.
- Musical Thoughts with rhythm, pattern, register, and SoundFont instrument selection.
- Rivulet Lab preview to audition Thoughts before wiring them into Streams.
- Acceptance demos for Moonlight loop, parallel fan-out, and Join barrier flows.

## Breaking changes
- Stream graph persistence uses `graphVersion: 9` and explicit ports on nodes/edges.
- Compile requests accept `flowGraph` and return `runtimeState` + `debugTrace`.

## Migration notes
- V8 graphs are migrated on load to V9 node types and port definitions.
- Cycles are allowed in V9; runtime uses safety caps instead of hard cycle errors.

## Known limitations
- Rivulet preview is a minimal first pass and does not yet support advanced readiness checks.
