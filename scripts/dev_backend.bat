@echo off
rem Launch only the MIND backend API.  Use dev_all.bat to serve
rem both API and frontend in one process.

pushd %~dp0\..
cd backend
echo Starting MIND backend on http://localhost:8000
python -m uvicorn mind_api.main:app --reload --host 0.0.0.0 --port 8000
popd