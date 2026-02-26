from __future__ import annotations

import subprocess
import sys
from pathlib import Path
from typing import Any, Dict, List

from fastapi import FastAPI, Request, UploadFile, File
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
    # Fire email notification in background (non-blocking)
    import threading
    threading.Thread(target=_send_email_alert, args=(data,), daemon=True).start()
    return {"status": "ok"}


# ------------------------------------------------------------------
# Alert acknowledgment
# ------------------------------------------------------------------

@app.patch("/alerts/{index}", response_class=JSONResponse)
async def patch_alert(index: int, request: Request) -> Dict[str, Any]:
    """Update a specific alert's status/notes (acknowledge, resolve, escalate)."""
    patch = await request.json()
    if not isinstance(patch, dict):
        return JSONResponse({"error": "Patch must be a JSON object"}, status_code=400)
    ok = storage.update_alert(index, patch)
    if not ok:
        return JSONResponse({"error": "Alert index out of range"}, status_code=404)
    return {"status": "ok", "index": index}


# ------------------------------------------------------------------
# Email notification helper
# ------------------------------------------------------------------

def _load_config_raw() -> Dict:
    """Load config.yaml as a dict (returns {} on error)."""
    import yaml
    try:
        return yaml.safe_load((BASE_DIR / "config" / "config.yaml").read_text(encoding="utf-8")) or {}
    except Exception:
        return {}


def _dispatch_notifications(alert: Dict[str, Any]) -> None:
    """Dispatches all enabled notifications sequentially in the background thread."""
    _send_email_alert(alert)
    _send_telegram_alert(alert)
    _send_whatsapp_alert(alert)


def _send_email_alert(alert: Dict[str, Any]) -> None:
    """Send an email notification for *alert* if SMTP is configured."""
    import smtplib
    from email.mime.text import MIMEText

    cfg = _load_config_raw()
    email_cfg = (cfg.get("notifications") or {}).get("email") or {}
    if not email_cfg.get("enabled"):
        return

    host = email_cfg.get("smtp_host", "smtp.gmail.com")
    port = int(email_cfg.get("smtp_port", 587))
    user = email_cfg.get("smtp_user", "")
    password = email_cfg.get("smtp_password", "")
    recipients = email_cfg.get("recipients") or []
    if not recipients or not user:
        return

    alert_type = alert.get("alert_type", "unknown")
    machine = alert.get("host", "unknown")
    subject = f"[Ransom-Trap] 🚨 {alert_type.upper()} on {machine}"
    body = (
        f"Alert detected by Ransom-Trap agent.\n\n"
        f"Type   : {alert_type}\n"
        f"Host   : {machine}\n"
        f"Process: {alert.get('process_name', '—')} (PID {alert.get('pid', '—')})\n"
        f"Path   : {alert.get('path', '—')}\n"
    )

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = user
    msg["To"] = ", ".join(recipients)

    try:
        with smtplib.SMTP(host, port, timeout=10) as smtp:
            smtp.ehlo()
            smtp.starttls()
            smtp.login(user, password)
            smtp.sendmail(user, recipients, msg.as_string())
    except Exception:
        pass  # Silently ignore – notification is best-effort


def _send_telegram_alert(alert: Dict[str, Any]) -> None:
    """Send a Telegram message via bot API."""
    import requests

    cfg = _load_config_raw()
    tg_cfg = (cfg.get("notifications") or {}).get("telegram") or {}
    if not tg_cfg.get("enabled"):
        return

    bot_token = tg_cfg.get("bot_token")
    chat_id = tg_cfg.get("chat_id")
    if not bot_token or not chat_id:
        return

    alert_type = alert.get("alert_type", "unknown")
    machine = alert.get("host", "unknown")
    text = (
        f"🚨 *Ransom-Trap Alert*\n"
        f"Type: `{alert_type}`\n"
        f"Host: `{machine}`\n"
        f"Process: `{alert.get('process_name', '—')}`\n"
        f"Path: `{alert.get('path', '—')}`"
    )

    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    try:
        requests.post(url, json={"chat_id": chat_id, "text": text, "parse_mode": "MarkdownV2"}, timeout=5)
    except Exception:
        pass


