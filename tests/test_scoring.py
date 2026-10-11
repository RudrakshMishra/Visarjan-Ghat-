"""T6, T7, T12 and score mechanics."""
import copy
import math

import pandas as pd
import pytest

from ghatwatch.scoring import event_jump, score_ghats


def test_t6_deterministic(syn, rules, cfg):
    a, b = score_ghats(syn, rules, cfg), score_ghats(syn.sample(frac=1, random_state=1), rules, cfg)
    pd.testing.assert_frame_equal(a, b)


def test_ranking_shape(syn, rules, cfg):
    s = score_ghats(syn, rules, cfg)
    assert list(s["rank"]) == [1, 2, 3]
    order = list(s["site"])
    assert order.index("Ghat A") < order.index("Ghat B")
    assert all(0 <= x <= 100 for x in s["score"].dropna())


def test_no_baseline_and_low_conf(syn, rules, cfg):
    c = score_ghats(syn, rules, cfg).set_index("site").loc["Ghat C"]
    assert "No baseline" in c["tags"] and "Unknown, test first" in c["tags"]
    assert c["confidence"] == "Low" and pd.isna(c["E"])


def _passes(df, rules, site):
    from ghatwatch.rules import is_failure
    m = df[(df["site"] == site) & (df["status"] == "MEASURED") & df["parameter"].isin(list(rules))]
    return sum(not is_failure(p, v, rules) for p, v in zip(m["parameter"], m["value"]))


def _blank(df, site, param, phase, year, fest):
    df = df.copy()
    i = df[(df["site"] == site) & (df["parameter"] == param) & (df["phase"] == phase)
           & (df["year"] == year) & (df["festival"] == fest)].index
    df.loc[i, ["status", "value"]] = ["NOT_SAMPLED", math.nan]
    return df


def test_t7_missing_never_counts_as_pass(syn, rules, cfg):
    base = score_ghats(syn, rules, cfg).set_index("site").loc["Ghat B"]
    df = _blank(syn, "Ghat B", "BOD", "after", 2024, "Ganesh")  # a failing reading
    after = score_ghats(df, rules, cfg).set_index("site").loc["Ghat B"]
    assert after["coverage"] < base["coverage"]
    assert _passes(df, rules, "Ghat B") == _passes(syn, rules, "Ghat B")


def test_t7_missing_pass_never_lowers_score(syn, rules, cfg):
    base = score_ghats(syn, rules, cfg).set_index("site").loc["Ghat A", "score"]
    df = _blank(syn, "Ghat A", "pH", "pre", 2024, "Ganesh")  # a passing reading
    assert score_ghats(df, rules, cfg).set_index("site").loc["Ghat A", "score"] >= base


def test_t12_weight_change(syn, rules, cfg):
    c2 = copy.deepcopy(cfg)
    c2["weights"] = {"S": 0.6, "P": 0.25, "E": 0.15}
    assert not score_ghats(syn, rules, cfg)["score"].equals(score_ghats(syn, rules, c2)["score"])


def test_recency_weights(syn, rules, cfg):
    c2 = copy.deepcopy(cfg)
    c2["recency"] = {k: 1.0 for k in cfg["recency"]}
    a = score_ghats(syn, rules, cfg).set_index("site")
    b = score_ghats(syn, rules, c2).set_index("site")
    assert a.loc["Ghat B", "S"] != b.loc["Ghat B", "S"]


def test_event_jump_do_zero_pre():
    m = pd.DataFrame({"festival": ["G"] * 2, "year": [2025] * 2, "parameter": ["Dissolved oxygen"] * 2,
                      "phase": ["pre", "during"], "value": [0.0, 0.0]})
    assert event_jump(m) == 0.0


def test_unknown_year_raises(syn, rules, cfg):
    df = syn.copy()
    df.loc[df.index[0], "year"] = 2019
    with pytest.raises(ValueError, match="recency"):
        score_ghats(df, rules, cfg)
