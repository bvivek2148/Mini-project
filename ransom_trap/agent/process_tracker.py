from __future__ import annotations

import time
from collections import defaultdict
from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple

import psutil


@dataclass
class FileEvent:
    timestamp: float
    path: str
    entropy: float


class ProcessTracker:
    """Tracks per-process file modification events and resolves PIDs for paths."""

    def __init__(self) -> None:
        # pid -> list[FileEvent]
        self._events: Dict[int, List[FileEvent]] = defaultdict(list)
        # pid -> last alert timestamp
        self._last_alert_ts: Dict[int, float] = {}

    def resolve_process_for_path(self, path: str) -> Tuple[Optional[int], Optional[str]]:
        """Best-effort mapping from file path to (pid, process_name).

        This is a heuristic and may not always find the exact process, but
        it's good enough for a proof-of-concept.
        """
        normalized = path.lower()
        for proc in psutil.process_iter(["pid", "name"]):
            try:
                for of in proc.open_files():
                    if of.path.lower() == normalized:
                        return proc.pid, proc.info.get("name") or proc.name()
            except (psutil.AccessDenied, psutil.NoSuchProcess, psutil.ZombieProcess):
                continue
            except Exception:
                continue
        return None, None

    def register_event(self, pid: Optional[int], path: str, entropy: float) -> None:
        ts = time.time()
        if pid is None:
            # Use a synthetic PID bucket for unknown processes
            pid = -1
        self._events[pid].append(FileEvent(timestamp=ts, path=path, entropy=entropy))

    def evaluate_suspicion(
        self,
        pid: Optional[int],
        entropy_threshold: float,
        time_window_seconds: int,
        min_suspicious_files: int,
    ) -> bool:
        """Return True if the process crosses the suspicious threshold.

        Applies a sliding time window and counts files whose entropy is
        above the configured threshold.
        """
        if pid is None:
            pid = -1

        now = time.time()
        events = self._events.get(pid, [])
        # prune old events
        cutoff = now - time_window_seconds
        events = [e for e in events if e.timestamp >= cutoff]
        self._events[pid] = events

        high_entropy_count = sum(1 for e in events if e.entropy >= entropy_threshold)
        if high_entropy_count < min_suspicious_files:
            return False

        last_alert = self._last_alert_ts.get(pid)
        # Avoid spamming alerts for the same process: only alert again if
        # at least one full window has passed since the last alert.
        if last_alert is not None and (now - last_alert) < time_window_seconds:
            return False

        self._last_alert_ts[pid] = now
        return True

    def recent_events_for_pid(self, pid: int, limit: int = 10) -> List[FileEvent]:
        events = self._events.get(pid, [])
        return events[-limit:]
