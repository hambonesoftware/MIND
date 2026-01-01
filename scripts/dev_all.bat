@echo off
rem Launch the MIND backend with auto reload.  The backend also serves the
rem static frontend so only one process is required during development.

pushd %~dp0\..
cd backend
echo Starting MIND backend and frontend on http://localhost:8000
python -m uvicorn mind_api.main:app --reload --host 0.0.0.0 --port 8000
popd