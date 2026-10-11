"""Assemble facts.json: the single source of truth for every brief."""
from __future__ import annotations

import pandas as pd


def build_facts(df: pd.DataFrame, rules: dict, cfg: dict) -> dict:
    """Return the TRD facts schema."""
    raise NotImplementedError
