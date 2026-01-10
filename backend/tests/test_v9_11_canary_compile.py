from __future__ import annotations

import json
from pathlib import Path

from mind_api.mind_core.stream_runtime import run_stream_runtime
from mind_api.models import CompileRequest, FlowGraph


def _load_canary_graph() -> FlowGraph:
    root = Path(__file__).resolve().parents[2]
    canary_path = root / "docs" / "demos" / "v9.11" / "canary_thought_minimal.json"
    data = json.loads(canary_path.read_text(encoding="utf-8"))
    return FlowGraph.model_validate(data)


def test_v9_11_canary_thought_compiles() -> None:
    graph = _load_canary_graph()
    runtime_state = None
    for bar_index in range(2):
        res = run_stream_runtime(
            CompileRequest(flowGraph=graph, barIndex=bar_index, bpm=120, seed=1, runtimeState=runtime_state)
        )
        assert res.ok is True
        assert any(event.lane == "note" for event in res.events)
        runtime_state = res.runtimeState
