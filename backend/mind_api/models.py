"""
Pydantic models for the MIND API.

These models define the request and response bodies for the API
endpoints exposed by the backend. They leverage Pydantic v2's
``BaseModel`` to provide runtime validation and type hints for the
FastAPI framework.

The parser returns an abstract syntax tree (AST) describing the
contents of a single node script and a list of diagnostics in case
errors were encountered. The compiler produces a list of events for
a single bar of the loop given a session seed, BPM, bar index and the
currently latched nodes.

v0.4.5+ Pattern support:
- '.' = rest
- '0'..'9' = hit / note-on token
- '-' = sustain/tie marker (extends the previous hit by one grid step)
- spaces and '|' may be used for readability (ignored by compiler)

v0.4.6+ Multi-bar pattern support:
- A pattern MAY represent multiple bars (up to 16) when, after removing spaces and '|',
  its length is an exact multiple of steps_per_bar for the chosen grid.

v0.4.7+ Triplet-friendly grids:
- grid="1/12" => 12 steps per bar (3 per beat; supports quarter-note triplets cleanly)
- grid="1/24" => 24 steps per bar (6 per beat; supports sixteenth-note triplets cleanly)
"""

from __future__ import annotations

from typing import List, Literal, Optional
from pydantic import BaseModel, Field


class Diagnostic(BaseModel):
    """Represents a diagnostic message returned by the parser or compiler."""

    level: str = Field(..., description="diagnostic level: error or warn")
    message: str = Field(..., description="human readable diagnostic message")
    line: int = Field(0, description="line number (1-indexed)")
    col: int = Field(0, description="column number (1-indexed)")


class ParseRequest(BaseModel):
    """Request body for the /api/parse endpoint."""

    text: str = Field(..., description="raw node script text to parse")


class ParsedAST(BaseModel):
    """Represents the parsed form of a node script."""

    lane: Optional[str] = Field(None, description="lane identifier: kick, snare, hat or note")
    pattern: Optional[str] = Field(
        None,
        description=(
            "pattern string using '.', digits, and '-' sustain markers. "
            "Spaces and '|' are allowed for readability. "
            "Pattern may optionally represent multiple bars (up to 16) when its normalized length "
            "(after removing spaces and '|') is a whole-number multiple of steps_per_bar for the chosen grid."
        ),
    )
    grid: Optional[str] = Field(
        None,
        description=(
            "grid division such as 1/4, 1/8, 1/12, 1/16, or 1/24. "
            "Triplet-friendly: 1/12 (12 steps/bar) and 1/24 (24 steps/bar)."
        ),
    )
    bars: Optional[str] = Field(None, description="bar range expressed as start-end")
    preset: Optional[str] = Field(None, description="preset identifier used for audio synthesis")

    # Optional colon-separated list of pitches. Each token may be
    # an integer MIDI note number or a note name such as C4, D#3, Bb2.
    # This specification allows users to define chords for a single hit.
    # When ``sequence`` is provided this field is ignored.
    notes: Optional[str] = Field(
        None,
        description=(
            "colon-separated list of note names or MIDI numbers. "
            "This is used to specify chords (multi-note events) when no sequence is provided."
        ),
    )

    # Polyphony policy for this node. Supported values:
    #   "mono"  – shorten each event's duration so that it ends before the next event
    #   "poly"  – allow overlapping events (default behaviour)
    #   "choke" – drum-group choking; hats cut hats, etc. Currently treated as mono for the hat lane.
    poly: Optional[str] = Field(
        None,
        description="polyphony policy (mono, poly or choke). If omitted defaults to poly.",
    )

    # Melodic sequence specification. A whitespace-separated list of MIDI numbers
    # or note names (e.g. "C4 D4 E4 G4" or "60 62 64 67"). When present the
    # sequence overrides the notes specification and causes each hit to advance
    # through the sequence deterministically.
    sequence: Optional[str] = Field(
        None,
        description=(
            "melodic stepping sequence (whitespace-separated notes or MIDI numbers). "
            "When present this overrides the notes specification and each hit outputs one pitch."
        ),
    )


