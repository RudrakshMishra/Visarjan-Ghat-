"""Optional Cerebras layer: guarded brief generation with template fallback."""
from __future__ import annotations


def get_client(cfg):
    """Return a Cerebras client, or None if provider is 'none' or no key."""
    raise NotImplementedError


def brief_with_guard(facts: dict, lang: str, cfg) -> tuple:
    """Return (text, GuardResult, meta); never raises."""
    raise NotImplementedError
