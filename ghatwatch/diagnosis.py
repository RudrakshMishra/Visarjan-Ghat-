"""Chronic / event-linked / persisting / transient / no-baseline diagnosis (TRD 5)."""
from __future__ import annotations

from collections import defaultdict

import pandas as pd

from ghatwatch.loader import BDL, MEASURED, ND
from ghatwatch.rules import severity

CHRONIC, EVENT, PERSIST, TRANSIENT = "CHRONIC", "EVENT-LINKED", "PERSISTING", "TRANSIENT"
NO_BASELINE, OK, INSUFFICIENT = "NO BASELINE", "OK", "INSUFFICIENT DATA"
METALS = ("Chromium", "Lead", "Zinc", "Copper")
_KEY = ["site", "festival", "year", "parameter", "phase"]


def _cells(df: pd.DataFrame) -> dict:
    """(site, festival, year, parameter, phase) -> list of (status, value, source_page)."""
    out = defaultdict(list)
    for r in zip(*(df[c] for c in _KEY), df["status"], df["value"], df["source_page"]):
        out[(r[0], r[1], int(r[2]), r[3], r[4])].append((r[5], r[6], r[7]))
    return out


def _phase_state(rows: list, param: str, rules: dict) -> tuple[str, object]:
    """('pass'|'fail'|'missing', display value) for one phase cell; worst reading wins."""
    vals = [v for s, v, _ in rows if s == MEASURED]
    if vals:
        v = max(vals, key=lambda x: severity(param, x, rules))
        return ("fail" if severity(param, v, rules) > 0 else "pass"), float(v)
    low = [s for s, _, _ in rows if s in (BDL, ND)]
    if low:  # very low: passes a max-only limit, fails a min limit (e.g. DO)
        return ("pass" if rules[param].min is None else "fail"), low[0]
    return "missing", rows[0][0] if rows else "NOT_SAMPLED"


def classify(pre: str, during: str, after: str) -> str:
    """Tag from pass/fail/missing states; combined tags are '+'-joined."""
    if pre == "fail":
        return CHRONIC
    if pre == "pass" and during == "fail":
        if after == "fail":
            return f"{EVENT}+{PERSIST}"
        if after == "pass":
            return f"{EVENT}+{TRANSIENT}"
        return EVENT
    if pre == "pass" and during == "pass":
        return {"fail": PERSIST, "pass": OK}.get(after, INSUFFICIENT)
    if pre == "missing" and during == "fail":
        return NO_BASELINE
    return INSUFFICIENT


def diagnose(df: pd.DataFrame, rules: dict) -> pd.DataFrame:
    """Return site, festival, year, parameter, tag, pre, during, after (one row per table x param)."""
    cells = _cells(df[df["parameter"].isin(list(rules))])
    out = []
    for site, fest, year in sorted(set(zip(df["site"], df["festival"], df["year"].astype(int)))):
        for param in rules:
            states = {ph: _phase_state(cells.get((site, fest, year, param, ph), []), param, rules)
                      for ph in ("pre", "during", "after")}
            tag = classify(*(states[ph][0] for ph in ("pre", "during", "after")))
            out.append({"site": site, "festival": fest, "year": year, "parameter": param,
                        "tag": tag, **{ph: states[ph][1] for ph in states}})
    return pd.DataFrame(out, columns=["site", "festival", "year", "parameter", "tag",
                                      "pre", "during", "after"])


def metals_watch(df: pd.DataFrame, factor: float = 3.0) -> pd.DataFrame:
    """Informational: during >= factor x pre, or BDL/ND pre with a measured during value."""
    cells = _cells(df[df["parameter"].isin(METALS)])
    out = []
    for site, fest, year, param in sorted({k[:4] for k in cells}):
        pre, dur = cells.get((site, fest, year, param, "pre"), []), cells.get((site, fest, year, param, "during"), [])
        dm = [(v, pg) for s, v, pg in dur if s == MEASURED]
        if not dm or not pre:
            continue
        d, page = max(dm, key=lambda x: x[0])
        pm = [v for s, v, _ in pre if s == MEASURED]
        if pm and max(pm) > 0 and d >= factor * max(pm):
            flag, p = f"during is {factor:g} times pre or more", float(max(pm))
        elif not pm and any(s in (BDL, ND) for s, _, _ in pre):
            flag, p = "above detection during event window", next(s for s, _, _ in pre if s in (BDL, ND))
        else:
            continue
        out.append({"site": site, "festival": fest, "year": year, "parameter": param,
                    "pre": p, "during": float(d), "flag": flag, "source_page": page})
    return pd.DataFrame(out, columns=["site", "festival", "year", "parameter", "pre", "during",
                                      "flag", "source_page"])


def suspicious_constants(df: pd.DataFrame, min_cells: int = 5) -> pd.DataFrame:
    """Metal values repeated in min_cells+ ghat-phase cells within a festival-year."""
    met = df[df["parameter"].isin(METALS) & (df["status"] == MEASURED)]
    met = met.drop_duplicates(["festival", "year", "parameter", "value", "site", "phase"])
    cnt = met.groupby(["festival", "year", "parameter", "value"]).size().rename("cells").reset_index()
    out = cnt[cnt["cells"] >= min_cells].copy()
    out["flag"] = "possible placeholder, verify in report"
    return out.reset_index(drop=True)
