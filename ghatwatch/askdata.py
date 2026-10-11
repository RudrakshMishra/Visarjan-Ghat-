"""Ask-the-data: five dataset-only tools and a Cerebras tool loop."""
from __future__ import annotations

TOOLS: list[dict] = []


def run_tool(name: str, args: dict, df, rules, cfg) -> dict:
    """Run one dataset-only tool; result includes source_page and url."""
    raise NotImplementedError


def answer(question: str, df, rules, cfg) -> tuple:
    """Return (text, GuardResult, tool calls used)."""
    raise NotImplementedError
