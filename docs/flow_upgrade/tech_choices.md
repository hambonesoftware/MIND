# Flow Upgrade Tech Choices

## UI Library
- **Chosen:** Vanilla DOM + existing CSS system.
- **Rationale:** The current frontend is built without a framework (direct DOM manipulation in `frontend/src/main.js` and `frontend/styles.css`). Extending this approach avoids introducing a new dependency and keeps the bundle simple.

## Testing Approach
- **Backend:** Pytest unit tests in `backend/tests/` to cover graph validation, reachable-node traversal, and loop guard safety.
- **Frontend:** No new test harness introduced for this change; focus stays on backend logic coverage.
