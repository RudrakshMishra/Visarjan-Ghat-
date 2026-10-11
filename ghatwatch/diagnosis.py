"""Chronic / event-linked / persisting / transient / no-baseline diagnosis (TRD 5)."""
from __future__ import annotations

import pandas as pd

from ghatwatch.loader import BDL, MEASURED, ND
from ghatwatch.rules import severity

CHRONIC, EVENT, PERSIST, TRANSIENT = "CHRONIC", "EVENT-LINKED", "PERSISTING", "TRANSIENT"
NO_BASELINE, OK, INSUFFICIENT = "NO BASELINE", "OK", "INSUFFICIENT DATA"
METALS = ("Chromium", "Lead", "Zinc", "Copper")


def _phase_state(rows: pd.DataFrame, param: str, rules: dict) -> tuple[str, object]:
    """('pass'|'fail'|'missing', display value) for one phase cell; worst reading wins."""
    m = rows[rows["status"] == MEASURED]
    if len(m):
        sev = [severity(param, v, rules) for v in m["value"]]
        i = max(range(len(sev)), key=lambda k: sev[k])
        return ("fail" if sev[i] > 0 else "pass"), float(m["value"].iloc[i])
    low = rows[rows["status"].isin([BDL, ND])]
    if len(low):  # very low: passes a max-only limit, fails a min limit (e.g. DO)
        return ("pass" if rules[param].min is None else "fail"), low["status"].iloc[0]
    return "missing", rows["status"].iloc[0] if len(rows) else "NOT_SAMPLED"


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
    cells = {k: g for k, g in df[df["parameter"].isin(list(rules))]
             .groupby(["site", "festival", "year", "parameter", "phase"], sort=False)}
    empty = df.iloc[0:0]
    out = []
    for site, fest, year in sorted(set(map(tuple, df[["site", "festival", "year"]].values.tolist()))):
        for param in rules:
            states = {ph: _phase_state(cells.get((site, fest, year, param, ph), empty), param, rules)
                      for ph in ("pre", "during", "after")}
            tag = classify(*(states[ph][0] for ph in ("pre", "during", "after")))
            out.append({"site": site, "festival": fest, "year": int(year), "parameter": param,
                        "tag": tag, **{ph: states[ph][1] for ph in states}})
    return pd.DataFrame(out, columns=["site", "festival", "year", "parameter", "tag",
                                      "pre", "during", "after"])


def metals_watch(df: pd.DataFrame, factor: float = 3.0) -> pd.DataFrame:
    """Informational: during >= factor x pre, or BDL/ND pre with a measured during value."""
    out = []
    met = df[df["parameter"].isin(METALS)]
    for (site, fest, year, param), g in met.groupby(["site", "festival", "year", "parameter"]):
        pre, dur = g[g["phase"] == "pre"], g[g["phase"] == "during"]
        dm = dur[dur["status"] == MEASURED]
        if dm.empty or pre.empty:
            continue
        d = float(dm["value"].max())
        pm = pre[pre["status"] == MEASURED]
        if len(pm) and float(pm["value"].max()) > 0 and d >= factor * float(pm["value"].max()):
            flag = f"during is {factor:g} times pre or more"
            p = float(pm["value"].max())
        elif pm.empty and pre["status"].isin([BDL, ND]).any():
            flag, p = "above detection during event window", pre["status"].iloc[0]
        else:
            continue
        out.append({"site": site, "festival": fest, "year": int(year), "parameter": param,
                    "pre": p, "during": d, "flag": flag,
                    "source_page": dm["source_page"].iloc[0]})
    return pd.DataFrame(out, columns=["site", "festival", "year", "parameter", "pre", "during",
                                      "flag", "source_page"])


def suspicious_constants(df: pd.DataFrame, min_cells: int = 5) -> pd.DataFrame:
    """Metal values repeated in min_cells+ ghat-phase cells within a festival-year."""
    met = df[df["parameter"].isin(METALS) & (df["status"] == MEASURED)]
    cnt = (met.groupby(["festival", "year", "parameter", "value"])
           .apply(lambda g: len(g[["site", "phase"]].drop_duplicates()), include_groups=False)
           .rename("cells").reset_index())
    out = cnt[cnt["cells"] >= min_cells].copy()
    out["flag"] = "possible placeholder, verify in report"
    return out.reset_index(drop=True)
