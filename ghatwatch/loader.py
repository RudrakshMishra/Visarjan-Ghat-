"""Load the Bhopal ghats CSV into a normalized DataFrame with a `status` column."""
from __future__ import annotations

import logging

import pandas as pd

log = logging.getLogger(__name__)

MEASURED, BDL, ND, NOT_SAMPLED = "MEASURED", "BDL", "ND", "NOT_SAMPLED"
PHASES = ("pre", "during", "after")
_MISSING_FLAGS = {"not sampled", "*", "**"}
_BLANK_PRINTED = {"", "-", "_"}
_TEXT_COLS = ("festival", "site", "water_body", "phase", "parameter", "unit_assumed", "flag",
              "value_as_printed", "parameter_as_printed", "site_as_printed", "site_match_confidence")
OUT_COLS = ["year", "festival", "site", "phase", "parameter", "value", "status", "value_as_printed",
            "source_page", "unit_assumed", "site_match_confidence", "water_body",
            "parameter_as_printed", "site_as_printed", "flag"]


def _status(value: float, flag: str, printed: str) -> str | None:
    """Status for one row; None means unknown non-numeric (caller raises)."""
    f, p = flag.strip().lower(), printed.strip().lower()
    for code in (f, p):
        if code == "bdl":
            return BDL
        if code == "nd":
            return ND
        if code in _MISSING_FLAGS:
            return NOT_SAMPLED
    if pd.notna(value):
        return MEASURED
    if f == "" and p in _BLANK_PRINTED:
        return NOT_SAMPLED
    return None


def normalize(raw: pd.DataFrame) -> pd.DataFrame:
    """Normalize a raw Bhopal-format frame; raises ValueError on unknown codes."""
    df = raw.copy()
    for col in _TEXT_COLS:
        if col not in df:
            df[col] = ""
        df[col] = df[col].fillna("").astype(str).str.strip()
    df["phase"] = df["phase"].str.lower()
    df["festival"] = df["festival"].str.title()
    raw_value = df["value"].astype("string").str.strip() if "value" in df else pd.Series("", index=df.index)
    df["value"] = pd.to_numeric(raw_value, errors="coerce").astype(float)
    bad_value = raw_value.notna() & (raw_value != "") & df["value"].isna()
    df["status"] = [_status(v, f, p) for v, f, p in zip(df["value"], df["flag"], df["value_as_printed"])]
    bad = bad_value | df["status"].isna()
    if bad.any():
        rows = df.loc[bad, ["site", "year", "phase", "parameter", "flag", "value_as_printed"]]
        raise ValueError(f"Unknown non-numeric values in {int(bad.sum())} rows "
                         f"(CSV row index):\n{rows.to_string()}")
    df.loc[df["status"] != MEASURED, "value"] = float("nan")
    bad_phase = ~df["phase"].isin(PHASES)
    if bad_phase.any():
        raise ValueError(f"Unknown phase values: {sorted(df.loc[bad_phase, 'phase'].unique())}")
    df["year"] = pd.to_numeric(df["year"], errors="raise").astype(int)
    df["source_page"] = pd.to_numeric(df.get("source_page"), errors="coerce").astype("Int64")
    return df[OUT_COLS].reset_index(drop=True)


def load_readings(path: str) -> pd.DataFrame:
    """Return normalized readings (year, festival, site, phase, parameter, value, status, ...)."""
    raw = pd.read_csv(path, dtype=str, keep_default_na=False, encoding="utf-8-sig")
    df = normalize(raw)
    log.info("loaded %d rows; status counts %s", len(df), df["status"].value_counts().to_dict())
    return df
