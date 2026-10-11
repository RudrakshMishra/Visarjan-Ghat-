"""Hindcast: score from train years vs severity S in the test year (small-sample check)."""
from __future__ import annotations

import numpy as np
import pandas as pd

from ghatwatch.scoring import score_ghats

CAVEAT = ("Only a handful of ghats: this check is indicative, not proof. "
          "A low or high value can happen by chance.")


def average_ranks(x) -> np.ndarray:
    """Ranks starting at 1, ties get the average rank."""
    s = pd.Series(np.asarray(x, dtype=float))
    return s.rank(method="average").to_numpy()


def spearman(a, b) -> float | None:
    """Spearman rank correlation via Pearson on average ranks; None if undefined."""
    ra, rb = average_ranks(a), average_ranks(b)
    if ra.std() == 0 or rb.std() == 0:
        return None
    return float(np.corrcoef(ra, rb)[0, 1])


def hindcast(df: pd.DataFrame, rules: dict, cfg: dict) -> dict:
    """Top-3 overlap and Spearman between train-year score and test-year S."""
    h = cfg.get("hindcast", {"train_years": [2023, 2024], "test_year": 2025})
    train = score_ghats(df[df["year"].isin(h["train_years"])], rules, cfg).set_index("site")
    test = score_ghats(df[df["year"] == h["test_year"]], rules, cfg).set_index("site")
    common = sorted(set(train.index[train["score"].notna()]) & set(test.index[test["S"].notna()]))
    base = {"train_years": list(h["train_years"]), "test_year": h["test_year"], "n_ghats": len(common),
            "caveat": CAVEAT, "sites": common}
    if len(common) < 3:
        return {**base, "top3_overlap": None, "spearman": None,
                "reason": f"only {len(common)} ghats have both train and test data"}
    tr = train.loc[common, "score"].astype(float)
    te = test.loc[common, "S"].astype(float)
    top_tr = set(tr.sort_values(ascending=False, kind="stable").index[:3])
    top_te = set(te.sort_values(ascending=False, kind="stable").index[:3])
    return {**base, "top3_overlap": len(top_tr & top_te), "spearman": spearman(tr.values, te.values),
            "reason": None, "train_top3": sorted(top_tr), "test_top3": sorted(top_te)}
