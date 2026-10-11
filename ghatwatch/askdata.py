import pandas as pd
from ghatwatch.facts import get_latest_risk_level

def ask_data(df: pd.DataFrame, question: str) -> str:
    """Answers a question based on data."""
    if "risk" in question.lower():
        # Just return risk for first site for now, as a demonstration
        return get_latest_risk_level(df, df['site'].iloc[0])
    return "I don't have enough data to answer that."
