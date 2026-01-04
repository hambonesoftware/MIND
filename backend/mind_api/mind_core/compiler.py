"""
Compiler for the MIND language v0.1.
"""

from __future__ import annotations

from typing import Dict, List, Optional, Set, Tuple

from ..models import (
    CompileRequest,
    CompileResponse,
    Event,
    Diagnostic,
    NodeInput,
    RenderSpec,
)
from .post.chain import apply_render_chain
from .parser import parse_text
from .notes import parse_notes_spec, parse_sequence_spec


LANE_TO_MIDI_NOTE = {
    "kick": 36,
    "snare": 38,
    "hat": 42,
    "note": 60,
}

MAX_GRAPH_DEPTH = 256
MAX_SCHEDULE_STEPS = 2048

DEFAULT_PORT_TYPES: Dict[Tuple[str, str], str] = {
    ("start", "out"): "flow",
    ("render", "in"): "flow",
    ("render", "out"): "flow",
    ("theory", "in"): "flow",
}


def _intensity_to_velocity(char: str) -> int:
    try:
        value = int(char)
    except ValueError:
        return 0
    return max(1, min(127, 15 + value * 12))


def _is_hit_char(ch: str) -> bool:
    return ch.isdigit()


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


def _hits_by_segment(pat: str, steps_per_bar: int, bar_count: int) -> List[int]:
    return [
        sum(1 for c in pat[i * steps_per_bar : (i + 1) * steps_per_bar] if _is_hit_char(c))
        for i in range(bar_count)
    ]


def _compute_base_hit_index(bar_offset: int, bar_count: int, hits_per_seg: List[int]) -> int:
    if bar_count <= 1:
        return hits_per_seg[0] * bar_offset
    full = bar_offset // bar_count
    rem = bar_offset % bar_count
    return full * sum(hits_per_seg) + sum(hits_per_seg[:rem])


def _compile_theory_node(
    node: NodeInput,
    bar_idx: int,
    bpm: float,
    diagnostics: List[Diagnostic],
    debug_lines: Optional[List[str]] = None,
) -> List[Event]:

    node_text = (node.text or "").strip()
    try:
        ast, parse_diags = parse_text(node_text)
    except ValueError as exc:
        diagnostics.append(
            Diagnostic(level="error", message=f"Node {node.id}: {exc}", line=1, col=1)
        )
        return []
    if parse_diags:
        for d in parse_diags:
            diagnostics.append(
                Diagnostic(level=d.level, message=f"Node {node.id}: {d.message}", line=d.line, col=d.col)
            )
        return []

    # --- BEAT NODES ---
    bar_range = ast.bars or "1-16"
    start_bar, end_bar = map(int, bar_range.split("-"))
    if not (start_bar <= bar_idx + 1 <= end_bar):
        return []

    grid = ast.grid or "1/4"
    steps_per_bar = _steps_per_bar_for_grid(grid)
    step_len_beats = 4.0 / steps_per_bar

    pat_norm = _normalize_pattern(ast.pattern or "")
    if not pat_norm:
        return []

    bar_count = _compute_pattern_bar_count(pat_norm, steps_per_bar)
    bar_offset = (bar_idx + 1) - start_bar
    bar_pat = _slice_bar_segment(pat_norm, steps_per_bar, bar_offset, bar_count)

    # Pre-parse notes chord (if provided)
    chord_pitches: Optional[List[int]] = None
    if ast.notes:
        try:
            chord_pitches = parse_notes_spec(ast.notes)
        except Exception as exc:
            diagnostics.append(
                Diagnostic(
                    level="error",
                    message=f"Node {node.id}: Invalid notes specification '{ast.notes}': {exc}",
                    line=1,
                    col=1,
                )
            )
            return []

    # Pre-parse sequence (if provided)
    seq_values: List[int] = []
    use_sequence = False
    if ast.sequence:
        try:
            seq_values = parse_sequence_spec(ast.sequence)
            use_sequence = True if seq_values else False
        except Exception as exc:
            diagnostics.append(
                Diagnostic(
                    level="error",
                    message=f"Node {node.id}: Invalid sequence specification '{ast.sequence}': {exc}",
                    line=1,
                    col=1,
                )
            )
            return []

    base_hit_idx = 0
    if use_sequence:
        hits = _hits_by_segment(pat_norm, steps_per_bar, bar_count)
        base_hit_idx = _compute_base_hit_index(bar_offset, bar_count, hits)

    events: List[Event] = []
    local_hit = 0

    for idx, ch in enumerate(bar_pat):
        if not _is_hit_char(ch):
            continue

        velocity = _intensity_to_velocity(ch)
        tbeat = (idx / steps_per_bar) * 4.0

        if use_sequence:
            pitch = seq_values[(base_hit_idx + local_hit) % len(seq_values)]
            local_hit += 1
            pitches = [pitch]
        elif chord_pitches is not None and len(chord_pitches) > 0:
            pitches = chord_pitches
        else:
            pitches = [LANE_TO_MIDI_NOTE.get(ast.lane, 60)]

        sustain = _count_sustain_steps(bar_pat, idx)
        duration = max(0.05, step_len_beats * (1 + sustain) * 0.95)

        events.append(
            Event(
                tBeat=tbeat,
                lane=ast.lane,
                note=pitches[0],
                pitches=pitches,
                velocity=velocity,
                durationBeats=duration,
                preset=ast.preset,
            )
        )

    return events


