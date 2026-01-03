# Flow Upgrade Verification Failures

## Failure 1: Manual smoke steps not executed (frontend runtime validation)

**Description**
Manual UI/runtime steps from `docs/flow_upgrade/success_checklist.md` were not run in this verification pass, so the frontend workflow (workspace load, demo load, latch/play/stop, scheduling UI updates, render toggles) remains unverified.

**Reproduction steps**
1. Start the frontend and backend services.
2. Open the app, verify workspace loads without console errors.
3. Click **Load Demo Workspace** and observe the workspace.
4. Click **Latch**, then **Play**, observe transport state and bar/beat updates.
5. Observe scheduling UI (executions/logs panel).
6. Toggle a render node, latch again, and observe changes.
7. Click **Stop** and confirm transport resets.

**Suspected files/lines**
- `frontend/src/main.js` lines 949-1120 (transport bar, demo load, latch/play/stop UI wiring).
- `frontend/src/ui/flowCanvas.js` lines 13-200 (flow canvas rendering and node interactions).
- `frontend/src/ui/executionsPanel.js` lines 29-40 (transport display in scheduling panel).

**Recommended fixes**
- Run the manual smoke steps against a running instance; capture console output and any UI failures.
- If issues are observed, inspect the transport wiring in `frontend/src/main.js` and flow canvas rendering in `frontend/src/ui/flowCanvas.js` for regressions.

## Failure 2: Diagnostics behavior not verified (compile response)

**Description**
Expected diagnostics behavior for invalid graphs and start-node reachability was not exercised during this verification pass.

**Reproduction steps**
1. Run the backend API.
2. Submit invalid graph payloads to `POST /api/compile` (missing inputs, incompatible types, cycles).
3. Verify diagnostics are returned without hanging.
4. Submit a graph with multiple start nodes and ensure only reachable nodes contribute events.

**Suspected files/lines**
- `backend/mind_api/mind_core/compiler.py` lines 241-330 (graph validation, diagnostics collection, start-node handling).
- `backend/mind_api/routes.py` lines 39-42 (compile endpoint wiring).

**Recommended fixes**
- Exercise compile requests with invalid/edge-case graphs and validate diagnostics output.
- If diagnostics are missing or incorrect, review validation logic in `compiler.py`.
