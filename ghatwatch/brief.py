"""Render EN/HI briefs, WhatsApp text and printable HTML from facts."""
from __future__ import annotations


def render_brief(facts: dict, lang: str, mode: str = "template") -> str:
    """Render the brief in 'en' or 'hi'."""
    raise NotImplementedError
