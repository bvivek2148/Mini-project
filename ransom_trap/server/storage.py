from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List


class AlertStorage:
    """In-memory alert storage with simple JSONL file persistence."""

    def __init__(self, file_path: Path) -> None:
        self.file_path = file_path
        self.alerts: List[Dict[str, Any]] = []
        self.file_path.parent.mkdir(parents=True, exist_ok=True)
        if self.file_path.exists():
            self._load_existing()

    def _load_existing(self) -> None:
        try:
            for line in self.file_path.read_text(encoding="utf-8").splitlines():
                line = line.strip()
                if not line:
                    continue
                try:
                    self.alerts.append(json.loads(line))
                except json.JSONDecodeError:
                    continue
        except OSError:
            # If we can't read existing alerts, we still operate in-memory.
            pass

    def add_alert(self, alert: Dict[str, Any]) -> None:
        self.alerts.append(alert)
        try:
            with self.file_path.open("a", encoding="utf-8") as f:
                f.write(json.dumps(alert, ensure_ascii=False) + "\n")
        except OSError:
            # Ignore persistence failures; alerts remain in memory.
            pass

    def get_alerts(self) -> List[Dict[str, Any]]:
        return list(self.alerts)
