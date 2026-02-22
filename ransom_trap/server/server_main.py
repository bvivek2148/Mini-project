from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path
from typing import Any, Dict, List

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse, Response
from fastapi.staticfiles import StaticFiles

from .storage import AlertStorage


BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"
ALERTS_FILE = DATA_DIR / "alerts.jsonl"
DASHBOARD_DIST = BASE_DIR / "dashboard" / "dist"

app = FastAPI(title="Ransom-Trap Alert Server")

# Allow the Vite dev server (localhost:5173) to call the API without CORS errors
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

storage = AlertStorage(ALERTS_FILE)

# Agent process handle (managed by /agent/start and /agent/stop)
_agent_process: subprocess.Popen | None = None


def _agent_running() -> bool:
    """Return True if the agent subprocess is alive."""
    return _agent_process is not None and _agent_process.poll() is None


# Serve built React SPA static assets if available
if DASHBOARD_DIST.exists():
    app.mount("/assets", StaticFiles(directory=DASHBOARD_DIST / "assets"), name="assets")


# ------------------------------------------------------------------
# Root — redirect to the dashboard (no more raw HTML table)
# ------------------------------------------------------------------

@app.get("/", include_in_schema=False)
async def index() -> Response:
    """Redirect to the React dashboard (dev: localhost:5173, prod: /dashboard)."""
    dash_html = DASHBOARD_DIST / "index.html"
    if dash_html.exists():
        from fastapi.responses import HTMLResponse
        return HTMLResponse(dash_html.read_text(encoding="utf-8"))
    # Dev mode: redirect to the Vite dev server
    return RedirectResponse(url="http://localhost:5173/dashboard", status_code=302)


# ------------------------------------------------------------------
# Alerts API
# ------------------------------------------------------------------

@app.get("/alerts", response_class=JSONResponse)
async def list_alerts() -> List[Dict[str, Any]]:
    return storage.get_alerts()


@app.delete("/alerts", response_class=JSONResponse)
async def clear_alerts() -> Dict[str, Any]:
    """Clear all stored alerts."""
    storage.alerts.clear()
    try:
        ALERTS_FILE.write_text("", encoding="utf-8")
    except OSError:
        pass
    return {"status": "cleared"}


@app.post("/alerts", response_class=JSONResponse)
async def create_alert(request: Request) -> Dict[str, Any]:
    data = await request.json()
    if not isinstance(data, dict):
        return {"status": "error", "message": "Alert payload must be a JSON object"}
    storage.add_alert(data)
    return {"status": "ok"}


@app.get("/favicon.ico")
async def favicon() -> Response:
    return Response(status_code=204)


@app.get("/honeytokens", response_class=JSONResponse)
async def list_honeytokens() -> List[Dict[str, Any]]:
    """Return deployed honeytoken files derived from config.yaml."""
    import yaml  # noqa: PLC0415

    config_path = BASE_DIR / "config" / "config.yaml"
    try:
        cfg = yaml.safe_load(config_path.read_text(encoding="utf-8")) or {}
    except Exception:
        cfg = {}

    ht_cfg = cfg.get("honeytokens", {})
    file_names = ht_cfg.get("file_names", [])
    ht_paths = (cfg.get("agent", {}) or {}).get("honeytoken_paths", [])

    # Build list of deployed tokens
    alerts = storage.get_alerts()
    triggered_paths = {
        a.get("path", "").lower()
        for a in alerts
        if a.get("alert_type") == "honeytoken_access"
    }

    tokens = []
    for path in ht_paths:
        for name in file_names:
            full_path = f"{path}\\{name}".lower()
            triggered = any(full_path in tp or tp in full_path for tp in triggered_paths)
            # Find latest alert for this token
            latest_alert = None
            for a in reversed(alerts):
                if a.get("alert_type") == "honeytoken_access" and name.lower() in (a.get("path") or "").lower():
                    latest_alert = a
                    break
            tokens.append({
                "name": name,
                "path": path,
                "full_path": f"{path}\\{name}",
                "status": "TRIGGERED" if triggered else "monitoring",
                "last_alert_ts": latest_alert.get("timestamp") if latest_alert else None,
                "host": latest_alert.get("host") if latest_alert else None,
            })

    return tokens


@app.get("/config", response_class=JSONResponse)
async def get_config() -> Dict[str, Any]:
    """Return relevant detection config values."""
    import yaml  # noqa: PLC0415

    config_path = BASE_DIR / "config" / "config.yaml"
    try:
        cfg = yaml.safe_load(config_path.read_text(encoding="utf-8")) or {}
    except Exception:
        cfg = {}
    return {
        "entropy_threshold": (cfg.get("detection") or {}).get("entropy_threshold", 7.0),
        "min_suspicious_files": (cfg.get("detection") or {}).get("min_suspicious_files", 3),
        "time_window_seconds": (cfg.get("detection") or {}).get("time_window_seconds", 5),
        "kill_on_detection": (cfg.get("detection") or {}).get("kill_on_detection", False),
        "monitored_paths": (cfg.get("agent") or {}).get("monitored_paths", []),
        "honeytoken_paths": (cfg.get("agent") or {}).get("honeytoken_paths", []),
        "honeytoken_files": (cfg.get("honeytokens") or {}).get("file_names", []),
    }



# ------------------------------------------------------------------
# Agent control API
# ------------------------------------------------------------------

@app.get("/agent/status", response_class=JSONResponse)
async def agent_status() -> Dict[str, Any]:
    """Return whether the agent process is currently running."""
    running = _agent_running()
    return {"running": running, "pid": _agent_process.pid if running else None}


@app.post("/agent/start", response_class=JSONResponse)
async def agent_start() -> Dict[str, Any]:
    """Start the agent subprocess if it is not already running."""
    global _agent_process
    if _agent_running():
        return {"status": "already_running", "pid": _agent_process.pid}

    config_path = BASE_DIR / "config" / "config.yaml"
    cmd = [sys.executable, "-m", "agent.agent_main", "--config", str(config_path)]
    _agent_process = subprocess.Popen(
        cmd,
        cwd=str(BASE_DIR),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    return {"status": "started", "pid": _agent_process.pid}


@app.post("/agent/stop", response_class=JSONResponse)
async def agent_stop() -> Dict[str, Any]:
    """Stop the agent subprocess if it is running."""
    global _agent_process
    if not _agent_running():
        return {"status": "not_running"}

    pid = _agent_process.pid
    _agent_process.terminate()
    try:
        _agent_process.wait(timeout=5)
    except subprocess.TimeoutExpired:
        _agent_process.kill()
        _agent_process.wait()
    _agent_process = None
    return {"status": "stopped", "pid": pid}