def _coerce_render_spec(value: object) -> RenderSpec:
    """
    Defensive: older frontends may send render as a raw dict.
    New models want RenderSpec so apply_render_chain can do render.strum / render.perc.
    """
    if isinstance(value, RenderSpec):
        return value
    if isinstance(value, dict):
        return RenderSpec.model_validate(value)
    return RenderSpec()


def compile_request(req: CompileRequest) -> CompileResponse:
    diagnostics: List[Diagnostic] = []
    events: List[Event] = []

    nodes = {n.id: n for n in req.nodes if n.enabled}
    outgoing: Dict[str, List[str]] = {node_id: [] for node_id in nodes}
    incoming: Dict[str, List[str]] = {node_id: [] for node_id in nodes}

    def resolve_port_type(node: NodeInput, direction: str, port_id: Optional[str], port_type: Optional[str]) -> Optional[str]:
        if port_type:
            return port_type
        ports = node.inputPorts if direction == "in" else node.outputPorts
        for port in ports:
            if port.id == port_id:
                return port.dataType
        return DEFAULT_PORT_TYPES.get((node.kind, direction))

    graph_edges: List[tuple[str, str, Optional[str], Optional[str]]] = []
    if req.edges:
        for edge in req.edges:
            from_id = edge.from_.nodeId
            to_id = edge.to.nodeId
            from_type = None
            to_type = None
            if from_id in nodes:
                from_type = resolve_port_type(nodes[from_id], "out", edge.from_.portId, edge.from_.portType)
            if to_id in nodes:
                to_type = resolve_port_type(nodes[to_id], "in", edge.to.portId, edge.to.portType)
            graph_edges.append((from_id, to_id, from_type, to_type))
    else:
        graph_edges = [
            (node.id, node.childId, DEFAULT_PORT_TYPES.get((node.kind, "out")), DEFAULT_PORT_TYPES.get(("theory", "in")))
            for node in nodes.values()
            if node.kind == "render" and node.childId
        ]

    for from_id, to_id, from_type, to_type in graph_edges:
        if from_id not in nodes:
            diagnostics.append(Diagnostic(level="error", message=f"Edge references missing node '{from_id}'", line=1, col=1))
            continue
        if to_id not in nodes:
            diagnostics.append(Diagnostic(level="error", message=f"Edge references missing node '{to_id}'", line=1, col=1))
            continue
        outgoing[from_id].append(to_id)
        incoming[to_id].append(from_id)
        if from_type is None or to_type is None:
            diagnostics.append(
                Diagnostic(
                    level="error",
                    message=f"Edge '{from_id}' -> '{to_id}' is missing a typed port definition.",
                    line=1,
                    col=1,
                )
            )
        elif from_type != to_type:
            diagnostics.append(
                Diagnostic(
                    level="error",
                    message=f"Edge '{from_id}' -> '{to_id}' connects incompatible port types ({from_type} -> {to_type}).",
                    line=1,
                    col=1,
                )
            )

    entry_nodes: List[str] = []
    if req.startNodeIds:
        for node_id in req.startNodeIds:
            if node_id not in nodes:
                diagnostics.append(
                    Diagnostic(level="error", message=f"Start node '{node_id}' is missing from graph.", line=1, col=1)
                )
                continue
            entry_nodes.append(node_id)
    else:
        entry_nodes = [node_id for node_id, node in nodes.items() if node.kind == "start"]

    if not entry_nodes:
        diagnostics.append(
            Diagnostic(level="error", message="No start nodes provided. Add a Start node to the graph.", line=1, col=1)
        )

    def add_type_mismatch(message: str) -> None:
        diagnostics.append(Diagnostic(level="error", message=message, line=1, col=1))

    for from_id, to_ids in outgoing.items():
        node = nodes[from_id]
        if node.kind == "theory" and to_ids:
            add_type_mismatch(f"Theory node '{from_id}' cannot have child edges.")
        if node.kind == "render" and len(to_ids) > 1:
            add_type_mismatch(f"Render node '{from_id}' has multiple child edges.")
        if node.kind == "start" and not to_ids:
            diagnostics.append(Diagnostic(level="error", message=f"Start node '{from_id}' has no outgoing edges.", line=1, col=1))
        for to_id in to_ids:
            target = nodes.get(to_id)
            if target and target.kind == "start":
                add_type_mismatch(f"Start node '{to_id}' cannot accept incoming edges.")

    reachable: Set[str] = set()
    execution_plan: List[str] = []
    visiting: Set[str] = set()
    schedule_steps = 0

    def walk(node_id: str, depth: int = 0) -> None:
        nonlocal schedule_steps
        if node_id in reachable:
            return
        if depth > MAX_GRAPH_DEPTH:
            diagnostics.append(
                Diagnostic(level="error", message=f"Loop guard tripped at '{node_id}' (depth {depth}).", line=1, col=1)
            )
            return
        if schedule_steps > MAX_SCHEDULE_STEPS:
            diagnostics.append(
                Diagnostic(
                    level="warn",
                    message=f"Scheduling horizon exceeded at '{node_id}'. Loop evaluation was bounded.",
                    line=1,
                    col=1,
                )
            )
            return
        schedule_steps += 1
        if node_id in visiting:
            diagnostics.append(Diagnostic(level="error", message=f"Cycle detected at '{node_id}'", line=1, col=1))
            return
        visiting.add(node_id)
        for child_id in outgoing.get(node_id, []):
            walk(child_id, depth + 1)
        visiting.remove(node_id)
        reachable.add(node_id)
        execution_plan.append(node_id)

    for node_id in entry_nodes:
        walk(node_id)

    for node_id in reachable:
        node = nodes[node_id]
        if node.kind in {"render", "theory"} and not incoming.get(node_id):
            diagnostics.append(
                Diagnostic(level="error", message=f"Node '{node_id}' is missing a required input.", line=1, col=1)
            )
        if node.kind == "render" and not outgoing.get(node_id):
            diagnostics.append(
                Diagnostic(level="error", message=f"Render node '{node_id}' is missing a child edge.", line=1, col=1)
            )

    compiled: Dict[str, List[Event]] = {}

    for node_id in execution_plan:
        node = nodes.get(node_id)
        if not node:
            continue
        children = outgoing.get(node_id, [])
        if node.kind == "start":
            aggregated: List[Event] = []
            for child_id in children:
                aggregated.extend(compiled.get(child_id, []))
            compiled[node_id] = aggregated
        elif node.kind == "render":
            child_id = children[0] if children else None
            if not child_id:
                compiled[node_id] = []
            else:
                child = compiled.get(child_id, [])
                render_spec = _coerce_render_spec(node.render)
                compiled[node_id] = apply_render_chain(child, render_spec, req)
        else:
            compiled[node_id] = _compile_theory_node(node, req.barIndex, req.bpm, diagnostics)

    for node_id in entry_nodes:
        events.extend(compiled.get(node_id, []))

    events.sort(key=lambda e: (e.tBeat, e.lane))
    return CompileResponse(
        ok=not any(d.level == "error" for d in diagnostics),
        diagnostics=diagnostics,
        barIndex=req.barIndex,
        loopBars=16,
        events=events,
    )
