from __future__ import annotations

from typing import Any, List, Literal, Optional

from pydantic import BaseModel, Field, field_validator


# ---------------------------
# Diagnostics / Parse models
# ---------------------------

class Diagnostic(BaseModel):
    level: Literal["error", "warn", "warning", "info"] = "error"
    message: str
    line: int = 1
    col: int = 1


class ParseRequest(BaseModel):
    text: str = ""


class ParsedAST(BaseModel):
    # NOTE: "motions" is not used for beat() nodes, but we keep it optional so any
    # compiler code that accidentally does ast.motions won't crash.
    kind: Literal["beat"] = "beat"

    lane: str
    pattern: str
    grid: str = "1/4"
    bars: str = "1-16"
    preset: Optional[str] = None

    # v0.3.1+ note system
    notes: Optional[str] = None      # colon-separated chord notes (C4:E4:G4 or 60:64:67)
    poly: Optional[str] = None       # mono | poly | choke
    sequence: Optional[str] = None   # whitespace-separated stepping notes (C4 D4 E4 ...)

    motions: Optional[str] = None    # kept for safety/compat only


class EquationAST(BaseModel):
    kind: Literal["equation"] = "equation"

    name: Optional[str] = None
    lane: str = "note"
    grid: str = "1/12"
    bars: str = "1-16"
    preset: Optional[str] = None

    key: Optional[str] = None
    harmony: Optional[str] = None
    motions: Optional[str] = None


class ParseResponse(BaseModel):
    ok: bool = True
    diagnostics: List[Diagnostic] = Field(default_factory=list)

    # routes.py returns a ParsedAST or EquationAST instance
    ast: Optional[Any] = None


# ---------------------------
# Render pipeline models
# (required by mind_core/post/*)
# ---------------------------

class StrumSpec(BaseModel):
    enabled: bool = False
    spreadMs: int = 0
    directionByStep: Optional[str] = None

    @field_validator("directionByStep", mode="before")
    @classmethod
    def normalize_direction(cls, value: Any) -> Optional[str]:
        if value is True:
            return "D"
        if value in (False, None):
            return None
        return value


class PercSpec(BaseModel):
    enabled: bool = False
    grid: Optional[str] = None
    hat: str = "."
    kick: str = "."
    snare: str = "."


class RenderSpec(BaseModel):
    strum: Optional[StrumSpec] = None
    perc: Optional[PercSpec] = None


# ---------------------------
# Compile models
# ---------------------------

class PortDefinition(BaseModel):
    id: str
    direction: Literal["in", "out"] = "in"
    dataType: Literal["flow", "events"] = "flow"
    required: bool = True


class NodeInput(BaseModel):
    id: str
    kind: Literal["theory", "render", "start"] = "theory"
    enabled: bool = True

    # theory nodes
    text: Optional[str] = None

    # render nodes
    # IMPORTANT: this must be a RenderSpec (not a Dict) so apply_render_chain can do render.strum.enabled
    render: Optional[RenderSpec] = None
    childId: Optional[str] = None
    inputPorts: List["PortDefinition"] = Field(default_factory=list)
    outputPorts: List["PortDefinition"] = Field(default_factory=list)

    @field_validator("kind", mode="before")
    @classmethod
    def normalize_kind(cls, value: Any) -> Any:
        if value is None:
            return "theory"
        if isinstance(value, str):
            return value.lower()
        return value

    @field_validator("render", mode="before")
    @classmethod
    def coerce_render(cls, value: Any) -> Any:
        if value is None:
            return None
        if isinstance(value, RenderSpec):
            return value
        if isinstance(value, dict):
            return RenderSpec.model_validate(value)
        return value

    @field_validator("inputPorts", "outputPorts", mode="before")
    @classmethod
    def coerce_ports(cls, value: Any) -> Any:
        if value is None:
            return []
        if isinstance(value, list):
            return [PortDefinition.model_validate(item) if isinstance(item, dict) else item for item in value]
        return value


class Event(BaseModel):
    tBeat: float
    lane: str

    # Back-compat single pitch alias + new multi-pitch support
    note: Optional[int] = None
    pitches: List[int] = Field(default_factory=list)

    velocity: int = 100
    durationBeats: float = 0.25
    preset: Optional[str] = None


class CompileRequest(BaseModel):
    seed: int = 0
    bpm: float = 120.0
    barIndex: int = 0
    nodes: List[NodeInput] = Field(default_factory=list)
    edges: List["EdgeInput"] = Field(default_factory=list)
    startNodeIds: List[str] = Field(default_factory=list)
    debug: bool = False

    @field_validator("seed", mode="before")
    @classmethod
    def coerce_seed(cls, value: Any) -> Any:
        return 0 if value is None else value

    @field_validator("bpm", mode="before")
    @classmethod
    def coerce_bpm(cls, value: Any) -> Any:
        return 120.0 if value is None else value

    @field_validator("barIndex", mode="before")
    @classmethod
    def coerce_bar_index(cls, value: Any) -> Any:
        return 0 if value is None else value

    @field_validator("nodes", mode="before")
    @classmethod
    def coerce_nodes(cls, value: Any) -> Any:
        if value is None:
            return []
        if isinstance(value, list):
            cleaned = []
            for item in value:
                if item is None:
                    continue
                if isinstance(item, dict):
                    if not item.get("id"):
                        continue
                cleaned.append(item)
            return cleaned
        return value

    @field_validator("edges", mode="before")
    @classmethod
    def coerce_edges(cls, value: Any) -> Any:
        if value is None:
            return []
        if isinstance(value, list):
            cleaned = []
            for item in value:
                if not item:
                    continue
                if isinstance(item, dict):
                    if not item.get("from") or not item.get("to"):
                        continue
                cleaned.append(item)
            return cleaned
        return value

    @field_validator("startNodeIds", mode="before")
    @classmethod
    def coerce_start_nodes(cls, value: Any) -> Any:
        if value is None:
            return []
        if isinstance(value, list):
            return [str(item) for item in value if item]
        return value


class CompileResponse(BaseModel):
    ok: bool = True
    diagnostics: List[Diagnostic] = Field(default_factory=list)
    barIndex: int = 0
    loopBars: int = 16
    events: List[Event] = Field(default_factory=list)
    debugText: Optional[str] = None


# ---------------------------
# Preset models (required by routes.py)
# ---------------------------

class Preset(BaseModel):
    id: str
    name: str


class PresetsResponse(BaseModel):
    presets: List[Preset] = Field(default_factory=list)


# ---------------------------
# Graph edge models
# ---------------------------

class EdgeEndpoint(BaseModel):
    nodeId: str
    portId: Optional[str] = None
    portType: Optional[Literal["flow", "events"]] = None


class EdgeInput(BaseModel):
    id: Optional[str] = None
    from_: EdgeEndpoint = Field(alias="from")
    to: EdgeEndpoint

    @field_validator("from_", "to", mode="before")
    @classmethod
    def coerce_endpoint(cls, value: Any) -> Any:
        if isinstance(value, dict):
            return EdgeEndpoint.model_validate(value)
        return value
