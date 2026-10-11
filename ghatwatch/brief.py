import pandas as pd

def summarize_ghats(df: pd.DataFrame) -> str:
    """Summarizes current state of ghats."""
    return f"Total {df['site'].nunique()} ghats monitored."
