"""CPCB water-quality limits as rules, plus per-reading severity."""
from __future__ import annotations

import re
from dataclasses import dataclass

import pandas as pd

from ghatwatch.config import load_config

_ALIASES = {"Dissolved oxygen": ("dissolved oxygen", "do"), "BOD": ("bod", "biochemical oxygen"),
            "pH": ("ph",)}
_NUM = r"(\d+(?:\.\d+)?)"


@dataclass(frozen=True)
class Rule:
    """Limit for one parameter; None means no bound on that side. `cap` scales severity."""
    min: float | None = None
    max: float | None = None
    cap: float = 1.0


def canonical_parameter(name: str) -> str | None:
    """Map a CPCB/CSV parameter label to a scored parameter name, or None."""
    n = re.sub(r"[^a-z ]", " ", str(name).lower()).split()
    joined = " ".join(n)
    for canon, keys in _ALIASES.items():
        if any(joined == k or joined.startswith(k + " ") for k in keys):
            return canon
    return None


def parse_limit(text: str) -> tuple[float | None, float | None]:
    """Parse a criteria cell like '6.5 to 8.5', '5 mg/l or more', '<= 3' into (min, max)."""
    t = str(text).lower().replace("–", "-")
    rng = re.search(_NUM + r"\s*(?:-|to)\s*" + _NUM, t)
    if rng:
        return float(rng.group(1)), float(rng.group(2))
    num = re.search(_NUM, t)
    if not num:
        raise ValueError(f"Cannot parse CPCB limit: {text!r}")
    v = float(num.group(1))
    if re.search(r"more|min|>|above|not less", t):
        return v, None
    if re.search(r"less|max|<|below|not exceed|not more", t):
        return None, v
    raise ValueError(f"Cannot tell min/max in CPCB limit: {text!r}")


def _read_limits(path: str, klass: str) -> dict[str, tuple[float | None, float | None]]:
    """Read (min, max) per scored parameter from long or wide CPCB CSV layouts."""
    df = pd.read_csv(path, dtype=str, keep_default_na=False, encoding="utf-8-sig")
    cols = {c.lower().strip(): c for c in df.columns}
    pcol = next((cols[c] for c in cols if "param" in c or "criteria" == c), df.columns[0])
    ccol = next((cols[c] for c in cols if c in ("class", "designated best use class", "category")), None)
    out: dict = {}
    if ccol is not None:  # long layout: one row per (class, parameter)
        sub = df[df[ccol].str.strip().str.upper().str.replace("CLASS", "").str.strip() == klass.upper()]
        mincol = next((cols[c] for c in cols if c.startswith("min")), None)
        maxcol = next((cols[c] for c in cols if c.startswith("max")), None)
        lcol = next((cols[c] for c in cols if c in ("limit", "criteria", "value", "criterion")), None)
        for _, r in sub.iterrows():
            canon = canonical_parameter(r[pcol])
            if canon is None:
                continue
            if mincol or maxcol:
                lo = float(r[mincol]) if mincol and r[mincol].strip() else None
                hi = float(r[maxcol]) if maxcol and r[maxcol].strip() else None
                out[canon] = (lo, hi)
            elif lcol:
                out[canon] = parse_limit(r[lcol])
    else:  # wide layout: one column per class
        kcol = next((cols[c] for c in cols if c.replace("class", "").strip() == klass.lower()), None)
        if kcol is None:
            raise ValueError(f"No column for class {klass} in {path}: {list(df.columns)}")
        for _, r in df.iterrows():
            canon = canonical_parameter(r[pcol])
            if canon and r[kcol].strip():
                out[canon] = parse_limit(r[kcol])
    return out


def load_rules(path: str, klass: str = "B", cfg: dict | None = None) -> dict:
    """Build {parameter: Rule} for the class from the CPCB CSV; raise on mismatch with config."""
    cfg = cfg or load_config()
    expected = cfg["class_limits"][klass]
    found = _read_limits(path, klass)
    rules = {}
    for param, exp in expected.items():
        if param not in found:
            raise ValueError(f"CPCB file {path} has no Class {klass} limit for {param}")
        lo, hi = found[param]
        if (lo, hi) != (exp.get("min"), exp.get("max")):
            raise ValueError(f"Class {klass} {param}: file says min={lo}, max={hi}; "
                             f"expected {exp}. Fix config or data, do not guess.")
        rules[param] = Rule(min=lo, max=hi, cap=float(cfg["severity_caps"][param]))
    return rules


def severity(parameter: str, value: float, rules: dict) -> float:
    """Severity in [0, 1] of one MEASURED reading; > 0 means fail. Boundaries pass."""
    if parameter not in rules:
        raise ValueError(f"No rule for parameter {parameter!r}")
    r = rules[parameter]
    below = (r.min - value) if r.min is not None else 0.0
    above = (value - r.max) if r.max is not None else 0.0
    return min(max(below, above, 0.0) / r.cap, 1.0)


def is_failure(parameter: str, value: float, rules: dict) -> bool:
    """True if the reading breaches its limit."""
    return severity(parameter, value, rules) > 0
