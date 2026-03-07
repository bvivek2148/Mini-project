from __future__ import annotations

import json
import logging
from typing import Any, Dict, Optional

import psutil
import requests

from .containment import ContainmentHandler


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
        self.containment = ContainmentHandler(logger=self.log)

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

    def extract_network_info(self, pid: Optional[int]) -> list[str]:
        """Attempt to extract external IP addresses connected to the given PID."""
        if not pid or pid <= 0:
            return []
        remote_ips = set()
        try:
            proc = psutil.Process(pid)
            # Must run as admin to get connections for other processes on Windows
            conns = proc.connections(kind='inet')
            for c in conns:
                # Filter out loopback and local network (basic heuristic)
                if c.status == 'ESTABLISHED' and c.raddr:
                    ip = c.raddr.ip
                    if not ip.startswith('127.') and not ip.startswith('192.168.') and not ip.startswith('10.'):
                        remote_ips.add(ip)
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass
        except Exception as exc:  # noqa: BLE001
            self.log.debug("Error extracting network info for %s: %s", pid, exc)
        return list(remote_ips)

    def maybe_kill_process(self, pid: Optional[int]) -> bool:
        """Kills the process and returns True if successful."""
        if not self.kill_on_detection or pid is None or pid <= 0:
            return False
        try:
            proc = psutil.Process(pid)
            self.log.warning("Terminating suspected ransomware process pid=%s name=%s", pid, proc.name())
            proc.terminate()
            return True
        except (psutil.NoSuchProcess, psutil.AccessDenied) as exc:
            self.log.warning("Failed to terminate process %s: %s", pid, exc)
        except Exception as exc:  # noqa: BLE001
            self.log.warning("Unexpected error terminating process %s: %s", pid, exc)
        return False

    def handle_alert(self, alert: Dict[str, Any]) -> None:
        """Main entry point to handle any alert dict."""
        
        # 1. If this is a ransomware alert, perform active response first
        if alert.get("alert_type") == "ransomware_suspected":
            pid = alert.get("pid")
            target_path = alert.get("path")
            
            # Extract network C&C IPs before killing the process
            remote_ips = self.extract_network_info(pid)
            if remote_ips:
                alert["remote_ips"] = remote_ips
                self.log.warning("Extracted active external network connections from PID %s: %s", pid, remote_ips)
            
            # Kill the process
            killed = self.maybe_kill_process(pid)
            alert["process_killed"] = killed

            # Contain the threat by locking the folder
            if target_path:
                locked = self.containment.lock_folder(target_path)
                alert["folder_locked"] = locked

        # 2. Log and send the enriched alert payload
        self.log_alert(alert)
        self._post_alert(alert)
