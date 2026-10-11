"""Load the Bhopal ghats CSV into a normalized DataFrame with a `status` column."""
from __future__ import annotations

import pandas as pd


def load_readings(path: str) -> pd.DataFrame:
    """Return normalized readings (year, festival, site, phase, parameter, value, status, ...)."""
    raise NotImplementedError
