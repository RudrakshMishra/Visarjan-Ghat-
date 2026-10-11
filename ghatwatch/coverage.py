"""Coverage matrix (incl. TABLE_ABSENT slots) and testing checklist."""
from __future__ import annotations

import pandas as pd

from ghatwatch.loader import BDL, MEASURED, ND, NOT_SAMPLED, PHASES

TABLE_ABSENT = "TABLE_ABSENT"
SCORED = ("Dissolved oxygen", "BOD", "pH")
_PRIORITY = {MEASURED: 0, BDL: 1, ND: 2, NOT_SAMPLED: 3}


def coverage_matrix(df: pd.DataFrame, params=SCORED, festivals=None, years=None) -> pd.DataFrame:
    """Long grid: site, festival, year, phase, parameter, status (or TABLE_ABSENT)."""
    sites = sorted(df["site"].unique())
    festivals = festivals or sorted(df["festival"].unique())
    years = years or sorted(int(y) for y in df["year"].unique())
    present = set(map(tuple, df[["site", "festival", "year"]].drop_duplicates().values.tolist()))
    best = (df[df["parameter"].isin(params)]
            .assign(_p=lambda d: d["status"].map(_PRIORITY))
            .sort_values("_p")
            .drop_duplicates(["site", "festival", "year", "phase", "parameter"])
            .set_index(["site", "festival", "year", "phase", "parameter"])["status"].to_dict())
    rows = []
    for s in sites:
        for f in festivals:
            for y in years:
                absent = (s, f, y) not in present
                for ph in PHASES:
                    for p in params:
                        st = TABLE_ABSENT if absent else best.get((s, f, y, ph, p), NOT_SAMPLED)
                        rows.append((s, f, y, ph, p, st))
    return pd.DataFrame(rows, columns=["site", "festival", "year", "phase", "parameter", "status"])


def testing_checklist(df: pd.DataFrame, rules: dict, cfg: dict | None = None) -> pd.DataFrame:
    """site, phase, parameter, reason, suggested_date: what to collect for Durga 2026."""
    cov = coverage_matrix(df, params=tuple(rules))
    dates = {"pre": f"before {cfg['target_date']}" if cfg else "before visarjan",
             "during": cfg["target_date"] if cfg else "visarjan day",
             "after": cfg["after_phase_date"] if cfg else "one week after"}
    rows = []
    for (site, ph, p), g in cov.groupby(["site", "phase", "parameter"], sort=True):
        miss = g[g["status"] == NOT_SAMPLED]
        absent = g[g["status"] == TABLE_ABSENT][["festival", "year"]].drop_duplicates()
        if miss.empty and absent.empty:
            continue
        parts = [f"not sampled in {f} {y}" for f, y in miss[["festival", "year"]].values]
        parts += [f"no {f} {y} table" for f, y in absent.values]
        rows.append({"site": site, "phase": ph, "parameter": p, "reason": "; ".join(parts),
                     "suggested_date": dates[ph]})
    return pd.DataFrame(rows, columns=["site", "phase", "parameter", "reason", "suggested_date"])
