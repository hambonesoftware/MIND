from __future__ import annotations

import sys

sys.path.append("backend")

from mind_api.mind_core.stream_runtime import run_stream_runtime
from mind_api.models import CompileRequest, FlowGraph, FlowGraphEdge, FlowGraphEdgeEndpoint, FlowGraphNode


def _node(node_id: str, node_type: str, params: dict | None = None, ports: dict | None = None) -> FlowGraphNode:
    return FlowGraphNode(id=node_id, type=node_type, params=params or {}, ui={}, ports=ports)


def _edge(edge_id: str, from_node: str, from_port: str, to_node: str, to_port: str) -> FlowGraphEdge:
    return FlowGraphEdge(
        id=edge_id,
        **{
            "from": FlowGraphEdgeEndpoint(nodeId=from_node, portId=from_port),
            "to": FlowGraphEdgeEndpoint(nodeId=to_node, portId=to_port),
        },
    )


def _graph(nodes: list[FlowGraphNode], edges: list[FlowGraphEdge]) -> FlowGraph:
    return FlowGraph(graphVersion=9, nodes=nodes, edges=edges)


def test_custom_melody_emits_events_with_holds_and_source() -> None:
    grid = "1/16"
    rhythm = "9--9."
    notes = "60 64"
    graph = _graph(
        [
            _node("start", "start", ports={"inputs": [], "outputs": [{"id": "out", "type": "flow"}]}),
            _node(
                "thought-1",
                "thought",
                params={
                    "melodyMode": "custom",
                    "customMelody": {
                        "grid": grid,
                        "bars": [{"rhythm": rhythm, "notes": notes}],
                    },
                    "instrumentPreset": "gm:0:0",
                },
                ports={"inputs": [{"id": "in", "type": "flow"}], "outputs": []},
            ),
        ],
        [
            _edge("e0", "start", "out", "thought-1", "in"),
        ],
    )

    res = run_stream_runtime(CompileRequest(flowGraph=graph, barIndex=0, bpm=120))
    assert res.events, "Custom melody should produce events"

    starts = [(ev.tBeat, ev.durationBeats, ev.pitches, ev.sourceNodeId) for ev in res.events]
    # First note starts at 0 with two hold steps (3 steps total)
    assert starts[0][0] == 0
    assert starts[0][1] == (3 * (4.0 / 16))
    assert starts[0][2] == [60]
    assert starts[0][3] == "thought-1"
    # Second note starts at step 3 (tBeat = 3 * step_len)
    step_len = 4.0 / 16
    assert starts[1][0] == 3 * step_len
    assert starts[1][2] == [64]
    assert starts[1][3] == "thought-1"
