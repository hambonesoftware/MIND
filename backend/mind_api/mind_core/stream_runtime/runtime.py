"""Token-based stream runtime for V9 flow graphs."""

from __future__ import annotations

import logging
from typing import Dict, Iterable, List, Optional

from ..models import (
    CompileRequest,
    CompileResponse,
    Diagnostic,
    Event,
    FlowGraph,
    FlowGraphEdge,
    FlowGraphNode,
    StreamRuntimeState,
    StreamRuntimeToken,
    StreamRuntimeThoughtState,
)
from .constants import MAX_NODE_FIRINGS_PER_BAR, MAX_TOKENS_PER_BAR
from .melody import _compile_thought_bar, _thought_total_bars
from .utils import _compare, _coerce_number, _seeded_random

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def _build_edge_index(edges: Iterable[FlowGraphEdge]) -> Dict[str, FlowGraphEdge]:
    return {edge.id: edge for edge in edges}


def _build_adjacency(graph: FlowGraph) -> tuple[Dict[str, List[FlowGraphEdge]], Dict[str, List[FlowGraphEdge]]]:
    outgoing: Dict[str, List[FlowGraphEdge]] = {}
    incoming: Dict[str, List[FlowGraphEdge]] = {}
    for edge in graph.edges:
        from_id = edge.from_.nodeId
        to_id = edge.to.nodeId
        outgoing.setdefault(from_id, []).append(edge)
        incoming.setdefault(to_id, []).append(edge)
    return outgoing, incoming


def _token_from_edge(edge: FlowGraphEdge, *, start_id: Optional[str] = None) -> StreamRuntimeToken:
    return StreamRuntimeToken(nodeId=edge.to.nodeId, viaEdgeId=edge.id, viaPortId=edge.to.portId, startId=start_id)


def _required_join_inputs(node: FlowGraphNode, incoming: List[FlowGraphEdge]) -> List[str]:
    if node.ports and node.ports.inputs:
        return [port.id for port in node.ports.inputs if port.id]
    port_ids = [edge.to.portId for edge in incoming if edge.to.portId]
    return list(dict.fromkeys(port_ids))


def _evaluate_switch(
    node: FlowGraphNode,
    outgoing: List[FlowGraphEdge],
    state: StreamRuntimeState,
    req: CompileRequest,
) -> tuple[List[FlowGraphEdge], List[str]]:
    params = node.params or {}
    branches = params.get("branches") or []
    mode = params.get("mode") or "first"
    default_branch = str(params.get("defaultBranch") or "default")
    manual_selection = str(params.get("manualSelection") or "")
    matched_edges: List[FlowGraphEdge] = []
    matched_labels: List[str] = []

    for branch in branches:
        branch_id = str(branch.get("id") or "")
        condition = branch.get("condition") or {"type": "always", "value": True}
        ctype = condition.get("type") or "always"
        ok = False
        if ctype == "always":
            ok = condition.get("value", True) is not False
        elif ctype == "manual":
            ok = manual_selection and manual_selection == str(condition.get("value") or "")
        elif ctype == "counter":
            counter_id = str(condition.get("counterId") or "")
            current = state.counters.get(counter_id, 0)
            op = condition.get("op") or ">="
            value = _coerce_number(condition.get("value"), 0)
            ok = _compare(op, current, value)
        elif ctype == "barIndex":
            op = condition.get("op") or ">="
            value = _coerce_number(condition.get("value"), 0)
            ok = _compare(op, req.barIndex, value)
        elif ctype == "random":
            threshold = condition.get("threshold")
            if threshold is None:
                threshold = condition.get("value")
            try:
                threshold_value = float(threshold)
            except (TypeError, ValueError):
                threshold_value = 0.5
            salt = sum(ord(ch) for ch in node.id + branch_id)
            ok = _seeded_random(req.seed, salt + req.barIndex) < threshold_value

        if ok:
            edges = [edge for edge in outgoing if edge.from_.portId == branch_id]
            matched_edges.extend(edges)
            matched_labels.append(branch_id)
            if mode != "all":
                return matched_edges, matched_labels

    default_edges = [edge for edge in outgoing if edge.from_.portId == default_branch]
    if default_edges:
        return default_edges, [default_branch]
    if outgoing:
        fallback = outgoing[0]
        return [fallback], [fallback.from_.portId or default_branch]
    return [], [default_branch]


