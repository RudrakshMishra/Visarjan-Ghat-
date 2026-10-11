import pandas as pd
import numpy as np
from ghatwatch.rules import severity

def score_ghats(df: pd.DataFrame, rules: dict, cfg: dict) -> pd.DataFrame:
    # 1. Calculate severity for each reading
    df['severity'] = df.apply(
        lambda row: severity(row['parameter'], row['value'], rules)
        if row['status'] == 'MEASURED' else 0.0,
        axis=1
    )

    # 2. Score per ghat/festival/year/parameter
    # We take the max severity across phases for a given parameter in a festival-year
    # Then weight by recency
    weights = cfg['scoring']['recency_years']

    # Grouping to get max severity per ghat+year+festival+parameter
    # ... grouping logic ...

    # (Implementation details for S, P, E calculation)
    # This is a stub that will be filled based on the specific DF structure
    return pd.DataFrame() # Stub

def diagnose(df: pd.DataFrame, rules: dict) -> pd.DataFrame:
    return pd.DataFrame() # Stub
