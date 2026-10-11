"""Chronic / event-linked / persisting / transient / no-baseline diagnosis."""
from __future__ import annotations

import pandas as pd


def diagnose(df: pd.DataFrame, rules: dict) -> pd.DataFrame:
    """Return site, festival, year, parameter, tag, pre, during, after."""
    raise NotImplementedError


def metals_watch(df: pd.DataFrame) -> pd.DataFrame:
    """Informational metal flags (never 'exceeds')."""
    raise NotImplementedError


def suspicious_constants(df: pd.DataFrame) -> pd.DataFrame:
    """Metal values repeated in 5+ ghat-phase cells within a festival-year."""
    raise NotImplementedError
