from __future__ import annotations

import sys

sys.path.append("backend")

from mind_api.models import CompileRequest, FlowGraph, FlowGraphNode


def test_compile_request_accepts_custom_melody_fields() -> None:
    graph = FlowGraph(
        graphVersion=9,
        nodes=[
            FlowGraphNode(
                id="thought-1",
                type="thought",
                params={
                    "melodyMode": "custom",
                    "customMelody": {
                        "grid": "1/16",
                        "bars": [
                            {"rhythm": "9..-", "notes": "C4 E4 G4"},
                            {"rhythm": "9..9", "notes": "D4 F4 A4"},
                        ],
                    },
                },
                ui={},
            )
        ],
        edges=[],
    )

    req = CompileRequest(flowGraph=graph, bpm=120, barIndex=0)
    assert req.flowGraph is not None
    node_params = req.flowGraph.nodes[0].params
    assert node_params.get("melodyMode") == "custom"
    custom = node_params.get("customMelody") or {}
    assert custom.get("grid") == "1/16"
    assert isinstance(custom.get("bars"), list)
    assert custom["bars"][0]["rhythm"] == "9..-"
