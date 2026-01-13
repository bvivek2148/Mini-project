from __future__ import annotations

import logging
from pathlib import Path
from typing import Iterable

from watchdog.events import FileSystemEvent, FileSystemEventHandler
from watchdog.observers import Observer

from .detector import Detector
from .honeytokens import HoneytokenManager


class FileChangeHandler(FileSystemEventHandler):
    def __init__(self, detector: Detector, honeytokens: HoneytokenManager, logger: logging.Logger) -> None:
        super().__init__()
        self.detector = detector
        self.honeytokens = honeytokens
        self.log = logger

    def on_created(self, event: FileSystemEvent) -> None:  # type: ignore[override]
        self._handle(event)

    def on_modified(self, event: FileSystemEvent) -> None:  # type: ignore[override]
        self._handle(event)

    def _handle(self, event: FileSystemEvent) -> None:
        if event.is_directory:
            return
        path = event.src_path
        try:
            if self.honeytokens.is_honeytoken(path):
                self.log.debug("Honeytoken event: %s", path)
                self.detector.handle_honeytoken_access(path)
            else:
                self.detector.handle_file_event(path)
        except Exception as exc:  # noqa: BLE001
            self.log.warning("Error handling FS event for %s: %s", path, exc)


class Watcher:
    """Thin wrapper around watchdog Observer for multiple paths."""

    def __init__(
        self,
        paths: Iterable[str],
        handler: FileChangeHandler,
        logger: logging.Logger,
    ) -> None:
        self.paths = [str(p) for p in paths]
        self.handler = handler
        self.log = logger
        self._observer = Observer()

    def start(self) -> None:
        if not self.paths:
            self.log.warning("No monitored paths configured; watcher will not start.")
            return

        for p in self.paths:
            path_obj = Path(p)
            path_obj.mkdir(parents=True, exist_ok=True)
            self._observer.schedule(self.handler, str(path_obj), recursive=True)
            self.log.info("Watching path: %s", path_obj)

        self._observer.start()

    def stop(self) -> None:
        self._observer.stop()
        self._observer.join()
