from __future__ import annotations

import math
from pathlib import Path
from typing import Optional


def compute_shannon_entropy(path: str, max_bytes: int = 65536) -> Optional[float]:
    """Compute Shannon entropy (in bits per byte) for the beginning of a file.

    For performance, only the first ``max_bytes`` are read. If the file is empty
    or cannot be read, ``None`` is returned.
    """
    file_path = Path(path)

    try:
        if not file_path.is_file():
            return None
        size = file_path.stat().st_size
        if size == 0:
            return 0.0

        to_read = min(size, max_bytes)
        with file_path.open("rb") as f:
            data = f.read(to_read)
    except OSError:
        return None

    if not data:
        return 0.0

    # Count byte frequencies
    counts = [0] * 256
    for b in data:
        counts[b] += 1

    entropy = 0.0
    length = float(len(data))
    for c in counts:
        if c == 0:
            continue
        p = c / length
        entropy -= p * math.log2(p)

    return entropy
