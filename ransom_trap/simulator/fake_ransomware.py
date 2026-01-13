from __future__ import annotations

import argparse
import os
from pathlib import Path
from typing import Iterable


def iter_files(root: Path) -> Iterable[Path]:
    for dirpath, _dirnames, filenames in os.walk(root):
        for name in filenames:
            yield Path(dirpath) / name


def xor_bytes(data: bytes, key: int = 0xAA) -> bytes:
    return bytes(b ^ key for b in data)


def scramble_file(path: Path) -> None:
    try:
        data = path.read_bytes()
    except OSError:
        return
    if not data:
        return
    scrambled = xor_bytes(data)
    try:
        path.write_bytes(scrambled)
    except OSError:
        return


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Fake ransomware simulator for Ransom-Trap")
    parser.add_argument("target", type=str, help="Directory to scramble (TEST DATA ONLY)")
    args = parser.parse_args(argv)

    root = Path(args.target).resolve()
    if not root.is_dir():
        print(f"Target is not a directory: {root}")
        return 1

    print(f"[!] Fake ransomware starting on: {root}")

    for path in iter_files(root):
        scramble_file(path)

    print("[+] Fake ransomware finished.")
    return 0


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())
