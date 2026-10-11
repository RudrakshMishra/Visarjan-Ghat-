"""Severity, persistence, event jump, score, rank and confidence per ghat (TRD 5), vectorised."""
from __future__ import annotations

import math

import numpy as np
import pandas as pd

from ghatwatch.loader import BDL, MEASURED, ND, PHASES

DO, BOD = "Dissolved oxygen", "BOD"
TAG_NO_BASELINE = "No baseline"
TAG_UNKNOWN = "Unknown, test first"
OBSERVED = (MEASURED, BDL, ND)
COLS = ["site", "score", "rank", "S", "P", "E", "coverage", "confidence", "tags", "worst_do"]


def confidence_label(coverage: float, cfg: dict) -> str:
    """High / Medium / Low from coverage thresholds in config."""
    if coverage >= cfg["coverage"]["high"]:
        return "High"
    return "Medium" if coverage >= cfg["coverage"]["medium"] else "Low"


def severities(m: pd.DataFrame, rules: dict) -> pd.Series:
    """Vectorised severity (same formula as rules.severity) for MEASURED scored rows."""
    sev = pd.Series(0.0, index=m.index)
    for param, r in rules.items():
        sel = m["parameter"] == param
        v = m.loc[sel, "value"].to_numpy(dtype=float)
        below = (r.min - v) if r.min is not None else np.zeros_like(v)
        above = (v - r.max) if r.max is not None else np.zeros_like(v)
        sev[sel] = np.minimum(np.maximum(np.maximum(below, above), 0.0) / r.cap, 1.0)
    return sev


def _event_terms(m: pd.DataFrame) -> pd.Series:
    """Per-site mean event term over (festival, year, DO/BOD) with pre and during both MEASURED."""
    sub = m[m["parameter"].isin([DO, BOD]) & m["phase"].isin(["pre", "during"])]
    if sub.empty:
        return pd.Series(dtype=float)
    piv = sub.pivot_table(index=["site", "festival", "year", "parameter"], columns="phase",
                          values="value", aggfunc="mean")
    if not {"pre", "during"} <= set(piv.columns):
        return pd.Series(dtype=float)
    piv = piv.dropna(subset=["pre", "during"])
    if piv.empty:
        return pd.Series(dtype=float)
    pre, dur = piv["pre"].to_numpy(), piv["during"].to_numpy()
    do_t = np.where(pre > 0, (pre - dur) / np.where(pre > 0, pre, 1.0), 0.0)  # DO cannot fall below 0
    bod_t = (dur - pre) / np.maximum(pre, 1.0)
    is_do = piv.index.get_level_values("parameter") == DO
    t = np.clip(np.where(is_do, do_t, bod_t), 0.0, 1.0)
    return pd.Series(t, index=piv.index.get_level_values("site")).groupby(level=0).mean()


def event_jump(m: pd.DataFrame) -> float | None:
    """Event jump E for one ghat's MEASURED rows; None if no pre/during pair."""
    e = _event_terms(m.assign(site="_"))
    return float(e.iloc[0]) if len(e) else None


def score_ghats(df: pd.DataFrame, rules: dict, cfg: dict) -> pd.DataFrame:
"""Severity, persistence, event jump, score, rank and confidence per ghat (TRD 5), vectorised."""
from __future__ import annotations

import math

import numpy as np
import pandas as pd

from ghatwatch.loader import BDL, MEASURED, ND, PHASES

DO, BOD = "Dissolved oxygen", "BOD"
TAG_NO_BASELINE = "No baseline"
TAG_UNKNOWN = "Unknown, test first"
OBSERVED = (MEASURED, BDL, ND)
COLS = ["site", "score", "rank", "S", "P", "E", "coverage", "confidence", "tags", "worst_do"]


def confidence_label(coverage: float, cfg: dict) -> str:
    """High / Medium / Low from coverage thresholds in config."""
    if coverage >= cfg["coverage"]["high"]:
        return "High"
    return "Medium" if coverage >= cfg["coverage"]["medium"] else "Low"


def severities(m: pd.DataFrame, rules: dict) -> pd.Series:
    """Vectorised severity (same formula as rules.severity) for MEASURED scored rows."""
    sev = pd.Series(0.0, index=m.index)
    for param, r in rules.items():
        sel = m["parameter"] == param
        v = m.loc[sel, "value"].to_numpy(dtype=float)
        below = (r.min - v) if r.min is not None else np.zeros_like(v)
        above = (v - r.max) if r.max is not None else np.zeros_like(v)
        sev[sel] = np.minimum(np.maximum(np.maximum(below, above), 0.0) / r.cap, 1.0)
    return sev


