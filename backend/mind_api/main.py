"""
Main entry point for the MIND backend.

This module sets up a FastAPI application that exposes a simple API for
parsing and compiling MIND node scripts and serves the static frontend
and documentation.  When run via ``uvicorn`` the backend will listen on
the configured port and serve both the API under ``/api`` and the
frontend user interface at the root path.

The API consists of three endpoints:

* ``POST /api/parse`` – validate a single node script and return a
  structured representation along with any diagnostics.
* ``POST /api/compile`` – given the current session state (seed, bpm,
  bar index and an array of nodes) compile events for the current bar
  of the 16‑bar loop.
* ``GET /api/presets`` – return a list of available preset IDs and
  human friendly names.  These values populate the preset dropdown in
  the frontend.

Static assets are mounted under ``/assets``, documentation under
``/docs`` and the frontend itself is served from ``/``.  The
FastAPI application is constructed in this module so that it can be
imported by ``uvicorn`` with the typical ``module:app`` syntax.
"""

from __future__ import annotations

import json
from pathlib import Path
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from .routes import api_router


# Determine package root and asset locations.  We resolve paths
# relative to this file to avoid depending on the working directory at
# startup time.
BASE_DIR = Path(__file__).resolve().parent.parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"
DOCS_DIR = BASE_DIR / "docs"
ASSETS_DIR = BASE_DIR / "assets"

# Register the SoundFont MIME type.  The standard library does not
# recognise the ``.sf2`` extension by default, which results in
# ``application/octet-stream`` being sent.  Explicitly registering
# ``audio/sf2`` ensures clients treat the payload as a binary audio
# resource and allows proper caching.  This needs to occur before
# mounting the ``StaticFiles`` instance so that it applies to all
# responses.
import mimetypes  # noqa: E402
mimetypes.add_type("audio/sf2", ".sf2")


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    app = FastAPI(title="MIND Backend", version="0.1")

    # Include API routes under the "/api" prefix
    app.include_router(api_router, prefix="/api")

    # Mount static documentation and assets
    # The documentation contains the whitepaper and other markdown files.
    if DOCS_DIR.exists():
        app.mount("/docs", StaticFiles(directory=str(DOCS_DIR), html=True), name="docs")
    # Assets such as images, wasm modules and soundfonts.
    if ASSETS_DIR.exists():
        # Configure StaticFiles for assets.  The default cache control
        # headers are acceptable for development but we enable
        # ``max_age`` to encourage browsers to cache large files such as
        # soundfonts and WebAssembly modules.  A value of one day
        # balances caching with update latency.  The ``html`` flag is
        # omitted here to allow raw binary files to be returned.
        app.mount(
            "/assets",
            StaticFiles(directory=str(ASSETS_DIR), html=False),
            name="assets",
        )
    # Serve the frontend; html=True ensures index.html is returned for
    # unknown paths so that client side routing works.
    if FRONTEND_DIR.exists():
        app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")

    return app


# Instantiate the application.  ``uvicorn`` will import this
# module and look for a top level ``app`` variable.
app = create_app()
