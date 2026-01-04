# MIND Overview

MIND (Musical Interface Node Design) is a node-based music system built around two
concepts:

- **Theory nodes** capture intent (what should happen).
- **Render nodes** capture gesture (how it should happen).

Theory nodes generate structured musical events. Render nodes wrap a single child
node and transform those events using post-processors (e.g., strum or percussion
augmentation). This separation lets you reuse the same harmonic material with
different performance textures.

## Node graph execution

1. The client sends a node graph to `/api/compile`.
2. The compiler traverses roots (nodes not referenced as children).
3. Theory nodes compile into events (beat patterns).
4. Render nodes compile their child first, then apply render transforms.

The result is a deterministic list of events for the current bar.

## Quick demo flow

1. Open the app in your browser.
2. Click **Load Demo Workspace**.
3. Press **Play** to hear a preconfigured Theory + Render pairing.

## Extending the system

- Add new render transforms in `backend/mind_api/mind_core/post/`.
- Add new theory motions in `backend/mind_api/mind_core/motions/`.
- Build new FlowGraph v9 behaviors in `backend/mind_api/mind_core/stream_runtime.py`.