def _event_terms(m: pd.DataFrame) -> pd.Series:
    """Per-site mean event term over (festival, year, DO/BOD) with pre and during both MEASURED."""
    sub = m[m["parameter"].isin([DO, BOD]) & m["phase"].isin(["pre", "during"])]
    if sub.empty:
        return pd.Series(dtype=float)
    piv = sub.pivot_table(index=["site", "festival", "year", "parameter"], columns="phase",
                          values="value", aggfunc="mean")
    if not {"pre", "during"} <= set(piv.columns):
        return pd.Series(dtype=float)
    piv = piv.dropna(subset=["pre", "during"])
    if piv.empty:
        return pd.Series(dtype=float)
    pre, dur = piv["pre"].to_numpy(), piv["during"].to_numpy()
    do_t = np.where(pre > 0, (pre - dur) / np.where(pre > 0, pre, 1.0), 0.0)  # DO cannot fall below 0
    bod_t = (dur - pre) / np.maximum(pre, 1.0)
    is_do = piv.index.get_level_values("parameter") == DO
    t = np.clip(np.where(is_do, do_t, bod_t), 0.0, 1.0)
    return pd.Series(t, index=piv.index.get_level_values("site")).groupby(level=0).mean()


def event_jump(m: pd.DataFrame) -> float | None:
    """Event jump E for one ghat's MEASURED rows; None if no pre/during pair."""
    e = _event_terms(m.assign(site="_"))
    return float(e.iloc[0]) if len(e) else None


def score_ghats(df: pd.DataFrame, rules: dict, cfg: dict) -> pd.DataFrame:
    """Return site, score, rank, S, P, E, coverage, confidence, tags, worst_do (rank 1 = worst)."""
    rec, w = cfg["recency"], cfg["weights"]
    m = df[(df["status"] == MEASURED) & df["parameter"].isin(list(rules))]
    missing_years = set(m["year"].astype(int)) - set(rec)
    if missing_years:
        raise ValueError(f"No recency weight in config for years {sorted(missing_years)}")
    wy = m["year"].map(lambda y: rec[int(y)]).astype(float)
    sev = severities(m, rules)
    S = (wy * sev).groupby([m["site"], m["parameter"]]).max().groupby(level=0).mean()
    wsum = wy.groupby(m["site"]).sum()
    P = ((wy * (sev > 0)).groupby(m["site"]).sum() / wsum.where(wsum > 0)).fillna(0.0)
    E = _event_terms(m)
    tables = df[["site", "festival", "year"]].drop_duplicates().groupby("site").size()
    obs = df[df["parameter"].isin(list(rules)) & df["status"].isin(OBSERVED)]
    cells = obs[["site", "festival", "year", "phase", "parameter"]].drop_duplicates().groupby("site").size()
    worst = m[m["parameter"] == DO].groupby("site")["value"].min()
    rows = []
    for site in sorted(df["site"].unique()):
        cov = float(cells.get(site, 0)) / (len(rules) * len(PHASES) * int(tables[site]))
        conf = confidence_label(cov, cfg)
        row = {"site": site, "coverage": cov, "confidence": conf, "worst_do": float(worst.get(site, math.nan))}
        if site not in S.index:
            row.update(score=None, S=None, P=None, E=None, tags=[TAG_UNKNOWN])
            rows.append(row)
            continue
        s_, p_ = float(S[site]), float(P[site])
        e_ = float(E[site]) if site in E.index else None
        tags = []
        if e_ is None:
            tot = w["S"] + w["P"]
            score = 100 * (w["S"] * s_ + w["P"] * p_) / tot if tot else 0.0
            tags.append(TAG_NO_BASELINE)
        else:
            score = 100 * (w["S"] * s_ + w["P"] * p_ + w["E"] * e_)
        if conf == "Low":
            tags.append(TAG_UNKNOWN)
        row.update(score=float(score), S=s_, P=p_, E=e_, tags=tags)
        rows.append(row)
    out = pd.DataFrame(rows, columns=[c for c in COLS if c != "rank"])
    key = out.assign(_s=out["score"].apply(lambda s: math.inf if pd.isna(s) else -s),
                     _d=out["worst_do"].fillna(math.inf))
    out = out.loc[key.sort_values(["_s", "_d", "site"]).index].reset_index(drop=True)
    out["rank"] = range(1, len(out) + 1)
    return out[COLS]
