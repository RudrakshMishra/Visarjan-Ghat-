"""Load and validate config.yaml."""
from __future__ import annotations

from pathlib import Path

import yaml

_REQUIRED = ("reference_year", "target_date", "after_phase_date", "weights", "recency",
             "class_limits", "severity_caps", "coverage", "robustness", "report_urls",
             "banned_phrases", "llm")


def load_config(path: str | Path = "config.yaml") -> dict:
    """Read config.yaml and check required keys and weight sanity."""
    with open(path, encoding="utf-8") as fh:
        cfg = yaml.safe_load(fh)
    missing = [k for k in _REQUIRED if k not in cfg]
    if missing:
        raise ValueError(f"config.yaml missing keys: {missing}")
    w = cfg["weights"]
    if set(w) != {"S", "P", "E"} or any(v < 0 for v in w.values()):
        raise ValueError(f"config weights must be non-negative S/P/E, got {w}")
    if abs(sum(w.values()) - 1.0) > 1e-9:
        raise ValueError(f"config weights must sum to 1, got {sum(w.values())}")
    cfg["recency"] = {int(k): float(v) for k, v in cfg["recency"].items()}
    cfg["report_urls"] = {int(k): v for k, v in cfg["report_urls"].items()}
    return cfg
