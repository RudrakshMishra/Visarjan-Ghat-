import pandas as pd
from ghatwatch.scoring import score_ghats

def test_scoring():
    # Setup dummy data
    data = {
        'site': ['Ghat1', 'Ghat1', 'Ghat2'],
        'year': [2025, 2025, 2025],
        'festival': ['Ganesh', 'Ganesh', 'Ganesh'],
        'parameter': ['pH', 'Dissolved oxygen', 'pH'],
        'status': ['MEASURED', 'MEASURED', 'MEASURED'],
        'value': [7.0, 4.0, 9.0], # pH 7.0 is clean, DO 4.0 is bad, pH 9.0 is somewhat bad
        'value_as_printed': ['7.0', '4.0', '9.0'],
        'unit_assumed': ['-', 'mg/l', '-']
    }
    df = pd.DataFrame(data)

    # Needs a mock rules dict based on rules.py
    from ghatwatch.rules import Rule
    # Mocking rules based on rules.py
    rules = {
        'pH': Rule(min_val=6.5, max_val=8.5),
        'Dissolved oxygen': Rule(min_val=5.0, max_val=float('inf'))
    }

    cfg = {'scoring': {'recency_years': {2025: 1.0}}}

    ghat_scores = score_ghats(df, rules, cfg)

    assert not ghat_scores.empty
    assert 'score' in ghat_scores.columns
    # Check if Ghat1 has a score
    assert 'Ghat1' in ghat_scores['site'].values
