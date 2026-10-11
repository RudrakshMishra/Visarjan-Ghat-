import pandas as pd
from dataclasses import dataclass
import yaml

@dataclass
class Rule:
    min_val: float = None
    max_val: float = None

def load_rules(path: str, klass: str = "B") -> dict:
    rules_df = pd.read_csv(path)
    # Filter for the selected class
    class_df = rules_df[rules_df['class'] == klass]

    rules = {}
    for _, row in class_df.iterrows():
        rules[row['parameter']] = Rule(
            min_val=row.get('min'),
            max_val=row.get('max')
        )
    return rules

def severity(parameter: str, value: float, rules: dict) -> float:
    if parameter not in rules:
        return 0.0

    rule = rules[parameter]

    # Simple clamp function for severity 0 to 1
    def clamp(v, min_v, max_v):
        return max(min_v, min(v, max_v))

    # Based on Class B limits
    if parameter == "Dissolved oxygen":
        # Limit 5+, target is 5.
        # Below 5 is bad. Severity = (5 - v) / 5
        if value >= 5: return 0.0
        return clamp((5 - value) / 5, 0, 1)

    if parameter == "BOD":
        # Limit 3-, target is 3.
        # Above 3 is bad. Severity = (v - 3) / 9
        if value <= 3: return 0.0
        return clamp((value - 3) / 9, 0, 1)

    if parameter == "pH":
        # Limit 6.5 - 8.5
        if 6.5 <= value <= 8.5: return 0.0
        dist = min(abs(value - 6.5), abs(value - 8.5))
        return clamp(dist / 1.0, 0, 1)

    return 0.0
