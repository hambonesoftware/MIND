"""
API route definitions for the MIND backend.

This module defines the FastAPI router used by ``main.create_app``.
Separate endpoints handle parsing, compilation and preset retrieval.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import List

from fastapi import APIRouter, HTTPException

from .models import (
    ParseRequest,
    ParseResponse,
    CompileRequest,
    CompileResponse,
    PresetsResponse,
    Preset,
)
from .mind_core.parser import parse_text
from .mind_core.compiler import compile_request
from .mind_core.stream_runtime import run_stream_runtime


api_router = APIRouter()


@api_router.post("/parse", response_model=ParseResponse)
async def api_parse(req: ParseRequest) -> ParseResponse:
    """Validate a node script and return an AST and diagnostics."""
    ast, diagnostics = parse_text(req.text)
    ok = not diagnostics
    return ParseResponse(ok=ok, ast=ast, diagnostics=diagnostics)


@api_router.post("/compile", response_model=CompileResponse)
async def api_compile(req: CompileRequest) -> CompileResponse:
    """Compile latched nodes into a list of events for the current bar."""
    if req.flowGraph and req.flowGraph.graphVersion == 9:
        return run_stream_runtime(req)
    return compile_request(req)


@api_router.get("/presets", response_model=PresetsResponse)
async def api_presets() -> PresetsResponse:
    """Return the list of available presets."""
    # Load presets from the JSON data file.  If the file is missing or
    # malformed the API falls back to a small set of defaults.
    data_path = Path(__file__).resolve().parent / "data" / "presets.json"
    presets: List[Preset] = []
    try:
        with data_path.open("r", encoding="utf-8") as f:
            raw = json.load(f)
            for item in raw.get("presets", []):
                if not isinstance(item, dict):
                    continue
                pid = str(item.get("id"))
                name = str(item.get("name"))
                presets.append(Preset(id=pid, name=name))
    except Exception:
        # Fallback defaults for v0.1
        presets = [
            Preset(id="gm_kick", name="Kick Drum"),
            Preset(id="gm_snare", name="Snare Drum"),
            Preset(id="gm_hat", name="Hi‑Hat"),
            Preset(id="gm_piano", name="Grand Piano"),
        ]
    return PresetsResponse(presets=presets)
