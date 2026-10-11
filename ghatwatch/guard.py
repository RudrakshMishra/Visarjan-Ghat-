"""Claim Guard: deterministic number and banned-phrase check on any text (no LLM)."""
from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass, field

_DEVANAGARI = str.maketrans("०१२३४५६७८९", "0123456789")
_URL = re.compile(r"https?://\S+")
_NUM = re.compile(r"[0-9]+(?:\.[0-9]+)?")


@dataclass
class GuardResult:
    ok: bool
    numbers_checked: int
    bad_numbers: list = field(default_factory=list)
    bad_phrases: list = field(default_factory=list)


def normalize_text(text: str) -> str:
    """NFC-normalise, map Devanagari digits to ASCII, drop URLs."""
    t = unicodedata.normalize("NFC", text).translate(_DEVANAGARI)
    return _URL.sub(" ", t)


def extract_numbers(text: str, strip: tuple[str, ...] = ()) -> list[str]:
    """Numeric tokens in text after normalisation and removing known names (e.g. site names)."""
    t = normalize_text(text)
    for name in sorted(strip, key=len, reverse=True):
        t = t.replace(name, " ")
    return _NUM.findall(t)


def find_banned(text: str, cfg: dict) -> list[str]:
    """Banned phrases present (EN on word boundaries, HI as NFC substrings)."""
    t = unicodedata.normalize("NFC", text).casefold()
    hits = []
    for p in cfg["banned_phrases"].get("en", []):
        if re.search(r"\b" + re.escape(p.casefold()) + r"\b", t):
            hits.append(p)
    for p in cfg["banned_phrases"].get("hi", []):
        if unicodedata.normalize("NFC", p) in t:
            hits.append(p)
    return hits


def guard(text: str, facts: dict, cfg, extra_allowed: set[str] = frozenset()) -> GuardResult:
    """Check every number in text against facts.allowed_numbers (+ extra) and scan banned phrases."""
    allowed = {float(a) for a in list(facts.get("allowed_numbers", [])) + list(extra_allowed)}
    sites = tuple(g["site"] for g in facts.get("ghats", []))
    nums = extract_numbers(text, sites)
    bad = sorted({n for n in nums if float(n) not in allowed}, key=float)
    phrases = find_banned(text, cfg)
    return GuardResult(ok=not bad and not phrases, numbers_checked=len(nums),
                       bad_numbers=bad, bad_phrases=phrases)


def guard_badge(result: GuardResult) -> str:
    """UI badge text, e.g. '12 numbers verified against data, 0 health claims'."""
    if not result.ok:
        return (f"Check failed: {len(result.bad_numbers)} unverified numbers, "
                f"{len(result.bad_phrases)} blocked phrases")
    return f"{result.numbers_checked} numbers verified against data, 0 health claims"
