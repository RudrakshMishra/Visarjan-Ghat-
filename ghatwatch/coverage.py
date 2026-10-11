"""Coverage matrix (incl. TABLE_ABSENT slots) and testing checklist."""
from __future__ import annotations

import pandas as pd


def coverage_matrix(df: pd.DataFrame) -> pd.DataFrame:
    """site x (festival, year) x phase -> status or TABLE_ABSENT."""
    raise NotImplementedError


def testing_checklist(df: pd.DataFrame, rules: dict) -> pd.DataFrame:
    """site, phase, parameter, reason: what to collect for Durga 2026."""
    raise NotImplementedError
