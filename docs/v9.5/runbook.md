# V9.5 Local Runbook

## Environments
- **Repo root:** `/workspace/MIND`
- **Backend + frontend entrypoint:** `python run.py`
- **Default URL:** `http://127.0.0.1:8000`
- **Branch (baseline capture):** `work`
- **Python:** 3.12.12

## Start commands
```bash
# Install backend/frontend dependencies
pip install -r requirements.txt

# (optional) Install Playwright + browsers for automated repro/screenshot capture
pip install playwright
playwright install firefox

# Run backend + bundled frontend from repo root
python run.py
```
The FastAPI server serves the frontend assets directly; no separate `npm` step is needed for the UI when using `run.py`.

## User-gesture policy for audio
- Audio contexts start only after an explicit gesture.
- Use the **Play** button in the transport bar as the canonical gesture to start or resume audio.
- Expect autoplay warnings on load when no gesture has occurred yet.

## Standard repro loop (Phase 0 baseline)
1. Start the server with `python run.py` and open `http://127.0.0.1:8000` in Chrome/Firefox.
2. Open DevTools Console and **hard refresh** once.
3. Wait 3 seconds without interacting to record any autoplay/gesture warnings.
4. Click **Play** once; let it run ~10 seconds; click **Stop**.
5. Repeat Play/Stop three times.

## Log and artifact capture
- With DevTools open, right-click the console → **Save as...** and store as `docs/v9.5/phase-0/console.log.txt`.
- Take a full-page screenshot of the canvas + executions panel and store as `docs/v9.5/phase-0/screenshot.png`.
- Summarize observations (errors, warnings, behavior) in `docs/v9.5/phase-0/notes.md`.