def _send_whatsapp_alert(alert: Dict[str, Any]) -> None:
    """Send a WhatsApp message via Meta Cloud API."""
    import requests

    cfg = _load_config_raw()
    wa_cfg = (cfg.get("notifications") or {}).get("whatsapp") or {}
    if not wa_cfg.get("enabled"):
        return

    api_token = wa_cfg.get("api_token")
    phone_id = wa_cfg.get("phone_number_id")
    target = wa_cfg.get("target_number")
    if not api_token or not phone_id or not target:
        return

    alert_type = alert.get("alert_type", "unknown")
    machine = alert.get("host", "unknown")
    text = (
        f"🚨 *Ransom-Trap Alert*\n"
        f"Type: {alert_type}\n"
        f"Host: {machine}\n"
        f"Process: {alert.get('process_name', '—')}"
    )

    url = f"https://graph.facebook.com/v17.0/{phone_id}/messages"
    headers = {"Authorization": f"Bearer {api_token}", "Content-Type": "application/json"}
    payload = {
        "messaging_product": "whatsapp",
        "to": target,
        "type": "text",
        "text": {"body": text}
    }
    try:
        requests.post(url, headers=headers, json=payload, timeout=5)
    except Exception:
        pass


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
        "email_enabled": (cfg.get("notifications") or {}).get("email", {}).get("enabled", False),
        "telegram_enabled": (cfg.get("notifications") or {}).get("telegram", {}).get("enabled", False),
        "whatsapp_enabled": (cfg.get("notifications") or {}).get("whatsapp", {}).get("enabled", False),
    }


@app.patch("/config", response_class=JSONResponse)
async def patch_config(request: Request) -> Dict[str, Any]:
    """Live-update detection settings in config.yaml."""
    import yaml

    patch = await request.json()
    if not isinstance(patch, dict):
        return JSONResponse({"error": "Body must be a JSON object"}, status_code=400)

    config_path = BASE_DIR / "config" / "config.yaml"
    try:
        cfg = yaml.safe_load(config_path.read_text(encoding="utf-8")) or {}
    except Exception:
        cfg = {}

    # Apply supported fields
    detection = cfg.setdefault("detection", {})
    notifications = cfg.setdefault("notifications", {})
    agent = cfg.setdefault("agent", {})
    email_cfg = notifications.setdefault("email", {})
    tg_cfg = notifications.setdefault("telegram", {})
    wa_cfg = notifications.setdefault("whatsapp", {})

    if "monitored_paths" in patch:
        agent["monitored_paths"] = patch["monitored_paths"]
    if "kill_on_detection" in patch:
        detection["kill_on_detection"] = bool(patch["kill_on_detection"])
    if "entropy_threshold" in patch:
        detection["entropy_threshold"] = float(patch["entropy_threshold"])
    if "min_suspicious_files" in patch:
        detection["min_suspicious_files"] = int(patch["min_suspicious_files"])
    if "time_window_seconds" in patch:
        detection["time_window_seconds"] = int(patch["time_window_seconds"])
    if "email_enabled" in patch:
        email_cfg["enabled"] = bool(patch["email_enabled"])
    if "telegram_enabled" in patch:
        tg_cfg["enabled"] = bool(patch["telegram_enabled"])
    if "whatsapp_enabled" in patch:
        wa_cfg["enabled"] = bool(patch["whatsapp_enabled"])

    try:
        config_path.write_text(yaml.dump(cfg, default_flow_style=False, allow_unicode=True), encoding="utf-8")
    except Exception as exc:
        return JSONResponse({"error": f"Failed to save config: {exc}"}, status_code=500)

    return {"status": "ok"}


@app.post("/scan", response_class=JSONResponse)
async def scan_files(files: List[UploadFile] = File(...)) -> Dict[str, Any]:
    """On-demand Drag and Drop Scanner."""
    import tempfile
    from agent.entropy import compute_shannon_entropy

    cfg = _load_config_raw()
    threshold = (cfg.get("detection") or {}).get("entropy_threshold", 7.0)

    results = []
    for file in files:
        content = await file.read()
        
        # Write to a temp file so we can reuse the agent's OS-level entropy function
        with tempfile.NamedTemporaryFile(delete=False) as tmp:
            tmp.write(content)
            tmp_path = tmp.name

        entropy = compute_shannon_entropy(tmp_path)
        Path(tmp_path).unlink(missing_ok=True)
        if entropy is None:
            entropy = 0.0

        results.append({
            "filename": file.filename,
            "entropy": round(entropy, 3),
            "compromised": entropy >= threshold
        })

    return {"results": results}


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
