"""Protocol import/export helpers for MIND graphs."""

from __future__ import annotations

from typing import Any, Dict, Optional

from pydantic import BaseModel, Field

from .immutables import GRAPH_VERSION, PROTOCOL_VERSION, RESOLVER_VERSION
from ..models import FlowGraph, FlowGraphEdge, FlowGraphNode


class ProtocolRoot(BaseModel):
    protocolVersion: str
    graphVersion: str
    resolverVersion: str
    nodes: list[Dict[str, Any]] = Field(default_factory=list)
    edges: list[Dict[str, Any]] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    extensions: Dict[str, Any] = Field(default_factory=dict)

    model_config = {"extra": "allow"}


def load_protocol_root(payload: Dict[str, Any]) -> ProtocolRoot:
    """Parse a protocol root payload into a ProtocolRoot model."""
    return ProtocolRoot.model_validate(payload)


def dump_protocol_root(root: ProtocolRoot) -> Dict[str, Any]:
    """Serialize a ProtocolRoot model into a JSON-safe dict."""
    return root.model_dump(mode="python", by_alias=True)


def export_protocol_graph(
    graph: FlowGraph,
    *,
    protocol_version: str = PROTOCOL_VERSION,
    graph_version: str = GRAPH_VERSION,
    resolver_version: str = RESOLVER_VERSION,
    metadata: Optional[Dict[str, Any]] = None,
    extensions: Optional[Dict[str, Any]] = None,
    extra_fields: Optional[Dict[str, Any]] = None,
) -> ProtocolRoot:
    """Build a protocol root object from a FlowGraph."""
    root = ProtocolRoot(
        protocolVersion=protocol_version,
        graphVersion=graph_version,
        resolverVersion=resolver_version,
        nodes=[node.model_dump(mode="python", by_alias=True) for node in graph.nodes],
        edges=[edge.model_dump(mode="python", by_alias=True) for edge in graph.edges],
        metadata=metadata or {},
        extensions=extensions or {},
    )
    if extra_fields:
        for key, value in extra_fields.items():
            setattr(root, key, value)
    return root


def import_protocol_graph(root: ProtocolRoot) -> FlowGraph:
    """Convert a protocol root object into a FlowGraph."""
    return FlowGraph(
        graphVersion=None,
        nodes=[FlowGraphNode.model_validate(node) for node in root.nodes],
        edges=[FlowGraphEdge.model_validate(edge) for edge in root.edges],
    )
