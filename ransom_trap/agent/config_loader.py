import os
from pathlib import Path
from typing import Any, Dict

import yaml


def load_config(config_path: str) -> Dict[str, Any]:
    """Load YAML configuration file.

    Args:
        config_path: Path to YAML config.

    Returns:
        Parsed configuration dictionary.
    """
    path = Path(config_path)
    if not path.is_file():
        raise FileNotFoundError(f"Config file not found: {path}")

    with path.open("r", encoding="utf-8") as f:
        data = yaml.safe_load(f) or {}

    return data


def get_hostname(config: Dict[str, Any]) -> str:
    host_cfg = (config.get("host") or {}) if isinstance(config, dict) else {}
    hostname = host_cfg.get("hostname") if isinstance(host_cfg, dict) else None
    if not hostname:
        hostname = os.environ.get("COMPUTERNAME") or os.uname().nodename
    return str(hostname)
