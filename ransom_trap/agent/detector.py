from __future__ import annotations

import logging
import time
from typing import Any, Dict, Optional

from .entropy import compute_shannon_entropy
from .process_tracker import ProcessTracker
from .response import ResponseHandler


class Detector:
    """Applies entropy-based heuristics to detect ransomware-like behavior."""

    def __init__(
        self,
        config: Dict[str, Any],
        hostname: str,
        tracker: ProcessTracker,
        responder: ResponseHandler,
        logger: Optional[logging.Logger] = None,
    ) -> None:
        detection_cfg = config.get("detection", {}) or {}
        self.entropy_threshold: float = float(detection_cfg.get("entropy_threshold", 7.0))
        self.time_window_seconds: int = int(detection_cfg.get("time_window_seconds", 10))
        self.min_suspicious_files: int = int(detection_cfg.get("min_suspicious_files", 5))

        ignored = detection_cfg.get("ignored_processes") or []
        self.ignored_processes = {str(name).lower() for name in ignored}

        self.hostname = hostname
        self.tracker = tracker
        self.responder = responder
        self.log = logger or logging.getLogger("ransom_trap.agent.detector")

    def _is_ignored(self, process_name: Optional[str]) -> bool:
        if not process_name:
            return False
        return process_name.lower() in self.ignored_processes

    def handle_file_event(self, path: str) -> None:
        """Process a regular file create/modify event."""
        entropy = compute_shannon_entropy(path)
        if entropy is None:
            return

        pid, proc_name = self.tracker.resolve_process_for_path(path)
        if self._is_ignored(proc_name):
            return

        self.tracker.register_event(pid, path, entropy)

        suspicious = self.tracker.evaluate_suspicion(
            pid,
            entropy_threshold=self.entropy_threshold,
            time_window_seconds=self.time_window_seconds,
            min_suspicious_files=self.min_suspicious_files,
        )
        if not suspicious:
            return

        alert = {
            "alert_type": "ransomware_suspected",
            "host": self.hostname,
            "pid": pid,
            "process_name": proc_name,
            "timestamp": time.time(),
            "details": {
                "entropy_threshold": self.entropy_threshold,
                "time_window_seconds": self.time_window_seconds,
                "min_suspicious_files": self.min_suspicious_files,
            },
        }
        self.responder.handle_alert(alert)

    def handle_honeytoken_access(self, path: str) -> None:
        """Generate a high-priority alert for honeytoken access."""
        pid, proc_name = self.tracker.resolve_process_for_path(path)
        if self._is_ignored(proc_name):
            return

        alert = {
            "alert_type": "honeytoken_access",
            "host": self.hostname,
            "pid": pid,
            "process_name": proc_name,
            "timestamp": time.time(),
            "path": path,
        }
        self.responder.handle_alert(alert)
