# Flow Upgrade Tech Choices

## Node Editor Library
- **Chosen:** Drawflow (vanilla JS-compatible node editor).
- **Rationale:**
  - Works with plain DOM/JS without requiring React/Vue, aligning with the current frontend (`frontend/src/main.js`).
  - Provides built-in drag, connect, zoom, and serialization primitives that map to our graph store model.
  - Lightweight compared to full framework-based editors, keeping bundle size manageable.
- **Tradeoffs:**
  - Limited built-in type validation, so we still need custom port-type enforcement and error UI.
  - Styling and layout are less flexible than a fully custom canvas; heavy customization can require patching Drawflow internals.
  - Smaller ecosystem than Rete.js, so advanced plugins and community examples are fewer.

## UI Library
- **Chosen:** Vanilla DOM + existing CSS system.
- **Rationale:** The current frontend is built without a framework (direct DOM manipulation in `frontend/src/main.js` and `frontend/styles.css`). Extending this approach avoids introducing a new dependency and keeps the bundle simple.

## Testing Approach
- **Backend:** Pytest unit tests in `backend/tests/` to cover graph validation, reachable-node traversal, and loop guard safety.
- **Frontend:** No new test harness introduced for this change; focus stays on backend logic coverage.
