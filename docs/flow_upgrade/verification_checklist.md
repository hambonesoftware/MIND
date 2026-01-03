# Flow Upgrade Verification Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Launch the frontend and confirm the workspace loads without console errors. | FAIL | Not run. See [Runtime steps/results](verification_report.md#runtime-stepsresults). |
| Load a demo workspace using “Load Demo Workspace”. | FAIL | Not run. See [Runtime steps/results](verification_report.md#runtime-stepsresults). |
| Latch the workspace and click Play. | FAIL | Not run. See [Runtime steps/results](verification_report.md#runtime-stepsresults). |
| Observe scheduling UI (executions/logs panel). | FAIL | Not run. See [Runtime steps/results](verification_report.md#runtime-stepsresults). |
| Toggle a render node (disable/enable) and latch again. | FAIL | Not run. See [Runtime steps/results](verification_report.md#runtime-stepsresults). |
| Click Stop. | FAIL | Not run. See [Runtime steps/results](verification_report.md#runtime-stepsresults). |
| Invalid graphs report diagnostics from `/compile` without hanging. | FAIL | Not run. See [Runtime steps/results](verification_report.md#runtime-stepsresults). |
| Only nodes reachable from selected start nodes contribute events. | FAIL | Not run. See [Runtime steps/results](verification_report.md#runtime-stepsresults). |
| `pytest backend/tests/test_compiler_graph.py` | PASS | Output in [Commands run/output](verification_report.md#commands-runoutput). |
