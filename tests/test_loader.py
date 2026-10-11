"""T1-T4: loader statuses and real-data counts."""
import pandas as pd
import pytest

from conftest import REAL_CPCB, REAL_CSV, needs_real
from ghatwatch.loader import load_readings, normalize
from ghatwatch.rules import is_failure, load_rules


def test_t3_bdl_nd_status(tiny_raw):
    df = normalize(tiny_raw)
    lead = df[df["parameter"] == "Lead"].set_index("phase")
    assert lead.loc["during", "status"] == "BDL" and lead.loc["after", "status"] == "ND"
    assert lead["value"].isna().all()  # not zero
    assert len(df) == len(tiny_raw)  # never dropped


def test_t4_missing_codes(tiny_raw):
    df = normalize(tiny_raw)
    ns = df[df["status"] == "NOT_SAMPLED"]
    assert set(ns["value_as_printed"]) == {"not sampled", "*", "**"}


def test_unknown_code_raises(tiny_raw):
    bad = tiny_raw.copy()
    bad.loc[0, ["value", "flag", "value_as_printed"]] = [None, "trace", "trace"]
    with pytest.raises(ValueError, match="Unknown non-numeric"):
        normalize(bad)


def test_non_numeric_value_raises(tiny_raw):
    bad = tiny_raw.astype({"value": object})
    bad.loc[0, "value"] = "5,2"
    with pytest.raises(ValueError):
        normalize(bad)


def test_normalises_case_and_page(tiny_raw):
    raw = tiny_raw.copy()
    raw["phase"] = " PRE "
    raw["festival"] = "ganesh"
    df = normalize(raw)
    assert set(df["phase"]) == {"pre"} and set(df["festival"]) == {"Ganesh"}
    assert str(df["source_page"].dtype) == "Int64"


def _count(df, rules, param, fails):
    m = df[(df["parameter"] == param) & (df["status"] == "MEASURED")]
    return sum(is_failure(param, v, rules) for v in m["value"]) if fails else len(m)


@needs_real
def test_t1_do_below_5():
    df, rules = load_readings(str(REAL_CSV)), load_rules(str(REAL_CPCB), "B")
    assert (_count(df, rules, "Dissolved oxygen", True), _count(df, rules, "Dissolved oxygen", False)) == (42, 116)


@needs_real
def test_t2_bod_above_3():
    df, rules = load_readings(str(REAL_CSV)), load_rules(str(REAL_CPCB), "B")
    assert (_count(df, rules, "BOD", True), _count(df, rules, "BOD", False)) == (100, 112)
