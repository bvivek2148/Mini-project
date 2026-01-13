from __future__ import annotations

import html
import json
from pathlib import Path
from typing import Any, Dict, List

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse, Response

from .storage import AlertStorage


BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"
ALERTS_FILE = DATA_DIR / "alerts.jsonl"

app = FastAPI(title="Ransom-Trap Alert Server")
storage = AlertStorage(ALERTS_FILE)


@app.get("/", response_class=HTMLResponse)
async def index() -> str:
    alerts: List[Dict[str, Any]] = list(reversed(storage.get_alerts()))
    rows = []
    for a in alerts:
        atype = html.escape(str(a.get("alert_type")))
        host = html.escape(str(a.get("host")))
        proc = html.escape(str(a.get("process_name")))
        pid = html.escape(str(a.get("pid")))
        ts = html.escape(str(a.get("timestamp")))
        path = html.escape(str(a.get("path", "")))
        rows.append(
            f"<tr><td>{atype}</td><td>{host}</td><td>{proc}</td><td>{pid}</td><td>{ts}</td><td>{path}</td></tr>"
        )

    body = "".join(rows) or "<tr><td colspan='6'><em>No alerts yet</em></td></tr>"

    html_doc = f"""
    <html>
      <head>
        <title>Ransom-Trap Alerts</title>
        <style>
          body {{ font-family: Arial, sans-serif; }}
          table {{ border-collapse: collapse; width: 100%; }}
          th, td {{ border: 1px solid #ccc; padding: 4px 8px; font-size: 13px; }}
          th {{ background-color: #f0f0f0; }}
        </style>
      </head>
      <body>
        <h1>Ransom-Trap Alerts</h1>
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Host</th>
              <th>Process</th>
              <th>PID</th>
              <th>Timestamp</th>
              <th>Path</th>
            </tr>
          </thead>
          <tbody>
            {body}
          </tbody>
        </table>
      </body>
    </html>
    """
    return html_doc


@app.get("/alerts", response_class=JSONResponse)
async def list_alerts() -> List[Dict[str, Any]]:
    return storage.get_alerts()


@app.get("/favicon.ico")
async def favicon() -> Response:
    # Return an empty 204 response so browsers stop logging 404s for the favicon.
    return Response(status_code=204)


@app.post("/alerts", response_class=JSONResponse)
async def create_alert(request: Request) -> Dict[str, Any]:
    data = await request.json()
    if not isinstance(data, dict):
        return {"status": "error", "message": "Alert payload must be a JSON object"}

    storage.add_alert(data)
    return {"status": "ok"}
