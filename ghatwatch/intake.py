"""Validate a 2026 intake CSV; append in memory only (nothing is written to disk)."""
from __future__ import annotations

import pandas as pd

from ghatwatch.loader import PHASES, normalize

REQUIRED = ("year", "festival", "site", "phase", "parameter", "value")
CODES = {"bdl", "nd", "not sampled", "*", "**"}


def validate_intake(csv_or_df, ctx_df: pd.DataFrame) -> tuple[pd.DataFrame, list[str]]:
    """Return (clean normalized rows, row-numbered error messages). Rows with errors are dropped."""
    raw = (csv_or_df.astype(str) if isinstance(csv_or_df, pd.DataFrame)
           else pd.read_csv(csv_or_df, dtype=str, keep_default_na=False, encoding="utf-8-sig"))
    raw = raw.fillna("")
    missing = [c for c in REQUIRED if c not in raw]
    if missing:
        return raw.iloc[0:0], [f"Missing columns: {missing}"]
    sites, params = set(ctx_df["site"].unique()), set(ctx_df["parameter"].unique())
    errors, keep = [], []
    for i, r in raw.iterrows():
        n = i + 2  # CSV line number (header is line 1)
        errs = []
        if r["site"].strip() not in sites:
            errs.append(f"unknown site {r['site']!r}")
        if r["phase"].strip().lower() not in PHASES:
            errs.append(f"unknown phase {r['phase']!r} (use pre, during, after)")
        if r["parameter"].strip() not in params:
            errs.append(f"unknown parameter {r['parameter']!r}")
        if not r["year"].strip().isdigit():
            errs.append(f"year must be a number, got {r['year']!r}")
        v, flag = r["value"].strip(), str(r.get("flag", "")).strip()
        if v.lower() in CODES:
            raw.at[i, "flag"], raw.at[i, "value"] = v, ""
        elif v == "" and flag.lower() in CODES:
            pass
        else:
            try:
                float(v)
            except ValueError:
                errs.append(f"value {v!r} is not a number or one of BDL, ND, not sampled, *, **")
        if not str(r.get("source_page", "")).strip() and not str(r.get("source_note", "")).strip():
            errs.append("source_page or source_note is required")
        if errs:
            errors.append(f"Row {n}: " + "; ".join(errs))
        else:
            keep.append(i)
    good = raw.loc[keep].copy()
    if "value_as_printed" not in good:
        good["value_as_printed"] = good["value"].where(good["value"] != "", good.get("flag", ""))
    if "source_page" not in good:
        good["source_page"] = ""
    return (normalize(good) if len(good) else good), errors


def apply_intake(df: pd.DataFrame, clean_df: pd.DataFrame) -> pd.DataFrame:
    """Append validated rows in memory (returns a new frame)."""
    return pd.concat([df, clean_df[df.columns.intersection(clean_df.columns)]], ignore_index=True)
