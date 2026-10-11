import pandas as pd
import numpy as np
import os

def load_readings(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)

    # Standardize status handling
    # Expected phases: pre, during, after
    # Status codes: MEASURED, BDL, ND, NOT_SAMPLED

    def determine_status(row):
        val = row.get('value')
        flag = row.get('flag')
        val_as_printed = str(row.get('value_as_printed', ''))

        if pd.notna(val) and val != '':
            return 'MEASURED'

        if pd.notna(flag):
            flag_str = str(flag).upper()
            if flag_str == 'BDL': return 'BDL'
            if flag_str == 'ND': return 'ND'
            if flag_str in ['NOT SAMPLED', '*', '**']: return 'NOT_SAMPLED'

        if val_as_printed in ['', '-', '_']:
            return 'NOT_SAMPLED'

        return 'UNKNOWN' # Should trigger error handling

    df['status'] = df.apply(determine_status, axis=1)

    # Handle numeric conversion for 'value' - BDL/ND/NOT_SAMPLED should not be 0
    # They should be NaN in the numeric column but tracked by status
    df['value'] = pd.to_numeric(df['value'], errors='coerce')

    # Basic validation
    if (df['status'] == 'UNKNOWN').any():
        unknowns = df[df['status'] == 'UNKNOWN']
        raise ValueError(f"Found unknown status rows: {unknowns.to_dict('records')}")

    return df
