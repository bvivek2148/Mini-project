from __future__ import annotations

import argparse
import logging
import sys
import time
from pathlib import Path

from .config_loader import get_hostname, load_config
from .detector import Detector
from .filesystem_watcher import FileChangeHandler, Watcher
from .honeytokens import HoneytokenManager
from .process_tracker import ProcessTracker
from .response import ResponseHandler


def setup_logging(log_file: Path | None) -> logging.Logger:
    logger = logging.getLogger("ransom_trap.agent")
    logger.setLevel(logging.INFO)

    fmt = logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s")

    console = logging.StreamHandler(sys.stdout)
    console.setFormatter(fmt)
    logger.addHandler(console)

    if log_file is not None:
        log_file.parent.mkdir(parents=True, exist_ok=True)
        fh = logging.FileHandler(log_file, encoding="utf-8")
        fh.setFormatter(fmt)
        logger.addHandler(fh)

    return logger


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Ransom-Trap endpoint agent")
    parser.add_argument(
        "--config",
        type=str,
        default="config/config.yaml",
        help="Path to YAML configuration file",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)

    cfg = load_config(args.config)
    agent_cfg = cfg.get("agent", {}) or {}

    log_path_str = agent_cfg.get("log_file")
    log_file = Path(log_path_str) if log_path_str else None

    logger = setup_logging(log_file)
    logger.info("Starting Ransom-Trap agent with config %s", args.config)

    hostname = get_hostname(cfg)

    # Setup core components
    tracker = ProcessTracker()
    responder = ResponseHandler(
        alert_server_url=str(agent_cfg.get("alert_server_url", "http://127.0.0.1:8000")),
        kill_on_detection=bool(cfg.get("detection", {}).get("kill_on_detection", False)),
        logger=logger,
    )
    honey_mgr = HoneytokenManager(cfg, logger)
    detector = Detector(cfg, hostname, tracker, responder, logger)

    # Fire a one-time test honeytoken alert on startup to verify end-to-end
    # connectivity between the agent and the alert server. This helps when
    # debugging situations where the UI shows "No alerts yet" even though
    # the agent is running.
    for hp in list(honey_mgr.iter_paths())[:1]:
        logger.info("Sending startup test honeytoken alert for %s", hp)
        detector.handle_honeytoken_access(hp)
        break

    monitored_paths = agent_cfg.get("monitored_paths") or []

    handler = FileChangeHandler(detector, honey_mgr, logger)
    watcher = Watcher(monitored_paths, handler, logger)

    try:
        watcher.start()
        logger.info("Ransom-Trap agent is now monitoring %d path(s)", len(monitored_paths))
        
        last_poll = time.time()
        poll_interval = 10
        alert_server_url = str(agent_cfg.get("alert_server_url", "http://127.0.0.1:8000"))

        while True:
            time.sleep(1)
            if time.time() - last_poll >= poll_interval:
                last_poll = time.time()
                try:
                    import requests
                    resp = requests.get(f"{alert_server_url}/config", timeout=5)
                    if resp.status_code == 200:
                        new_cfg = resp.json()
                        new_paths = new_cfg.get("monitored_paths", [])
                        if new_paths != monitored_paths:
                            logger.info("Config changed: updating monitored paths to %s", new_paths)
                            try:
                                watcher.stop()
                            except Exception:
                                pass
                            monitored_paths = new_paths
                            watcher = Watcher(monitored_paths, handler, logger)
                            watcher.start()
                        
                        # Apply kill_on_detection dynamically
                        responder_kill = new_cfg.get("kill_on_detection", responder.kill_on_detection)
                        responder.kill_on_detection = responder_kill
                except Exception as e:
                    logger.debug("Failed to poll server config: %s", e)
    except KeyboardInterrupt:
        logger.info("Stopping Ransom-Trap agent (KeyboardInterrupt)")
    finally:
        watcher.stop()

    return 0


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())
