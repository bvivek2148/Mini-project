from __future__ import annotations

import os
from pathlib import Path
from typing import Dict, Iterable, List, Set


class HoneytokenManager:
    """Creates and tracks honeytoken files used as canaries for data theft."""

    def __init__(self, config: Dict, logger) -> None:  # type: ignore[override]
        self.log = logger
        cfg = config.get("honeytokens", {}) or {}
        self.file_names: List[str] = list(cfg.get("file_names") or [])
        self.auto_regenerate: bool = bool(cfg.get("auto_regenerate", True))

        agent_cfg = config.get("agent", {}) or {}
        self.target_dirs: List[str] = list(agent_cfg.get("honeytoken_paths") or [])

        self._honey_paths: Set[str] = set()
        self._ensure_honeytokens()

    @property
    def honey_paths(self) -> Set[str]:
        return self._honey_paths

    def _normalize(self, path: str) -> str:
        # Normalize paths for comparison (case-insensitive on Windows)
        p = os.path.abspath(path)
        if os.name == "nt":
            return p.lower()
        return p

    def _ensure_honeytokens(self) -> None:
        if not self.target_dirs or not self.file_names:
            self.log.warning("Honeytokens are not fully configured; skipping generation.")
            return

        for directory in self.target_dirs:
            dir_path = Path(directory)
            dir_path.mkdir(parents=True, exist_ok=True)
            for name in self.file_names:
                fp = dir_path / name
                if not fp.exists() or self.auto_regenerate:
                    self._write_fake_content(fp)
                self._honey_paths.add(self._normalize(str(fp)))

        self.log.info("Honeytokens active at %d paths", len(self._honey_paths))

    def _write_fake_content(self, path: Path) -> None:
        """Write plausible but fake sensitive content to the honeytoken file."""
        template = (
            "*** CONFIDENTIAL ***\n\n"
            "This file contains highly sensitive information such as passwords, "
            "bank logins, or budget details.\n"
            "Do NOT distribute.\n"
        )
        try:
            path.write_text(template, encoding="utf-8")
        except OSError as exc:
            self.log.warning("Failed to create honeytoken %s: %s", path, exc)

    def is_honeytoken(self, path: str) -> bool:
        return self._normalize(path) in self._honey_paths

    def iter_paths(self) -> Iterable[str]:
        return list(self._honey_paths)
