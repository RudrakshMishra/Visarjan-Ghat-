"""T10: hand-built cases for every tag, metals watch, suspicious constants."""
import pandas as pd
import pytest

from ghatwatch.diagnosis import classify, diagnose, metals_watch, suspicious_constants


@pytest.mark.parametrize("states,tag", [
    (("fail", "pass", "pass"), "CHRONIC"),
    (("fail", "missing", "missing"), "CHRONIC"),
    (("pass", "fail", "missing"), "EVENT-LINKED"),
    (("pass", "fail", "fail"), "EVENT-LINKED+PERSISTING"),
    (("pass", "fail", "pass"), "EVENT-LINKED+TRANSIENT"),
    (("pass", "pass", "fail"), "PERSISTING"),
    (("missing", "fail", "missing"), "NO BASELINE"),
    (("pass", "pass", "pass"), "OK"),
    (("pass", "pass", "missing"), "INSUFFICIENT DATA"),
    (("missing", "pass", "missing"), "INSUFFICIENT DATA"),
    (("missing", "missing", "missing"), "INSUFFICIENT DATA"),
])
def test_t10_classify(states, tag):
    assert classify(*states) == tag


def test_diagnose_synthetic(syn, rules):
    d = diagnose(syn, rules).set_index(["site", "festival", "year", "parameter"])
    assert d.loc[("Ghat A", "Ganesh", 2024, "Dissolved oxygen"), "tag"] == "EVENT-LINKED+PERSISTING"
    assert d.loc[("Ghat B", "Ganesh", 2024, "BOD"), "tag"] == "CHRONIC"
    assert d.loc[("Ghat C", "Ganesh", 2025, "Dissolved oxygen"), "tag"] == "NO BASELINE"
    assert d.loc[("Ghat B", "Durga", 2024, "Dissolved oxygen"), "tag"] == "OK"  # boundary passes
    assert d.loc[("Ghat A", "Durga", 2025, "BOD"), "tag"] == "EVENT-LINKED+TRANSIENT"


def test_metals_watch(syn):
    m = metals_watch(syn).set_index(["site", "parameter"])
    assert "3 times" in m.loc[("Ghat A", "Lead"), "flag"]
    assert m.loc[("Ghat B", "Zinc"), "flag"] == "above detection during event window"
    assert not m["flag"].str.contains("exceed").any()


def test_suspicious_constants(syn):
    assert suspicious_constants(syn).empty
    rows = [{"site": f"S{i}", "festival": "Ganesh", "year": 2025, "phase": "pre", "parameter": "Copper",
             "value": 0.05, "status": "MEASURED"} for i in range(5)]
    out = suspicious_constants(pd.DataFrame(rows))
    assert len(out) == 1 and out.iloc[0]["cells"] == 5
