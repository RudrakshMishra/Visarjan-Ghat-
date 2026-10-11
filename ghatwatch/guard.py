"""Claim Guard: deterministic number and banned-phrase check on any text."""
from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class GuardResult:
    ok: bool
    numbers_checked: int
    bad_numbers: list = field(default_factory=list)
    bad_phrases: list = field(default_factory=list)


def guard(text: str, facts: dict, cfg, extra_allowed: set[str] = frozenset()) -> GuardResult:
    """Check every number in text against facts and scan for banned phrases."""
    raise NotImplementedError
