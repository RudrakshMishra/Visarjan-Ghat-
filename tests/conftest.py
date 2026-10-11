"""Shared fixtures. SYNTHETIC values only: they test logic, they are not Bhopal data."""
from pathlib import Path

import numpy as np
import pandas as pd
import pytest

from ghatwatch.config import load_config
from ghatwatch.loader import normalize

ROOT = Path(__file__).resolve().parents[1]
REAL_CSV = ROOT / "data" / "bhopal_ghats_2023_2025.csv"
REAL_CPCB = ROOT / "data" / "cpcb_water_quality_criteria.csv"
needs_real = pytest.mark.skipif(not REAL_CSV.exists(), reason="real data not in data/ yet")

COLS = ["year", "festival", "site", "water_body", "phase", "parameter", "value", "unit_assumed",
        "flag", "value_as_printed", "parameter_as_printed", "site_as_printed",
        "site_match_confidence", "source_page"]

# site -> festival -> year -> {param: (pre, during, after)}; None = not sampled
_SYN = {
    "Ghat A": {"Ganesh": {2024: {"Dissolved oxygen": (6.0, 2.0, 3.0), "BOD": (2.0, 8.0, 4.0), "pH": (7.0, 7.5, 7.2)},
                          2025: {"Dissolved oxygen": (6.5, 0.0, 4.0), "BOD": (2.5, 12.0, 5.0), "pH": (7.1, 8.9, 7.0)}},
               "Durga": {2024: {"Dissolved oxygen": (5.5, 4.5, 5.5), "BOD": (2.0, 3.0, 2.0), "pH": (7.0, 7.0, 7.0)},
                         2025: {"Dissolved oxygen": (6.0, 3.0, 6.0), "BOD": (2.0, 6.0, 2.5), "pH": (7.0, 7.4, 7.1)}}},
    "Ghat B": {"Ganesh": {2024: {"Dissolved oxygen": (4.0, 3.5, 4.2), "BOD": (4.0, 5.0, 4.5), "pH": (8.6, 8.7, 8.6)},
                          2025: {"Dissolved oxygen": (4.5, 4.0, 4.4), "BOD": (3.5, 4.0, 3.6), "pH": (8.4, 8.5, 8.4)}},
               "Durga": {2024: {"Dissolved oxygen": (5.0, 5.0, 5.0), "BOD": (3.0, 3.0, 3.0), "pH": (6.5, 8.5, 7.0)}}},
    "Ghat C": {"Ganesh": {2025: {"Dissolved oxygen": (None, 1.0, None), "BOD": (None, 9.0, None), "pH": (None, None, None)}}},
}


def synthetic_raw() -> pd.DataFrame:
    rows = []
    for site, fests in _SYN.items():
        for fest, years in fests.items():
            for year, params in years.items():
                for param, vals in params.items():
                    for phase, v in zip(("pre", "during", "after"), vals):
                        flag = "" if v is not None else ("*" if param == "pH" else "not sampled")
                        rows.append((year, fest, site, "Lake", phase, param,
                                     "" if v is None else str(v), "mg/l", flag,
                                     flag if v is None else str(v), param, site, "high",
                                     str(10 + year - 2024)))
    # metals: Lead jumps 4x at Ghat A Ganesh 2025; Zinc BDL pre -> measured during at Ghat B
    for site, phase, param, v, flag in [("Ghat A", "pre", "Lead", "0.01", ""), ("Ghat A", "during", "Lead", "0.04", ""),
                                        ("Ghat B", "pre", "Zinc", "", "BDL"), ("Ghat B", "during", "Zinc", "0.2", "")]:
        rows.append((2025, "Ganesh", site, "Lake", phase, param, v, "mg/l", flag, flag or v, param, site, "high", "11"))
    return pd.DataFrame(rows, columns=COLS)


@pytest.fixture
def cfg() -> dict:
    return load_config(ROOT / "config.yaml")


@pytest.fixture
def cpcb_csv(tmp_path) -> Path:
    """Synthetic CPCB criteria file in long layout (values equal the published CPCB table)."""
    p = tmp_path / "cpcb.csv"
    p.write_text("class,parameter,criteria\n"
                 "B,Dissolved oxygen,5 mg/l or more\nB,BOD 5 days 20C,3 mg/l or less\nB,pH,6.5 to 8.5\n"
                 "C,Dissolved oxygen,4 mg/l or more\nC,BOD 5 days 20C,3 mg/l or less\nC,pH,6 to 9\n",
                 encoding="utf-8")
    return p


@pytest.fixture
def rules(cpcb_csv, cfg):
    from ghatwatch.rules import load_rules
    return load_rules(str(cpcb_csv), "B", cfg)


@pytest.fixture
def rules_c(cpcb_csv, cfg):
    from ghatwatch.rules import load_rules
    return load_rules(str(cpcb_csv), "C", cfg)


@pytest.fixture
def syn() -> pd.DataFrame:
    return normalize(synthetic_raw())


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
        (*a, "after", "pH", np.nan, "", "**", "**", "pH", "Ghat A", "high", 10),
        (*a, "during", "Lead", np.nan, "mg/l", "BDL", "BDL", "Pb", "Ghat A", "high", 11),
        (*a, "after", "Lead", np.nan, "mg/l", "ND", "ND", "Pb", "Ghat A", "high", 11),
    ]
    return pd.DataFrame(rows, columns=COLS)
