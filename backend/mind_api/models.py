from __future__ import annotations

from typing import Any, List, Literal, Optional

from pydantic import BaseModel, Field


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
    directionByStep: bool = False


class PercSpec(BaseModel):
    enabled: bool = False
    hat: str = "."
    kick: str = "."
    snare: str = "."


class RenderSpec(BaseModel):
    strum: Optional[StrumSpec] = None
    perc: Optional[PercSpec] = None


# ---------------------------
# Compile models
# ---------------------------

class NodeInput(BaseModel):
    id: str
    kind: Literal["theory", "render"] = "theory"
    enabled: bool = True

    # theory nodes
    text: Optional[str] = None

    # render nodes
    # IMPORTANT: this must be a RenderSpec (not a Dict) so apply_render_chain can do render.strum.enabled
    render: Optional[RenderSpec] = None
    childId: Optional[str] = None


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
    debug: bool = False


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
