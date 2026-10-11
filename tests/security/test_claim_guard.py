from app.security.claim_guard import guard_claims


def test_valid_number_is_allowed():
    result = guard_claims(
        "Risk score is 97.",
        allowed_numbers={"97"},
    )

    assert result.ok is True
    assert result.bad_numbers == []


def test_fake_number_is_rejected():
    result = guard_claims(
        "Risk score is 97.",
        allowed_numbers={"42"},
    )

    assert result.ok is False
    assert "97" in result.bad_numbers


def test_multiple_valid_numbers_are_allowed():
    result = guard_claims(
        "The score is 97 and the limit is 100.",
        allowed_numbers={"97", "100"},
    )

    assert result.ok is True


def test_health_claim_is_rejected():
    result = guard_claims(
        "This water is dangerous to humans.",
        allowed_numbers=set(),
    )

    assert result.ok is False
    assert len(result.bad_phrases) > 0


def test_drinking_claim_is_rejected():
    result = guard_claims(
        "This water is safe to drink.",
        allowed_numbers=set(),
    )

    assert result.ok is False


def test_unknown_number_and_health_claim_are_rejected():
    result = guard_claims(
        "The score is 999 and this creates a health risk.",
        allowed_numbers={"97"},
    )

    assert result.ok is False
    assert "999" in result.bad_numbers
    assert len(result.bad_phrases) > 0


def test_decimal_number_is_allowed():
    result = guard_claims(
        "The measured value is 12.5.",
        allowed_numbers={"12.5"},
    )

    assert result.ok is True