class ParseResponse(BaseModel):
    """Response body for the /api/parse endpoint."""

    ok: bool
    ast: Optional[ParsedAST] = None
    diagnostics: List[Diagnostic] = Field(default_factory=list)


class NodeInput(BaseModel):
    """Represents a node sent to the compiler."""

    id: str = Field(..., description="unique identifier for the node on the client")
    kind: Literal["theory", "render"] = Field(
        "theory",
        description="node type (theory or render)",
    )
    text: Optional[str] = Field(
        None,
        description="latched text of the node script (theory nodes only)",
    )
    childId: Optional[str] = Field(
        None,
        description="child node id (render nodes only)",
    )
    render: Optional["RenderSpec"] = Field(
        None,
        description="render spec for post-processing (render nodes only)",
    )
    enabled: bool = Field(True, description="whether the node is active")


class StrumSpec(BaseModel):
    """Represents a strum render spec for chord post-processing."""

    grid: Optional[str] = Field(None, description="grid division such as 1/8 or 1/16")
    directionPattern: Optional[str] = Field(
        None,
        description="pattern describing strum direction steps",
    )
    spreadMs: Optional[int] = Field(None, description="spread in milliseconds")


class PercSpec(BaseModel):
    """Represents a percussion render spec for mask-driven drums."""

    grid: Optional[str] = Field(None, description="grid division such as 1/8 or 1/16")
    kickMask: Optional[str] = Field(None, description="kick mask pattern")
    snareMask: Optional[str] = Field(None, description="snare mask pattern")
    hatMask: Optional[str] = Field(None, description="hat mask pattern")


class RenderSpec(BaseModel):
    """Represents render parameters for post-processing."""

    strum: Optional[StrumSpec] = None
    perc: Optional[PercSpec] = None


class CompileRequest(BaseModel):
    """Request body for the /api/compile endpoint."""

    seed: int = Field(..., description="seed for deterministic randomisation")
    bpm: float = Field(..., description="tempo in beats per minute")
    barIndex: int = Field(..., ge=0, le=15, description="current bar index (0–15) within the 16-bar loop")
    nodes: List[NodeInput] = Field(..., description="latched nodes used for compilation")


class Event(BaseModel):
    """Represents a musical event scheduled within a bar.

    In v0.3.1+ an event may represent a chord containing multiple
    pitches. The ``pitches`` field stores all MIDI note numbers
    associated with the event. For backwards compatibility the
    legacy ``note`` field remains as an optional alias referencing
    the first pitch in the list. When no pitches are present
    ``note`` will be ``None``.
    """

    tBeat: float = Field(..., description="beat offset within the bar (0–4)")
    lane: str = Field(..., description="lane identifier")
    note: Optional[int] = Field(None, description="legacy MIDI note alias (first pitch)")
    pitches: List[int] = Field(default_factory=list, description="MIDI pitch numbers")
    velocity: int = Field(..., ge=1, le=127, description="velocity 1–127")
    durationBeats: float = Field(..., description="duration of the event in beats")
    preset: Optional[str] = Field(None, description="preset id associated with the node")


class CompileResponse(BaseModel):
    """Response body for the /api/compile endpoint."""

    ok: bool
    diagnostics: List[Diagnostic] = Field(default_factory=list)
    barIndex: int = Field(..., description="bar index echoed back from the request")
    loopBars: int = Field(..., description="length of the loop in bars (always 16)")
    events: List[Event] = Field(default_factory=list)


class Preset(BaseModel):
    """Represents a synthesizer preset available to the client."""

    id: str
    name: str


class PresetsResponse(BaseModel):
    """Response body for the /api/presets endpoint."""

    presets: List[Preset] = Field(default_factory=list)
