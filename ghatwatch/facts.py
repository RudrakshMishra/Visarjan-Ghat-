"""Assemble facts.json: the single source of truth for every brief."""
from __future__ import annotations

import math
import re

import numpy as np
import pandas as pd

from ghatwatch.coverage import TABLE_ABSENT, coverage_matrix
from ghatwatch.diagnosis import diagnose, metals_watch, suspicious_constants
from ghatwatch.loader import MEASURED, NOT_SAMPLED
from ghatwatch.rules import severity
from ghatwatch.scoring import TAG_NO_BASELINE, score_ghats

DO, BOD, PH = "Dissolved oxygen", "BOD", "pH"
TEXT_KEYS = ("do_below_limit", "do_zero", "bod_above_limit", "ph_outside_range", "not_sampled",
             "table_absent", "no_baseline", "chronic", "event_linked", "persisting", "metals_watch")
_EN_ITEMS = {
    "units_assumed": "Units are assumed to be mg/l where the report does not print them.",
    "four_metals_only": "Only four metals are reported (chromium, lead, zinc, copper); they have no Class B limit.",
    "kamla_ambiguity": "Rani Kamlapati and Kamla Park may be two different places recorded under one name.",
    "table_absent": "{site} has no {festival} {year} table in the report.",
    "placeholder": "{parameter} shows the same value {value} at {cells} places in {festival} {year}: possible placeholder, verify in report.",
    "not_sampled": "{site}: {count} of {expected} required readings are not sampled.",
}


def fmt_num(x) -> str:
    """Single number format for facts, templates and guard: ints plain, floats up to 4 decimals (as printed)."""
    if isinstance(x, bool):
        raise TypeError("bool is not a number")
    if isinstance(x, (int, np.integer)):
        return str(int(x))
    s = f"{float(x):.4f}".rstrip("0")
    return s + "0" if s.endswith(".") else s


def _page(v) -> int | None:
    return None if v is None or pd.isna(v) else int(v)


def _worst(m: pd.DataFrame, param: str, rules: dict):
    rows = m[m["parameter"] == param]
    if rows.empty:
        return None
    sev = [severity(param, v, rules) for v in rows["value"]]
    i = max(range(len(sev)), key=lambda k: (sev[k], rows["year"].iloc[k]))
    return rows.iloc[i] if sev[i] > 0 else None


def _reading_reason(key: str, r: pd.Series, extra: dict) -> dict:
    return {"text_key": key, "params": {"value": float(r["value"]), "festival": r["festival"],
            "year": int(r["year"]), "phase": r["phase"], **extra},
            "page": _page(r["source_page"]), "year_report": int(r["year"])}


def _site_reasons(site, g, diag, cov, metals, rules, tags, factor=3) -> list[dict]:
    m = g[g["status"] == MEASURED]
    out = []
    r = _worst(m, DO, rules)
    if r is not None:
        out.append(_reading_reason("do_zero" if r["value"] == 0 else "do_below_limit", r,
                                   {"limit": rules[DO].min}))
    r = _worst(m, BOD, rules)
    if r is not None:
        out.append(_reading_reason("bod_above_limit", r, {"limit": rules[BOD].max}))
    r = _worst(m, PH, rules)
    if r is not None:
        out.append(_reading_reason("ph_outside_range", r, {"low": rules[PH].min, "high": rules[PH].max}))
    for tag, key in (("CHRONIC", "chronic"), ("EVENT-LINKED", "event_linked"), ("PERSISTING", "persisting")):
        hits = diag[diag["tag"].str.split("+").apply(lambda t: tag in t)]
        if len(hits):
            h = hits.sort_values(["year", "festival", "parameter"]).iloc[-1]
            pg = g[(g["festival"] == h["festival"]) & (g["year"] == h["year"]) & (g["parameter"] == h["parameter"])]
            out.append({"text_key": key, "params": {"parameter": h["parameter"], "festival": h["festival"],
                        "year": int(h["year"]), "count": len(hits)},
                        "page": _page(pg["source_page"].dropna().iloc[0]) if pg["source_page"].notna().any() else None,
                        "year_report": int(h["year"])})
    if TAG_NO_BASELINE in tags:
        out.append({"text_key": "no_baseline", "params": {}, "page": None, "year_report": None})
    ns = cov[cov["status"] == NOT_SAMPLED]
    if len(ns):
        out.append({"text_key": "not_sampled", "params": {"count": len(ns), "expected": int((cov["status"] != TABLE_ABSENT).sum())},
                    "page": None, "year_report": None})
    for f, y in cov[cov["status"] == TABLE_ABSENT][["festival", "year"]].drop_duplicates().values:
        out.append({"text_key": "table_absent", "params": {"festival": f, "year": int(y)}, "page": None,
                    "year_report": int(y)})
    for _, mw in metals.iterrows():
        out.append({"text_key": "metals_watch", "params": {"parameter": mw["parameter"], "festival": mw["festival"],
                    "year": int(mw["year"]), "flag": mw["flag"], "factor": factor},
                    "page": _page(mw["source_page"]), "year_report": int(mw["year"])})
    return out


