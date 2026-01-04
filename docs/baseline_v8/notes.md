# Baseline V8 Notes

## App boot
- `python run.py` started cleanly and served the app at `http://0.0.0.0:8000` (see `startup.txt`).
- Browser console only reported a `404 (Not Found)` resource load during initial page load.

## Audio init
- No explicit audio engine init messages were emitted to the browser console during the baseline load.
- Audio status is presented in the UI transport bar; no console logs observed during the automated load.

## Graph persistence snapshot
- `localStorage.mind.graph` and `localStorage.mind.projects` were `null` on first load (see `graph_localstorage.json`).
- Screenshot captured in `v8_canvas.png`.

## Cycle detection baseline
- Backend test `backend/tests/test_compiler_graph.py::test_compile_cycle_reports_error` asserts diagnostics include `"Cycle detected"` when a cycle is present.
