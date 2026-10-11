"""Secrets stay out of the repo and the app has no login (PRD A11, plan rules 6 and 8)."""
import re
import subprocess
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]

# Patterns are written so this file does not match itself.
SECRET_PATTERNS = {
    "Cerebras key": re.compile(r"csk-[A-Za-z0-9]{20,}"),
    "hardcoded CEREBRAS_API_KEY": re.compile(r"CEREBRAS_API_KEY[ \t]*[=:][ \t]*['\"]?[A-Za-z0-9]{10,}"),
    "private key": re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----"),
    "hardcoded password": re.compile(r"password[ \t]*==[ \t]*['\"]", re.I),
}


def git(*args):
    return subprocess.run(["git", *args], cwd=ROOT, capture_output=True, text=True)


def committable_files():
    for name in git("ls-files", "--cached", "--others", "--exclude-standard").stdout.splitlines():
        path = ROOT / name
        if path.is_file():
            try:
                yield name, path.read_text(encoding="utf-8")
            except UnicodeDecodeError:
                continue


def test_no_secrets_in_committable_files():
    leaks = [f"{name}: {label}" for name, text in committable_files()
             for label, pattern in SECRET_PATTERNS.items() if pattern.search(text)]
    assert leaks == []


@pytest.mark.parametrize("path", [".env", ".env.local", ".streamlit/secrets.toml", "server.pem", "private.key"])
def test_secret_files_are_ignored(path):
    assert git("check-ignore", "-q", path).returncode == 0


def test_env_example_is_committed_without_values():
    assert git("check-ignore", "-q", ".env.example").returncode == 1
    values = dict(line.split("=", 1) for line in (ROOT / ".env.example").read_text().splitlines()
                  if "=" in line and not line.startswith("#"))
    assert values["CEREBRAS_API_KEY"] == ""


def test_app_has_no_login():
    src = (ROOT / "app.py").read_text(encoding="utf-8")
    assert 'type="password"' not in src and "authenticated" not in src
