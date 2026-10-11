import pandas as pd

def get_latest_risk_level(df: pd.DataFrame, ghat_name: str) -> str:
    """Returns the risk level of the ghat based on the latest data."""
    ghat_data = df[df['site'] == ghat_name]
    if ghat_data.empty:
        return "No data found."
    # Simplified: return the max severity
    return f"Risk level: {ghat_data['severity'].max()}"

def get_all_ghat_names(df: pd.DataFrame) -> list:
    """Returns all ghat names."""
    return df['site'].unique().tolist()
