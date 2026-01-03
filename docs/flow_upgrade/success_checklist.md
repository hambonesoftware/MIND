# Flow Upgrade Success Checklist

## Manual smoke steps
1. **Launch the frontend** and confirm the workspace loads without console errors.
   - **Expected**: Transport controls and node cards render; preset dropdowns populate.
2. **Load a demo workspace** using “Load Demo Workspace”.
   - **Expected**: A start node plus theory/render nodes appear with latched text.
3. **Latch** the workspace and click **Play**.
   - **Expected**: Transport shows “Playing”; the bar/beat counter starts advancing.
4. **Observe scheduling UI** (executions/logs panel, if enabled).
   - **Expected**: Schedule window updates with a lookahead range; per-bar events appear as bars advance.
5. **Toggle a render node** (disable/enable) and latch again.
   - **Expected**: Audio output changes accordingly; events for the disabled branch are absent.
6. **Click Stop**.
   - **Expected**: Transport resets to “Stopped”, bar/beat displays idle state, and no new events are scheduled.

## Expected diagnostics behavior
- Invalid graphs (missing inputs, incompatible types, cycles) report diagnostics from the `/compile` response without hanging.
- Only nodes reachable from the selected start nodes contribute events.

## Suggested tests
- `pytest backend/tests/test_compiler_graph.py`