def run_stream_runtime(req: CompileRequest) -> CompileResponse:
    diagnostics: List[Diagnostic] = []
    events: List[Event] = []
    debug_trace: List[str] = []

    if not req.flowGraph:
        diagnostics.append(Diagnostic(level="error", message="Missing flowGraph for V9 runtime.", line=1, col=1))
        return CompileResponse(
            ok=False,
            diagnostics=diagnostics,
            barIndex=req.barIndex,
            loopBars=16,
            events=[],
            debugTrace=debug_trace,
            runtimeState=req.runtimeState,
        )

    graph = req.flowGraph
    nodes_by_id = {node.id: node for node in graph.nodes}
    outgoing, incoming = _build_adjacency(graph)
    edge_index = _build_edge_index(graph.edges)
    start_edges_by_id: Dict[str, List[FlowGraphEdge]] = {
        node.id: outgoing.get(node.id, []) for node in nodes_by_id.values() if node.type == "start"
    }

    state = req.runtimeState or StreamRuntimeState()
    next_state = StreamRuntimeState(
        barIndex=req.barIndex,
        activeTokens=[],
        activeThoughts={},
        startQueues={key: list(value) for key, value in state.startQueues.items()},
        startEdgePositions=dict(state.startEdgePositions),
        startActiveChains=dict(state.startActiveChains),
        counters=dict(state.counters),
        joins={key: list(value) for key, value in state.joins.items()},
        lastSwitchRoutes=dict(state.lastSwitchRoutes),
        started=state.started,
    )
    for start_id in start_edges_by_id:
        next_state.startActiveChains.setdefault(start_id, 0)
        next_state.startEdgePositions.setdefault(start_id, 0)
        next_state.startQueues.setdefault(start_id, [])

    current_tokens = list(state.activeTokens)
    next_bar_tokens: List[StreamRuntimeToken] = []

    if not state.started:
        next_state.counters = {}
        next_state.joins = {}
        next_state.lastSwitchRoutes = {}
        next_state.activeThoughts = {}
        next_state.startQueues = {}
        next_state.startEdgePositions = {}
        next_state.startActiveChains = {}
        for node in nodes_by_id.values():
            if node.type == "counter" and node.params.get("resetOnPlay") is False:
                if node.id in state.counters:
                    next_state.counters[node.id] = state.counters[node.id]
        start_filter = set(req.startNodeIds or [])
        for node in nodes_by_id.values():
            if node.type != "start":
                continue
            if start_filter and node.id not in start_filter:
                continue
            outgoing_edges = start_edges_by_id.get(node.id, [])
            if outgoing_edges:
                next_state.startQueues[node.id] = [outgoing_edges[0].id]
                next_state.startEdgePositions[node.id] = 1
            else:
                next_state.startQueues[node.id] = []
                next_state.startEdgePositions[node.id] = 0
            next_state.startActiveChains[node.id] = 0
            current_tokens.append(StreamRuntimeToken(nodeId=node.id))
        next_state.started = True
        debug_trace.append("Start: emitted initial tokens.")

    node_firings = 0
    tokens_created = 0

    def _increment_start_chain(start_id: Optional[str], delta: int) -> None:
        if not start_id:
            return
        current = next_state.startActiveChains.get(start_id, 0)
        updated = current + delta
        if updated < 0:
            updated = 0
        next_state.startActiveChains[start_id] = updated
        if updated == 0:
            _queue_next_start_edge(start_id)

    def _queue_next_start_edge(start_id: str) -> None:
        edges = start_edges_by_id.get(start_id, [])
        pos = next_state.startEdgePositions.get(start_id, 0)
        if pos >= len(edges):
            return
        next_edge = edges[pos]
        next_state.startEdgePositions[start_id] = pos + 1
        enqueue_deferred([next_edge], start_id=start_id)
        debug_trace.append(f"Start {start_id}: queued next edge {next_edge.id} after completion.")

    def enqueue_immediate(edges: List[FlowGraphEdge], *, start_id: Optional[str]) -> None:
        nonlocal tokens_created
        for edge in edges:
            queue.append(_token_from_edge(edge, start_id=start_id))
            _increment_start_chain(start_id, 1)
        tokens_created += len(edges)

    def enqueue_deferred(edges: List[FlowGraphEdge], *, start_id: Optional[str]) -> None:
        nonlocal tokens_created
        for edge in edges:
            next_bar_tokens.append(_token_from_edge(edge, start_id=start_id))
            _increment_start_chain(start_id, 1)
        tokens_created += len(edges)

    def process_token(token: StreamRuntimeToken) -> None:
        nonlocal node_firings, tokens_created
        if node_firings >= MAX_NODE_FIRINGS_PER_BAR or tokens_created >= MAX_TOKENS_PER_BAR:
            diagnostics.append(
                Diagnostic(
                    level="warn",
                    message="Safety cap reached; runtime halted for this bar.",
                    line=1,
                    col=1,
                )
            )
            return
        node = nodes_by_id.get(token.nodeId)
        if not node:
            diagnostics.append(
                Diagnostic(level="warn", message=f"Token references missing node '{token.nodeId}'.", line=1, col=1)
            )
            return

        node_firings += 1

        if node.type == "thought":
            if node.id in activated_thoughts:
                debug_trace.append(f"Thought {node.id}: already active, ignoring extra token.")
                _increment_start_chain(token.startId, -1)
                return
            total_bars = max(1, _thought_total_bars(node))
            events.extend(_compile_thought_bar(node, 0, req.bpm, diagnostics, req.seed))
            if total_bars <= 1:
                edges = outgoing.get(node.id, [])
                enqueue_deferred(edges, start_id=token.startId)
                debug_trace.append(f"Thought {node.id}: single-bar, emitted {len(edges)} tokens.")
            else:
                next_state.activeThoughts[node.id] = StreamRuntimeThoughtState(
                    remainingBars=total_bars - 1,
                    barOffset=1,
                    viaEdgeId=token.viaEdgeId,
                    startId=token.startId,
                )
                _increment_start_chain(token.startId, 1)
                debug_trace.append(f"Thought {node.id}: started ({total_bars} bars).")
            activated_thoughts.add(node.id)
            _increment_start_chain(token.startId, -1)
            return

        if node.type == "start":
            queue_edges = list(next_state.startQueues.get(node.id, []))
            if not queue_edges:
                debug_trace.append(f"Start {node.id}: no queued edges.")
                return
            next_edge_id = queue_edges.pop(0)
            next_edge = edge_index.get(next_edge_id)
            if next_edge:
                enqueue_immediate([next_edge], start_id=node.id)
                debug_trace.append(f"Start {node.id}: emitted edge {next_edge_id}.")
            next_state.startQueues[node.id] = queue_edges
            return

        if node.type == "counter":
            params = node.params or {}
            start_value = _coerce_number(params.get("start"), 0)
            step = _coerce_number(params.get("step"), 1)
            current = next_state.counters.get(node.id, start_value)
            current += step
            next_state.counters[node.id] = current
            edges = outgoing.get(node.id, [])
            enqueue_immediate(edges, start_id=token.startId)
            debug_trace.append(f"Counter {node.id}: value {current}, emitted {len(edges)} tokens.")
            _increment_start_chain(token.startId, -1)
            return

        if node.type == "switch":
            edges, branches = _evaluate_switch(node, outgoing.get(node.id, []), next_state, req)
            if not edges:
                diagnostics.append(
                    Diagnostic(
                        level="warn",
                        message=f"Switch '{node.id}' has no matching branch and no default edge.",
                        line=1,
                        col=1,
                    )
                )
            enqueue_immediate(edges, start_id=token.startId)
            if branches:
                next_state.lastSwitchRoutes[node.id] = branches[-1]
            debug_trace.append(f"Switch {node.id}: branch {', '.join(branches)}, emitted {len(edges)} tokens.")
            _increment_start_chain(token.startId, -1)
            return

        if node.type == "join":
            required_inputs = _required_join_inputs(node, incoming.get(node.id, []))
            arrived = set(next_state.joins.get(node.id, []))
            if token.viaPortId:
                arrived.add(token.viaPortId)
            if required_inputs and all(req_id in arrived for req_id in required_inputs):
                edges = outgoing.get(node.id, [])
                enqueue_immediate(edges, start_id=token.startId)
                next_state.joins[node.id] = []
                debug_trace.append(f"Join {node.id}: released, emitted {len(edges)} tokens.")
            else:
                next_state.joins[node.id] = list(arrived)
                debug_trace.append(
                    f"Join {node.id}: waiting ({len(arrived)}/{len(required_inputs)}) [{', '.join(sorted(arrived))}]."
                )
            _increment_start_chain(token.startId, -1)
            return

        debug_trace.append(f"Node {node.id}: unsupported type '{node.type}'.")
        _increment_start_chain(token.startId, -1)

    activated_thoughts = set()

    for node_id, thought_state in state.activeThoughts.items():
        node = nodes_by_id.get(node_id)
        if not node or node.type != "thought":
            continue
        events.extend(_compile_thought_bar(node, thought_state.barOffset, req.bpm, diagnostics, req.seed))
        activated_thoughts.add(node_id)
        remaining = thought_state.remainingBars - 1
        next_offset = thought_state.barOffset + 1
        if remaining <= 0:
            edges = outgoing.get(node_id, [])
            enqueue_deferred(edges, start_id=thought_state.startId)
            _increment_start_chain(thought_state.startId, -1)
            debug_trace.append(f"Thought {node_id}: completed, emitted {len(edges)} tokens.")
        else:
            next_state.activeThoughts[node_id] = StreamRuntimeThoughtState(
                remainingBars=remaining,
                barOffset=next_offset,
                viaEdgeId=thought_state.viaEdgeId,
                startId=thought_state.startId,
            )

    queue = list(current_tokens)
    for token in queue:
        process_token(token)

    next_state.activeTokens = next_bar_tokens
    for node in nodes_by_id.values():
        if node.type == "join" and node.id not in next_state.joins:
            next_state.joins[node.id] = []

    ok = not any(d.level == "error" for d in diagnostics)
    return CompileResponse(
        ok=ok,
        diagnostics=diagnostics,
        barIndex=req.barIndex,
        loopBars=16,
        events=events,
        debugTrace=debug_trace,
        runtimeState=next_state,
    )
