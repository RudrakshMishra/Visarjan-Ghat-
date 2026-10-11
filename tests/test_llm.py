"""T13-T17 with a mocked Cerebras client (no network)."""
import copy
import json
import logging
import threading
import time
from types import SimpleNamespace as NS

import pytest

from ghatwatch import llm
from ghatwatch.facts import build_facts


class APIErr(Exception):
    def __init__(self, code):
        super().__init__(f"status {code}")
        self.status_code = code


class FakeClient:
    """Returns queued outputs in order; an Exception item is raised; counts concurrency."""

    def __init__(self, outputs, delay=0.0):
        self.outputs, self.calls, self.delay = list(outputs), [], delay
        self.lock, self.active, self.max_active = threading.Lock(), 0, 0
        self.chat = NS(completions=NS(create=self._create))

    def _create(self, **kw):
        with self.lock:
            self.calls.append(kw)
            self.active += 1
            self.max_active = max(self.max_active, self.active)
            out = self.outputs.pop(0) if self.outputs else self.outputs_last
        try:
            time.sleep(self.delay)
            if isinstance(out, Exception):
                raise out
            content, finish = out if isinstance(out, tuple) else (out, "stop")
            return NS(choices=[NS(message=NS(content=content), finish_reason=finish)])
        finally:
            with self.lock:
                self.active -= 1

    outputs_last = APIErr(500)


@pytest.fixture
def facts(syn, rules, cfg):
    return build_facts(syn, rules, cfg)


@pytest.fixture
def lcfg(cfg, tmp_path):
    c = copy.deepcopy(cfg)
    c["llm"].update(backoff_s=0, cache_path=str(tmp_path / "cache.json"), timeout_s=5)
    return c


def good_json(facts, extra=""):
    g = facts["ghats"][0]
    return json.dumps({"headline": f"{g['site']} needs attention first{extra}",
                       "ghats": [{"site": g["site"], "summary": f"Score {g['score']}.",
                                  "page_refs": [r["page"] for r in g["reasons"] if r["page"]][:1]}],
                       "gaps": ["Some readings are not sampled."], "actions": ["Test DO before immersion."],
                       "limits_note": "Units are assumed."}, ensure_ascii=False)


def test_t13_happy_path(facts, lcfg):
    c = FakeClient([good_json(facts)] * 3)
    text, res, meta = llm.brief_with_guard(facts, "en", lcfg, client=c)
    assert res.ok and meta["source"] == "cerebras" and meta["model"] == lcfg["llm"]["models"]["brief"]
    assert facts["ghats"][0]["site"] in text and meta["seconds"] >= 0
    assert "tools" not in c.calls[0] and c.calls[0]["response_format"]["json_schema"]["strict"] is True
    assert llm.status_badge(meta).startswith("Cerebras, ")


def test_t14_fake_number_repair_then_template(facts, lcfg):
    bad = good_json(facts, " with DO 4.37 mg/l")
    c = FakeClient([bad] * 4)
    text, res, meta = llm.brief_with_guard(facts, "en", lcfg, client=c)
    assert meta["source"] == "template" and res.ok and len(c.calls) == 4  # 3 + 1 repair
    assert "4.37" in str(c.calls[-1]["messages"][-1]["content"])
    assert any(r["bad_numbers"] == ["4.37"] for r in meta["rejected"])
    assert llm.status_badge(meta) == "AI wording unavailable, showing standard text"


def test_t14_repair_succeeds(facts, lcfg):
    c = FakeClient([good_json(facts, " 4.37")] * 3 + [good_json(facts)])
    assert llm.brief_with_guard(facts, "en", lcfg, client=c)[2]["source"] == "cerebras"


def test_t15_429_backoff_then_template(facts, lcfg):
    c = FakeClient([APIErr(429)] * 20)
    text, res, meta = llm.brief_with_guard(facts, "en", lcfg, client=c)
    assert meta["source"] == "template" and len(c.calls) == 3 * (lcfg["llm"]["max_retries"] + 1)


def test_t15_timeout(facts, lcfg):
    lcfg["llm"]["timeout_s"] = 0.2
    c = FakeClient([good_json(facts)] * 3, delay=1.0)
    text, res, meta = llm.brief_with_guard(facts, "en", lcfg, client=c)
    assert meta["source"] == "template" and any(r["reason"] == "timeout" for r in meta["rejected"])


def test_length_and_bad_json(facts, lcfg):
    c = FakeClient([(good_json(facts), "length"), "not json", good_json(facts)])
    meta = llm.brief_with_guard(facts, "en", lcfg, client=c)[2]
    assert meta["source"] == "cerebras" and len(meta["rejected"]) == 2


def test_t16_no_key(facts, lcfg, monkeypatch):
    monkeypatch.delenv("CEREBRAS_API_KEY", raising=False)
    assert llm.get_client(lcfg) is None
    text, res, meta = llm.brief_with_guard(facts, "hi", lcfg)
    assert meta["source"] == "template" and res.ok and llm.status_badge(meta) == "AI off, standard text"


def test_provider_none(lcfg, monkeypatch):
    monkeypatch.setenv("CEREBRAS_API_KEY", "dummy-not-a-key")
    lcfg["llm"]["provider"] = "none"
    monkeypatch.delenv("LLM_PROVIDER", raising=False)
    assert llm.get_client(lcfg) is None


def test_401_is_ai_off(facts, lcfg):
    meta = llm.brief_with_guard(facts, "en", lcfg, client=FakeClient([APIErr(401)] * 3))[2]
    assert llm.status_badge(meta) == "AI off, standard text"


def _walk(s):
    yield s
    for v in s.values() if isinstance(s, dict) else (s if isinstance(s, list) else []):
        if isinstance(v, (dict, list)):
            yield from _walk(v)


def test_t17_schema():
    schema = llm.build_brief_schema(["A", "B"])
    for node in _walk(schema):
        if isinstance(node, dict):
            if node.get("type") == "object":
                assert node.get("additionalProperties") is False
            if node.get("type") == "array":
                assert "items" in node
            assert not {"pattern", "format", "minItems", "maxItems"} & set(node)
    assert schema["properties"]["ghats"]["items"]["properties"]["site"]["enum"] == ["A", "B"]


def test_cache_hit(facts, lcfg):
    llm.brief_with_guard(facts, "en", lcfg, client=FakeClient([good_json(facts)] * 3))
    c2 = FakeClient([])
    meta = llm.brief_with_guard(facts, "en", lcfg, client=c2)[2]
    assert meta.get("cached") and c2.calls == []


def test_concurrency_cap(facts, lcfg):
    c = FakeClient([good_json(facts)] * 3, delay=0.1)
    llm.brief_with_guard(facts, "en", lcfg, client=c)
    assert c.max_active <= lcfg["llm"]["n_candidates"]


def test_key_never_logged(facts, lcfg, monkeypatch, caplog):
    secret = "csk-THISISAFAKEKEYTHATMUSTNOTLEAK123456"
    monkeypatch.setenv("CEREBRAS_API_KEY", secret)
    caplog.set_level(logging.DEBUG)

    class Boom(Exception):
        pass
    c = FakeClient([Boom(secret)] * 3)
    text, res, meta = llm.brief_with_guard(facts, "en", lcfg, client=c)
    assert secret not in caplog.text and secret not in json.dumps(meta) and secret not in text
