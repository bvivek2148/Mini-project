from __future__ import annotations

import json
import logging
from typing import Any, Dict, Optional

import psutil
import requests


class ResponseHandler:
    """Handles alert logging, HTTP beacons, and optional process killing."""

    def __init__(
        self,
        alert_server_url: str,
        kill_on_detection: bool,
        logger: Optional[logging.Logger] = None,
    ) -> None:
        self.alert_server_url = alert_server_url.rstrip("/")
        self.kill_on_detection = kill_on_detection
        self.log = logger or logging.getLogger("ransom_trap.agent.response")

    def _post_alert(self, alert: Dict[str, Any]) -> None:
        url = f"{self.alert_server_url}/alerts"
        try:
            resp = requests.post(url, json=alert, timeout=5)
            if not resp.ok:
                self.log.warning("Failed to send alert: %s %s", resp.status_code, resp.text)
        except Exception as exc:  # noqa: BLE001
            self.log.warning("Error sending alert to server: %s", exc)

    def log_alert(self, alert: Dict[str, Any]) -> None:
        self.log.info("ALERT: %s", json.dumps(alert, ensure_ascii=False))

    def maybe_kill_process(self, pid: Optional[int]) -> None:
        if not self.kill_on_detection or pid is None or pid <= 0:
            return
        try:
            proc = psutil.Process(pid)
            self.log.warning("Terminating suspected ransomware process pid=%s name=%s", pid, proc.name())
            proc.terminate()
        except (psutil.NoSuchProcess, psutil.AccessDenied) as exc:
            self.log.warning("Failed to terminate process %s: %s", pid, exc)
        except Exception as exc:  # noqa: BLE001
            self.log.warning("Unexpected error terminating process %s: %s", pid, exc)

    def handle_alert(self, alert: Dict[str, Any]) -> None:
        """Main entry point to handle any alert dict."""
        self.log_alert(alert)
        self._post_alert(alert)

        if alert.get("alert_type") == "ransomware_suspected":
            self.maybe_kill_process(alert.get("pid"))
