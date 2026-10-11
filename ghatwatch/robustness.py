"""16-scenario rank robustness (4 weight sets x recency on/off x Class B/C)."""
from __future__ import annotations

import copy

import pandas as pd

from ghatwatch.scoring import score_ghats


def scenarios(cfg: dict) -> list[dict]:
    """List of {name, weights, recency(bool), klass} from config."""
    r = cfg["robustness"]
    return [{"name": f"{w}/{'recency' if rec else 'flat'}/{k}", "weights": ws, "recency": rec, "klass": k}
            for w, ws in r["weight_sets"].items() for rec in r["recency"] for k in r["classes"]]


def robustness(df: pd.DataFrame, rules_b: dict, rules_c: dict, cfg: dict) -> pd.DataFrame:
    """Per ghat: rank_min, rank_max, top3_count, n (number of scenarios)."""
    ranks: dict[str, list[int]] = {}
    sc = scenarios(cfg)
    for s in sc:
        c = copy.deepcopy(cfg)
        c["weights"] = dict(s["weights"])
        if not s["recency"]:
            c["recency"] = {y: 1.0 for y in cfg["recency"]}
        out = score_ghats(df, rules_b if s["klass"] == "B" else rules_c, c)
        for site, rank in zip(out["site"], out["rank"]):
            ranks.setdefault(site, []).append(int(rank))
    rows = [{"site": s, "rank_min": min(r), "rank_max": max(r), "top3_count": sum(x <= 3 for x in r),
             "n": len(sc)} for s, r in ranks.items()]
    return pd.DataFrame(rows).sort_values(["rank_min", "rank_max", "site"]).reset_index(drop=True)
