"""Severity, persistence, event jump, score, rank and confidence per ghat."""
from __future__ import annotations

import pandas as pd


def score_ghats(df: pd.DataFrame, rules: dict, cfg: dict) -> pd.DataFrame:
    """Return site, score, rank, S, P, E, coverage, confidence, tags, worst_do."""
    raise NotImplementedError
