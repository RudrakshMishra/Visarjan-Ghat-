import re
from dataclasses import dataclass, field


@dataclass
class GuardResult:
    ok: bool
    numbers_checked: list[str] = field(default_factory=list)
    bad_numbers: list[str] = field(default_factory=list)
    bad_phrases: list[str] = field(default_factory=list)


# Health-related claims that Ghat Watch must not make.
BANNED_PHRASES = [
    "safe to drink",
    "unsafe to drink",
    "safe for drinking",
    "unsafe for drinking",
    "health risk",
    "health hazard",
    "causes disease",
    "causes illness",
    "harmful to humans",
    "dangerous to humans",
    "human health",
    "मानव स्वास्थ्य",
    "स्वास्थ्य के लिए खतरनाक",
]


def _extract_numbers(text: str) -> list[str]:
    """
    Extract numeric values from text.

    Examples:
        97
        12.5
        99.9
    """
    return re.findall(r"\b\d+(?:\.\d+)?\b", text)


def _normalise_number(value: str) -> str:
    """
    Normalise a numeric value so comparisons are consistent.

    Example:
        97.0 -> 97
        12.50 -> 12.5
    """
    try:
        number = float(value)

        if number.is_integer():
            return str(int(number))

        return str(number)
    except ValueError:
        return value


def guard_claims(
    text: str,
    allowed_numbers: set[str] | None = None,
) -> GuardResult:
    """
    Validate an AI-generated claim against trusted numbers.

    Rules:
    1. Every number in the generated text must be present
       in the approved set.
    2. Health-related claims are rejected.
    """

    allowed_numbers = allowed_numbers or set()

    # Normalise the trusted numbers.
    normalised_allowed = {
        _normalise_number(number)
        for number in allowed_numbers
    }

    numbers_found = _extract_numbers(text)

    numbers_checked = [
        _normalise_number(number)
        for number in numbers_found
    ]

    bad_numbers = [
        number
        for number in numbers_checked
        if number not in normalised_allowed
    ]

    lower_text = text.lower()

    bad_phrases = [
        phrase
        for phrase in BANNED_PHRASES
        if phrase.lower() in lower_text
    ]

    ok = not bad_numbers and not bad_phrases

    return GuardResult(
        ok=ok,
        numbers_checked=numbers_checked,
        bad_numbers=bad_numbers,
        bad_phrases=bad_phrases,
    )