def _actions(ghat: dict) -> list[dict]:
    keys = {r["text_key"] for r in ghat["reasons"]}
    acts = []
    if keys & {"do_below_limit", "do_zero"}:
        acts.append("aerate")
    if keys & {"bod_above_limit"}:
        acts.append("clean")
    if ghat["confidence"] != "High" or keys & {"not_sampled", "table_absent", "no_baseline"}:
        acts.append("test")
    return [{"key": a, "site": ghat["site"]} for a in acts]


def collect_numbers(obj, out: set | None = None) -> set[str]:
    """Every int/float anywhere in a nested structure, formatted with fmt_num."""
    out = set() if out is None else out
    if isinstance(obj, dict):
        for v in obj.values():
            collect_numbers(v, out)
    elif isinstance(obj, (list, tuple)):
        for v in obj:
            collect_numbers(v, out)
    elif isinstance(obj, (int, float)) and not isinstance(obj, bool) and not (isinstance(obj, float) and math.isnan(obj)):
        out.add(fmt_num(obj))
    return out


def build_facts(df: pd.DataFrame, rules: dict, cfg: dict) -> dict:
    """Return the TRD facts schema plus items/actions used by the templates."""
    scores = score_ghats(df, rules, cfg)
    diag, cov_all = diagnose(df, rules), coverage_matrix(df, params=tuple(rules))
    factor = cfg.get("metals", {}).get("jump_factor", 3)
    metals = metals_watch(df, factor)
    placeholders = suspicious_constants(df, cfg.get("metals", {}).get("placeholder_min_cells", 5))
    ghats = []
    for _, s in scores.iterrows():
        site = s["site"]
        g = df[df["site"] == site]
        reasons = _site_reasons(site, g, diag[diag["site"] == site], cov_all[cov_all["site"] == site],
                                metals[metals["site"] == site], rules, s["tags"], factor)
        gh = {"site": site, "rank": int(s["rank"]),
              "score": None if pd.isna(s["score"]) else round(float(s["score"]), 1),
              "confidence": s["confidence"], "coverage_pct": int(round(100 * s["coverage"])),
              "tags": list(s["tags"]), "reasons": reasons}
        gh["actions"] = _actions(gh)
        ghats.append(gh)
    absent = cov_all[cov_all["status"] == TABLE_ABSENT][["site", "festival", "year"]].drop_duplicates()
    absent_items = [{"key": "table_absent", "params": {"site": a, "festival": f, "year": int(y)}}
                    for a, f, y in absent.values]
    ph_items = [{"key": "placeholder", "params": {"parameter": p["parameter"], "value": float(p["value"]),
                 "cells": int(p["cells"]), "festival": p["festival"], "year": int(p["year"])}}
                for _, p in placeholders.iterrows()]
    ns_items = [{"key": "not_sampled", "params": {"site": gh["site"], **r["params"]}}
                for gh in ghats for r in gh["reasons"] if r["text_key"] == "not_sampled"]
    limits_items = ([{"key": "units_assumed", "params": {}}, {"key": "four_metals_only", "params": {}},
                     {"key": "kamla_ambiguity", "params": {}}] + absent_items + ph_items)
    gap_items = absent_items + ns_items + ph_items
    td, ad = cfg["target_date"], cfg["after_phase_date"]
    facts = {
        "generated_for": f"Durga visarjan {td}", "class": cfg.get("class", "B"),
        "target_date": td, "after_phase_date": ad, "n_ghats": len(ghats), "n_top": min(3, len(ghats)),
        "limits": {"do_min": rules[DO].min, "bod_max": rules[BOD].max, "ph_min": rules[PH].min,
                   "ph_max": rules[PH].max},
        "years": sorted(int(y) for y in df["year"].unique()),
        "ghats": ghats, "gap_items": gap_items, "limits_items": limits_items,
        "gaps": [_EN_ITEMS[i["key"]].format(**{k: fmt_num(v) if isinstance(v, float) else v
                                               for k, v in i["params"].items()}) for i in gap_items],
        "limits_panel": [_EN_ITEMS[i["key"]].format(**{k: fmt_num(v) if isinstance(v, float) else v
                                                       for k, v in i["params"].items()}) for i in limits_items],
    }
    nums = collect_numbers(facts)
    nums |= {p for d in (td, ad) for p in re.findall(r"\d+", d)}
    nums |= {str(y)[-2:] for y in facts["years"]}
    facts["allowed_numbers"] = sorted(nums, key=lambda v: (float(v), v))
    return facts
