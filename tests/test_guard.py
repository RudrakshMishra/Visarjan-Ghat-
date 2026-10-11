"""T9 Claim Guard, facts schema, template briefs pass their own guard."""
import json
import re

import pytest

from ghatwatch.brief import render_brief, to_html, to_whatsapp_text
from ghatwatch.facts import TEXT_KEYS, build_facts, fmt_num
from ghatwatch.guard import extract_numbers, guard, guard_badge


@pytest.fixture
def facts(syn, rules, cfg):
    return build_facts(syn, rules, cfg)


def test_fmt_num():
    assert [fmt_num(x) for x in (5, 5.0, 0.0, 3.25, 61.234, 2025)] == ["5", "5.0", "0.0", "3.25", "61.23", "2025"]


def test_facts_schema(facts):
    for k in ("generated_for", "class", "ghats", "allowed_numbers", "gaps", "limits_panel"):
        assert k in facts
    g = facts["ghats"][0]
    assert {"site", "rank", "score", "confidence", "tags", "reasons"} <= set(g)
    for gh in facts["ghats"]:
        for r in gh["reasons"]:
            assert r["text_key"] in TEXT_KEYS and "page" in r
            if r["text_key"].endswith(("limit", "zero", "range")):
                assert r["page"] is not None
    json.dumps(facts)  # serialisable


def test_limits_panel(facts):
    text = " ".join(facts["limits_panel"])
    assert "Kamla Park" in text and "four metals" in text and "Units" in text
    assert "Ghat B has no Durga 2025 table" in text


@pytest.mark.parametrize("lang", ["en", "hi"])
def test_template_passes_guard(facts, cfg, lang):
    text = render_brief(facts, lang)
    res = guard(text, facts, cfg)
    assert res.ok, (res.bad_numbers, res.bad_phrases)
    assert res.numbers_checked > 10
    assert len(text.splitlines()) < 60  # one page


@pytest.mark.parametrize("lang", ["en", "hi"])
def test_every_number_allowed(facts, lang):
    allowed = {float(a) for a in facts["allowed_numbers"]}
    nums = extract_numbers(render_brief(facts, lang), tuple(g["site"] for g in facts["ghats"]))
    assert all(float(n) in allowed for n in nums)


def test_t9_fake_number_fails(facts, cfg):
    text = render_brief(facts, "en") + "\nDO fell to 4.37 mg/l."
    res = guard(text, facts, cfg)
    assert not res.ok and res.bad_numbers == ["4.37"]


def test_t9_devanagari_digit(facts, cfg):
    res = guard("DO ४.३७ mg/l था", facts, cfg)
    assert res.bad_numbers == ["4.37"]


def test_numeric_match_and_ranges(facts, cfg):
    assert guard("limit 5.0 and 5, years 2024-25", facts, cfg).ok
    assert guard("see https://x.org/r-9999.pdf#page=777", facts, cfg).ok
    assert guard("Ghat A ranks", facts, cfg).ok


@pytest.mark.parametrize("text", ["The drop was caused by idols.", "This is a health risk.",
                                  "Water is clean here.", "इससे बीमारी फैलती है", "मूर्तियों के कारण DO गिरा"])
def test_t9_health_phrases(facts, cfg, text):
    assert guard(text, facts, cfg).bad_phrases


def test_no_false_positive(facts, cfg):
    assert guard("Plan cleaning after the event window; सफ़ाई की योजना", facts, cfg).ok


def test_extra_allowed(facts, cfg):
    assert guard("value 9.99", facts, cfg, extra_allowed={"9.99"}).ok


def test_badge(facts, cfg):
    assert re.fullmatch(r"\d+ numbers verified against data, 0 health claims",
                        guard_badge(guard(render_brief(facts, "en"), facts, cfg)))


def test_exports(facts, cfg):
    html = to_html(facts, "hi")
    assert "Noto Sans Devanagari" in html and "<script" not in html and "http" not in html.split("</style>")[0]
    wa = to_whatsapp_text(facts, "en")
    assert "#" not in wa and guard(wa, facts, cfg).ok


def test_stub_fixture_schema():
    stub = json.load(open("tests/fixtures/facts_stub.json", encoding="utf-8"))
    assert {"generated_for", "class", "ghats", "allowed_numbers", "gaps", "limits_panel"} <= set(stub)
