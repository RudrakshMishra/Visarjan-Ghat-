"""Severity, persistence, event jump, score, rank and confidence per ghat (TRD 5)."""
from __future__ import annotations

import math

import pandas as pd

from ghatwatch.loader import BDL, MEASURED, ND, PHASES
from ghatwatch.rules import severity

DO, BOD = "Dissolved oxygen", "BOD"
TAG_NO_BASELINE = "No baseline"
TAG_UNKNOWN = "Unknown, test first"
OBSERVED = (MEASURED, BDL, ND)


def _clamp(x: float) -> float:
    return min(max(x, 0.0), 1.0)


def confidence_label(coverage: float, cfg: dict) -> str:
    """High / Medium / Low from coverage thresholds in config."""
    if coverage >= cfg["coverage"]["high"]:
        return "High"
    return "Medium" if coverage >= cfg["coverage"]["medium"] else "Low"


def coverage_of(g: pd.DataFrame, rules: dict) -> float:
    """Observed scored cells / expected cells (3 params x 3 phases x tables present)."""
    tables = g[["festival", "year"]].drop_duplicates()
    expected = len(rules) * len(PHASES) * len(tables)
    obs = g[g["parameter"].isin(list(rules)) & g["status"].isin(OBSERVED)]
    cells = obs[["festival", "year", "phase", "parameter"]].drop_duplicates()
    return len(cells) / expected if expected else 0.0


def event_jump(m: pd.DataFrame) -> float | None:
    """Mean DO drop / BOD rise over (festival, year, parameter) with pre and during MEASURED."""
    terms = []
    for (_, _, param), grp in m[m["parameter"].isin([DO, BOD])].groupby(["festival", "year", "parameter"]):
        by = grp.groupby("phase")["value"].mean()
        if "pre" not in by or "during" not in by:
            continue
        pre, dur = by["pre"], by["during"]
        if param == DO:
            terms.append(_clamp((pre - dur) / pre) if pre > 0 else 0.0)
        else:
            terms.append(_clamp((dur - pre) / max(pre, 1.0)))
    return sum(terms) / len(terms) if terms else None


def _score_site(g: pd.DataFrame, rules: dict, cfg: dict) -> dict:
    rec = cfg["recency"]
    m = g[(g["status"] == MEASURED) & g["parameter"].isin(list(rules))].copy()
    cov = coverage_of(g, rules)
    conf = confidence_label(cov, cfg)
    tags: list[str] = []
    do_vals = m.loc[m["parameter"] == DO, "value"]
    row = {"site": g["site"].iloc[0], "coverage": cov, "confidence": conf,
           "worst_do": float(do_vals.min()) if len(do_vals) else math.nan}
    if m.empty:
        row.update(score=None, S=None, P=None, E=None, tags=[TAG_UNKNOWN])
        return row
    missing_years = set(m["year"].astype(int)) - set(rec)
    if missing_years:
        raise ValueError(f"No recency weight in config for years {sorted(missing_years)}")
    m["w"] = m["year"].map(lambda y: rec[int(y)])
    m["sev"] = [severity(p, v, rules) for p, v in zip(m["parameter"], m["value"])]
    S = float((m["w"] * m["sev"]).groupby(m["parameter"]).max().mean())
    P = float((m["w"] * (m["sev"] > 0)).sum() / m["w"].sum()) if m["w"].sum() > 0 else 0.0
    E = event_jump(m)
    w = cfg["weights"]
    if E is None:
        tot = w["S"] + w["P"]
        score = 100 * (w["S"] * S + w["P"] * P) / tot if tot else 0.0
        tags.append(TAG_NO_BASELINE)
    else:
        score = 100 * (w["S"] * S + w["P"] * P + w["E"] * E)
    if conf == "Low":
        tags.append(TAG_UNKNOWN)
    row.update(score=float(score), S=S, P=P, E=E, tags=tags)
    return row


def score_ghats(df: pd.DataFrame, rules: dict, cfg: dict) -> pd.DataFrame:
    """Return site, score, rank, S, P, E, coverage, confidence, tags, worst_do (rank 1 = worst)."""
    rows = [_score_site(g, rules, cfg) for _, g in df.groupby("site", sort=True)]
    out = pd.DataFrame(rows, columns=["site", "score", "S", "P", "E", "coverage", "confidence",
                                      "tags", "worst_do"])
    key = out.assign(_s=out["score"].apply(lambda s: math.inf if pd.isna(s) else -s),
                     _d=out["worst_do"].fillna(math.inf))
    out = out.loc[key.sort_values(["_s", "_d", "site"]).index].reset_index(drop=True)
    out["rank"] = range(1, len(out) + 1)
    return out[["site", "score", "rank", "S", "P", "E", "coverage", "confidence", "tags", "worst_do"]]
