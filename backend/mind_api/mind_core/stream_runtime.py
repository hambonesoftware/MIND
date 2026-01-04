"""
Token-based stream runtime for V9 flow graphs.
"""

from __future__ import annotations

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
from .music_elements.harmony_plan import HarmonyPlan
from .music_elements.phrase_plan import PhrasePlan
from .music_elements.texture_engine import generate_events
from .music_elements.texture_recipe import TextureRecipe
from .notes import note_name_to_midi, parse_notes_spec


LANE_TO_MIDI_NOTE = {
    "kick": 36,
    "snare": 38,
    "hat": 42,
    "note": 60,
}

ALLOWED_GRIDS = {"1/4", "1/8", "1/12", "1/16", "1/24"}

MAX_NODE_FIRINGS_PER_BAR = 256
MAX_TOKENS_PER_BAR = 512


def _coerce_number(value: object, fallback: int = 0) -> int:
    if isinstance(value, bool):
        return int(value)
    try:
        return int(value)
    except (TypeError, ValueError):
        return fallback


def _compare(op: str, left: int, right: int) -> bool:
    return {
        "==": left == right,
        "!=": left != right,
        ">": left > right,
        ">=": left >= right,
        "<": left < right,
        "<=": left <= right,
    }.get(op, False)


def _seeded_random(seed: int, salt: int) -> float:
    value = (seed * 9301 + 49297 + salt * 233) % 233280
    return value / 233280.0


def _is_hit_char(ch: str) -> bool:
    return ch.isdigit()


def _intensity_to_velocity(char: str) -> int:
    try:
        value = int(char)
    except ValueError:
        return 0
    return max(1, min(127, 15 + value * 12))


def _count_sustain_steps(bar_pat: str, start_idx: int) -> int:
    n = 0
    j = start_idx + 1
    while j < len(bar_pat) and bar_pat[j] == "-":
        n += 1
        j += 1
    return n


def _normalize_pattern(raw_pat: str) -> str:
    return "".join(c for c in raw_pat if c not in {" ", "|"})


def _steps_per_bar_for_grid(grid: str) -> int:
    return {
        "1/4": 4,
        "1/8": 8,
        "1/12": 12,
        "1/16": 16,
        "1/24": 24,
    }.get(grid, 4)


def _normalize_note_name(value: str, default_octave: int = 4) -> str:
    value = (value or "").strip()
    if not value:
        return ""
    if any(ch.isdigit() for ch in value):
        return value
    return f"{value}{default_octave}"


def _build_chord_pitches(params: dict) -> List[int]:
    notes_spec = (params.get("chordNotes") or "").strip()
    if notes_spec:
        try:
            return parse_notes_spec(notes_spec)
        except Exception:
            return []
    root = _normalize_note_name(params.get("chordRoot") or "C")
    if not root:
        root = "C4"
    try:
        root_midi = note_name_to_midi(root)
    except Exception:
        root_midi = 60
    quality = (params.get("chordQuality") or "major").lower()
    intervals = {
        "major": [0, 4, 7],
        "minor": [0, 3, 7],
        "diminished": [0, 3, 6],
        "augmented": [0, 4, 8],
    }.get(quality, [0, 4, 7])
    return [root_midi + interval for interval in intervals]


def _apply_register(pitches: List[int], *, register_min: int, register_max: int) -> List[int]:
    if not pitches:
        return []
    adjusted: List[int] = []
    for pitch in pitches:
        value = pitch
        while value < register_min:
            value += 12
        while value > register_max:
            value -= 12
        adjusted.append(max(0, min(127, value)))
    return adjusted


def _apply_timing_adjustments(
    events: List[Event],
    *,
    grid: str,
    syncopation: str,
    timing_warp: str,
    intensity: float,
) -> List[Event]:
    if not events:
        return events
    steps_per_bar = _steps_per_bar_for_grid(grid)
    step_len = 4.0 / steps_per_bar
    intensity = max(0.0, min(1.0, float(intensity or 0)))
    for event in events:
        step = int(round(event.tBeat / step_len)) if step_len > 0 else 0
        tbeat = step * step_len
        if syncopation == "offbeat":
            tbeat += step_len * 0.5
        elif syncopation == "anticipation":
            tbeat -= step_len * 0.33
        if timing_warp in {"swing", "shuffle"} and step % 2 == 1:
            warp = step_len * (0.5 if timing_warp == "swing" else 0.75)
            tbeat += warp * intensity
        event.tBeat = max(0.0, min(4.0, tbeat))
    return events


