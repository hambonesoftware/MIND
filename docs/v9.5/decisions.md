# V9.5 Decisions (Execution + Authoring)

## Audio and playback
- AudioContext creation/resume occurs **only after a user gesture** (Play button or Start-node play). The app boots with a placeholder engine and promotes to the SF2 engine on the first click.
- Playback glow is **event-driven**: nodes highlighted in the canvas come from scheduled events tagged with `sourceNodeId`, not from debug trace churn.

## Flow semantics
- **Start** edges launch sequentially (queued).
- **Thought** outputs **fan out concurrently** to all outgoing edges.

## Custom melody
- A Thought can switch `melodyMode` between `generated` and `custom`.
- Custom melody stores a grid plus per-bar rhythm (`9`, `-`, `.`) and aligned notes; these fields persist, flow through the compile payload, and drive backend event compilation.
