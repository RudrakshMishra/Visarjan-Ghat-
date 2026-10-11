import re
from dataclasses import dataclass


@dataclass
class InputCheckResult:
    allowed: bool
    reason: str = ""


SUSPICIOUS_PATTERNS = [
    r"ignore\s+(all\s+)?previous\s+instructions",
    r"ignore\s+(all\s+)?prior\s+instructions",
    r"reveal\s+(the\s+)?system\s+prompt",
    r"show\s+(me\s+)?(the\s+)?system\s+prompt",
    r"(show|give|reveal|tell).*api\s*key",
    r"(show|give|reveal|tell).*api\s*keys",
    r"read\s+(the\s+)?\.env",
    r"access\s+(the\s+)?\.env",
    r"open\s+(the\s+)?\.env",
    r"act\s+as\s+(an?\s+)?administrator",
    r"execute\s+(a\s+)?shell\s+command",
]


def validate_input(question: str) -> InputCheckResult:
    """
    Check whether a user question is safe to send to the LLM.

    This is an initial deterministic security layer.
    It does not replace authentication or authorization.
    """

    if not isinstance(question, str):
        return InputCheckResult(
            allowed=False,
            reason="Input must be text."
        )

    question = question.strip()

    if not question:
        return InputCheckResult(
            allowed=False,
            reason="Question cannot be empty."
        )

    if len(question) > 2000:
        return InputCheckResult(
            allowed=False,
            reason="Question is too long."
        )

    normalized = re.sub(r"\s+", " ", question.lower())

    for pattern in SUSPICIOUS_PATTERNS:
        if re.search(pattern, normalized):
            return InputCheckResult(
                allowed=False,
                reason="Potential prompt injection or sensitive-data request."
            )

    return InputCheckResult(allowed=True)