def _compute_pattern_bar_count(pat: str, steps_per_bar: int) -> int:
    if len(pat) <= steps_per_bar:
        return 1
    if len(pat) % steps_per_bar != 0:
        return 1
    return min(16, len(pat) // steps_per_bar)


def _slice_bar_segment(pat: str, steps_per_bar: int, bar_offset: int, bar_count: int) -> str:
    if bar_count <= 1:
        if len(pat) < steps_per_bar:
            times = (steps_per_bar + len(pat) - 1) // len(pat)
            return (pat * times)[:steps_per_bar]
        return pat[:steps_per_bar]

    idx = bar_offset % bar_count
    return pat[idx * steps_per_bar : (idx + 1) * steps_per_bar]


def _compile_thought_bar(
    node: FlowGraphNode,
    bar_offset: int,
    bpm: float,
    diagnostics: List[Diagnostic],
    seed: int,
) -> List[Event]:
    params = node.params or {}
    grid = str(params.get("rhythmGrid") or "1/12")
    if grid not in ALLOWED_GRIDS:
        diagnostics.append(
            Diagnostic(level="error", message=f"Thought '{node.id}': invalid grid '{grid}'", line=1, col=1)
        )
        return []

    duration_bars = max(1, _coerce_number(params.get("durationBars"), 1))
    chord = _build_chord_pitches(params)
    register_min = _coerce_number(params.get("registerMin"), 48)
    register_max = _coerce_number(params.get("registerMax"), 84)
    chord = _apply_register(chord, register_min=register_min, register_max=register_max)

    pattern_type = params.get("patternType") or "arp-3-up"
    pattern_family = {
        "arp-3-up": ("low-mid-high",),
        "arp-3-down": ("high-mid-low",),
        "arp-3-skip": ("low-high-mid",),
    }.get(pattern_type, ("low-mid-high",))

    harmony = HarmonyPlan.from_chords([chord] * duration_bars, steps_per_bar=_steps_per_bar_for_grid(grid))
    texture = TextureRecipe(pattern_family=pattern_family, sustain_policy="hold_until_change")
    phrase = PhrasePlan(density_curve=(1.0,))
    generated = generate_events(
        harmony,
        texture,
        phrase,
        bars=duration_bars,
        grid=grid,
        seed=seed,
        piece_id=node.id,
    )

    bar_start = bar_offset * 4.0
    bar_end = (bar_offset + 1) * 4.0
    events: List[Event] = []
    for event in generated:
        if bar_start <= event.tBeat < bar_end:
            adjusted = Event.model_validate(event.model_dump())
            adjusted.tBeat = event.tBeat - bar_start
            events.append(adjusted)

    syncopation = params.get("syncopation") or "none"
    timing_warp = params.get("timingWarp") or "none"
    intensity = params.get("timingIntensity") or 0
    events = _apply_timing_adjustments(
        events,
        grid=grid,
        syncopation=syncopation,
        timing_warp=timing_warp,
        intensity=float(intensity or 0),
    )

    lane = str(params.get("lane") or "note")
    preset = params.get("instrumentPreset") or None
    for event in events:
        event.lane = lane
        event.preset = preset
    return events


def _thought_total_bars(node: FlowGraphNode) -> int:
    params = node.params or {}
    return max(1, _coerce_number(params.get("durationBars"), 1))


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


def _token_from_edge(edge: FlowGraphEdge) -> StreamRuntimeToken:
    return StreamRuntimeToken(nodeId=edge.to.nodeId, viaEdgeId=edge.id, viaPortId=edge.to.portId)


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

    state = req.runtimeState or StreamRuntimeState()
    next_state = StreamRuntimeState(
        barIndex=req.barIndex,
        activeTokens=[],
        activeThoughts={},
        counters=dict(state.counters),
        joins={key: list(value) for key, value in state.joins.items()},
        lastSwitchRoutes=dict(state.lastSwitchRoutes),
        started=state.started,
    )

    current_tokens = list(state.activeTokens)
    next_bar_tokens: List[StreamRuntimeToken] = []

    if not state.started:
        next_state.counters = {}
        next_state.joins = {}
        next_state.lastSwitchRoutes = {}
        next_state.activeThoughts = {}
        for node in nodes_by_id.values():
            if node.type == "counter" and node.params.get("resetOnPlay") is False:
                if node.id in state.counters:
                    next_state.counters[node.id] = state.counters[node.id]
        for node in nodes_by_id.values():
            if node.type == "start":
                current_tokens.append(StreamRuntimeToken(nodeId=node.id))
        next_state.started = True
        debug_trace.append("Start: emitted initial tokens.")

    node_firings = 0
    tokens_created = 0

    def enqueue_immediate(edges: List[FlowGraphEdge]) -> None:
        nonlocal tokens_created
        for edge in edges:
            queue.append(_token_from_edge(edge))
        tokens_created += len(edges)

    def enqueue_deferred(edges: List[FlowGraphEdge]) -> None:
        nonlocal tokens_created
        for edge in edges:
            next_bar_tokens.append(_token_from_edge(edge))
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
                return
            total_bars = max(1, _thought_total_bars(node))
            events.extend(_compile_thought_bar(node, 0, req.bpm, diagnostics, req.seed))
            if total_bars <= 1:
                edges = outgoing.get(node.id, [])
                enqueue_deferred(edges)
                debug_trace.append(f"Thought {node.id}: single-bar, emitted {len(edges)} tokens.")
            else:
                next_state.activeThoughts[node.id] = StreamRuntimeThoughtState(
                    remainingBars=total_bars - 1,
                    barOffset=1,
                )
                debug_trace.append(f"Thought {node.id}: started ({total_bars} bars).")
            activated_thoughts.add(node.id)
            return

        if node.type == "start":
            edges = outgoing.get(node.id, [])
            enqueue_immediate(edges)
            debug_trace.append(f"Start {node.id}: emitted {len(edges)} tokens.")
            return

        if node.type == "counter":
            params = node.params or {}
            start_value = _coerce_number(params.get("start"), 0)
            step = _coerce_number(params.get("step"), 1)
            current = next_state.counters.get(node.id, start_value)
            current += step
            next_state.counters[node.id] = current
            edges = outgoing.get(node.id, [])
            enqueue_immediate(edges)
            debug_trace.append(f"Counter {node.id}: value {current}, emitted {len(edges)} tokens.")
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
            enqueue_immediate(edges)
            if branches:
                next_state.lastSwitchRoutes[node.id] = branches[-1]
            debug_trace.append(f"Switch {node.id}: branch {', '.join(branches)}, emitted {len(edges)} tokens.")
            return

        if node.type == "join":
            required_inputs = _required_join_inputs(node, incoming.get(node.id, []))
            arrived = set(next_state.joins.get(node.id, []))
            if token.viaPortId:
                arrived.add(token.viaPortId)
            if required_inputs and all(req_id in arrived for req_id in required_inputs):
                edges = outgoing.get(node.id, [])
                enqueue_immediate(edges)
                next_state.joins[node.id] = []
                debug_trace.append(f"Join {node.id}: released, emitted {len(edges)} tokens.")
            else:
                next_state.joins[node.id] = list(arrived)
                debug_trace.append(
                    f"Join {node.id}: waiting ({len(arrived)}/{len(required_inputs)}) [{', '.join(sorted(arrived))}]."
                )
            return

        debug_trace.append(f"Node {node.id}: unsupported type '{node.type}'.")

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
            enqueue_deferred(edges)
            debug_trace.append(f"Thought {node_id}: completed, emitted {len(edges)} tokens.")
        else:
            next_state.activeThoughts[node_id] = StreamRuntimeThoughtState(
                remainingBars=remaining,
                barOffset=next_offset,
            )

    queue = list(current_tokens)
    for token in queue:
        process_token(token)

    next_state.activeTokens = next_bar_tokens

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
