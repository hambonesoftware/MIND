#!/bin/bash

# Launch only the backend API.  This is useful if you want to
# develop against a separate frontend server.  By default the
# backend also serves the frontend when run via ``dev_all.sh``.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/../backend"

echo "Starting MIND backend on http://localhost:8000"
exec uvicorn mind_api.main:app --reload --host 0.0.0.0 --port 8000