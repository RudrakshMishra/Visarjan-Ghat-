"""Shared fixtures: a tiny hand-built readings frame (not real data)."""
import numpy as np
import pandas as pd
import pytest

COLS = ["year", "festival", "site", "water_body", "phase", "parameter", "value", "unit_assumed",
        "flag", "value_as_printed", "parameter_as_printed", "site_as_printed",
        "site_match_confidence", "source_page"]


@pytest.fixture
def tiny_raw() -> pd.DataFrame:
    """Raw-CSV-shaped rows covering MEASURED, BDL, ND and NOT_SAMPLED cases."""
    a = (2025, "Ganesh", "Ghat A", "Lake")
    rows = [
        (*a, "pre", "Dissolved oxygen", 6.0, "mg/l", "", "6.0", "DO", "Ghat A", "high", 10),
        (*a, "during", "Dissolved oxygen", 4.0, "mg/l", "", "4.0", "DO", "Ghat A", "high", 10),
        (*a, "after", "Dissolved oxygen", np.nan, "mg/l", "not sampled", "not sampled", "DO", "Ghat A", "high", 10),
        (*a, "pre", "BOD", 3.0, "mg/l", "", "3.0", "BOD", "Ghat A", "high", 10),
        (*a, "during", "BOD", 8.0, "mg/l", "", "8.0", "BOD", "Ghat A", "high", 10),
        (*a, "pre", "pH", np.nan, "", "*", "*", "pH", "Ghat A", "high", 10),
        (*a, "during", "Lead", np.nan, "mg/l", "BDL", "BDL", "Pb", "Ghat A", "high", 11),
        (*a, "after", "Lead", np.nan, "mg/l", "ND", "ND", "Pb", "Ghat A", "high", 11),
    ]
    return pd.DataFrame(rows, columns=COLS)
