"""Validate a 2026 intake CSV; append in memory only."""
from __future__ import annotations


def validate_intake(csv_or_df, ctx_df):
    """Return (clean_df, errors)."""
    raise NotImplementedError


def apply_intake(df, clean_df):
    """Append validated rows in memory."""
    raise NotImplementedError
