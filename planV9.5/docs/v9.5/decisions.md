# V9.5 Decisions

## Audio start policy
AudioContext MUST be created/resumed only after a user gesture (Play/Start Play). No engine init that triggers AudioContext on page load.

## Flow semantics
- Start node: sequential dispatch (send to one outgoing edge, queue the rest).
- Thought node: fan-out dispatch (send to all outgoing edges concurrently).

## Custom Melody
Custom Melody is a Thought mode that stores per-bar rhythm + notes:
- rhythm uses tokens: `9` (note-on), `-` (hold), `.` (rest)
- notes are space-separated pitches consumed by each `9`

## Playback highlighting
Thought glow is driven by scheduled events tagged with `sourceNodeId`, not by compile debug traces.

