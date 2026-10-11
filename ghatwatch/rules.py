"""CPCB water-quality limits as rules, plus per-reading severity."""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Rule:
    """Limit for one parameter; None means no bound on that side."""
    min: float | None = None
    max: float | None = None


def load_rules(path: str, klass: str = "B") -> dict:
    """Build {parameter: Rule} for the given CPCB class from the criteria CSV."""
    raise NotImplementedError


def severity(parameter: str, value: float, rules: dict) -> float:
    """Severity in [0, 1] of one MEASURED reading; > 0 means fail."""
    raise NotImplementedError


def is_failure(parameter: str, value: float, rules: dict) -> bool:
    """True if the reading breaches its limit."""
    raise NotImplementedError
