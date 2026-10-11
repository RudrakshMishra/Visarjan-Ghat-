def check_output(text: str) -> str:
    """Checks output for prohibited content like health-effect claims."""
    # This is a basic placeholder for Claim Guard
    prohibited = ["safe to drink", "healthy", "water is safe", "no danger", "safe for"]
    for p in prohibited:
        if p.lower() in text.lower():
            return "[REDACTED: Prohibited claim]"
    return text
