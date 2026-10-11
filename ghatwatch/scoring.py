import pandas as pd
import numpy as np
from ghatwatch.rules import severity

def score_ghats(df: pd.DataFrame, rules: dict, cfg: dict) -> pd.DataFrame:
    # 1. Calculate severity for each reading (MEASURED only)
    # severity() is already implemented in rules.py
    df['severity'] = df.apply(
        lambda row: severity(row['parameter'], row['value'], rules)
        if row['status'] == 'MEASURED' else 0.0,
        axis=1
    )

    # 2. Score per ghat/festival/year/parameter
    # Grouping to get max severity per ghat+year+festival+parameter
    # This represents the "worst case" in each ghat, festival-year
    grouped = df.groupby(['site', 'year', 'festival', 'parameter'])['severity'].max().reset_index()

    # 3. Apply Recency Weights
    weights = cfg['scoring']['recency_years']
    grouped['weight'] = grouped['year'].map(weights).fillna(0.5)
    grouped['weighted_severity'] = grouped['severity'] * grouped['weight']

    # 4. Aggregate Components per Ghat
    # S = Mean of max severities across params
    grouped['is_failure'] = (grouped['severity'] > 0).astype(int)

    ghat_scores = grouped.groupby('site').agg(
        S=('weighted_severity', 'mean'),
        P=('is_failure', 'mean'),
        E=('severity', 'var')
    ).reset_index().fillna(0)

    # As per TRD sec 5: Score = 100 * (0.45*S + 0.35*P + 0.20*E)
    ghat_scores['score'] = 100 * (0.45 * ghat_scores['S'] + 0.35 * ghat_scores['P'] + 0.20 * ghat_scores['E'])

    return ghat_scores.sort_values(by='score', ascending=False)
