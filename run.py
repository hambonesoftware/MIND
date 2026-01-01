"""
Entry point for running the MIND application from the project root.

This script starts the FastAPI backend and serves the static frontend
and documentation.  It intentionally runs without the ``--reload``
flag to provide a single process suitable for distribution.  The
backend mounts the frontend under ``/`` and the assets under
``/assets``, so no separate frontend server is required.

Usage::

    python run.py

The server listens on all interfaces at port 8000 by default.
"""

import uvicorn

if __name__ == "__main__":
    # Import the FastAPI application lazily so that module side effects
    # (such as mimetype registrations) occur at runtime.  This import
    # statement locates the ``app`` object defined in
    # ``backend/mind_api/main.py`` and uses it for the ASGI server.
    from backend.mind_api.main import app  # noqa: E402

    # Launch the server.  The host and port may be customised via
    # environment variables or by editing these values.  We avoid
    # enabling ``reload`` to reduce overhead when packaging v0.3 for
    # distribution.  Developers can continue to use the scripts under
    # ``scripts/`` when iterating locally.
    uvicorn.run(app, host="0.0.0.0", port=8000)
