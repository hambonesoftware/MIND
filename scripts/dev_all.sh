#!/bin/bash

# This script launches the entire MIND application in one process.  The
# backend serves both API endpoints and the static frontend assets, so
# there is no separate frontend dev server.  Use this script during
# development to start the app with code reloading enabled.

set -euo pipefail

# Resolve the directory of this script and move into the project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="${SCRIPT_DIR}/.."

cd "$PROJECT_ROOT/backend"

echo "Starting MIND backend and frontend on http://localhost:8000"
exec uvicorn mind_api.main:app --reload --host 0.0.0.0 --port 8000