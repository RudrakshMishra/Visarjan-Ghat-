import pytest
from types import SimpleNamespace

from app.security import auth


def set_valid_env(monkeypatch):
    monkeypatch.setenv("CLERK_SECRET_KEY", "sk_test_dummy")
    monkeypatch.setenv("CLERK_PUBLISHABLE_KEY", "pk_test_dummy")
    monkeypatch.setenv(
        "CLERK_AUTHORIZED_PARTIES",
        "http://localhost:3000"
    )


def test_missing_clerk_keys(monkeypatch):
    monkeypatch.delenv("CLERK_SECRET_KEY", raising=False)
    monkeypatch.delenv("CLERK_JWT_KEY", raising=False)
    monkeypatch.setenv("CLERK_PUBLISHABLE_KEY", "pk_test_dummy")
    monkeypatch.setenv(
        "CLERK_AUTHORIZED_PARTIES",
        "http://localhost:3000"
    )

    with pytest.raises(RuntimeError):
        auth.authenticate_user(SimpleNamespace(headers={}))


def test_missing_publishable_key(monkeypatch):
    monkeypatch.setenv("CLERK_SECRET_KEY", "sk_test_dummy")
    monkeypatch.delenv("CLERK_PUBLISHABLE_KEY", raising=False)
    monkeypatch.setenv(
        "CLERK_AUTHORIZED_PARTIES",
        "http://localhost:3000"
    )

    with pytest.raises(RuntimeError):
        auth.authenticate_user(SimpleNamespace(headers={}))


def test_missing_authorized_parties(monkeypatch):
    monkeypatch.setenv("CLERK_SECRET_KEY", "sk_test_dummy")
    monkeypatch.setenv("CLERK_PUBLISHABLE_KEY", "pk_test_dummy")
    monkeypatch.delenv("CLERK_AUTHORIZED_PARTIES", raising=False)

    with pytest.raises(RuntimeError):
        auth.authenticate_user(SimpleNamespace(headers={}))


def test_unauthenticated_user(monkeypatch):
    set_valid_env(monkeypatch)

    fake_state = SimpleNamespace(is_authenticated=False)

    monkeypatch.setattr(
        auth,
        "authenticate_request",
        lambda request, options: fake_state,
    )

    with pytest.raises(PermissionError):
        auth.authenticate_user(SimpleNamespace(headers={}))


def test_authenticated_user(monkeypatch):
    set_valid_env(monkeypatch)

    fake_state = SimpleNamespace(is_authenticated=True)

    monkeypatch.setattr(
        auth,
        "authenticate_request",
        lambda request, options: fake_state,
    )

    result = auth.authenticate_user(SimpleNamespace(headers={}))

    assert result is fake_state