"""T18, T19 and the deterministic fallback."""
import json
from types import SimpleNamespace as NS

from ghatwatch.askdata import TOOLS, answer, run_tool
from ghatwatch.guard import extract_numbers


def test_tools_spec():
    assert [t["function"]["name"] for t in TOOLS] == ["get_ranking", "get_ghat_summary", "compare_years",
                                                      "list_missing", "get_evidence"]


def test_t18_tool_numbers_from_data(syn, rules, cfg):
    res = run_tool("compare_years", {"site": "Ghat A", "parameter": "BOD"}, syn, rules, cfg)
    vals = {float(v) for v in syn[(syn["site"] == "Ghat A") & (syn["parameter"] == "BOD")]["value_as_printed"]}
    assert {float(r["value_as_printed"]) for r in res["result"]} <= vals
    for name, args in [("get_ranking", {}), ("get_ghat_summary", {"site": "Ghat A"}),
                       ("compare_years", {"site": "Ghat A", "parameter": "BOD"}), ("list_missing", {"site": "Ghat C"}),
                       ("get_evidence", {"site": "Ghat A", "parameter": "BOD", "year": 2025,
                                         "festival": "Ganesh", "phase": "during"})]:
        out = run_tool(name, args, syn, rules, cfg)
        assert "source_page" in out and "url" in out


def test_unknown_site_structured(syn, rules, cfg):
    assert run_tool("get_ghat_summary", {"site": "Atlantis"}, syn, rules, cfg)["result"] == "not in the data"
    assert run_tool("compare_years", {"site": "Ghat A", "parameter": "Mercury"}, syn, rules, cfg)["result"] == "not in the data"


def test_fallback_answers(syn, rules, cfg, monkeypatch):
    monkeypatch.delenv("CEREBRAS_API_KEY", raising=False)
    for q in ["Which ghats have the highest risk?", "Which ghats have no baseline reading?",
              "How did Ghat A's BOD change?", "Ghat C ka DO kitna tha?", "Ghat A का pH क्या था?"]:
        text, res, calls = answer(q, syn, rules, cfg)
        assert res.ok and text and calls, q
    text, _, calls = answer("Ghat C ka DO kitna tha?", syn, rules, cfg)
    assert calls[0]["name"] == "compare_years" and "page" in text


class ToolClient:
    def __init__(self, final):
        self.final, self.n = final, 0
        self.chat = NS(completions=NS(create=self._create))

    def _create(self, **kw):
        assert "response_format" not in kw and kw["tools"]
        self.n += 1
        if self.n == 1:
            tc = NS(id="t1", function=NS(name="compare_years", arguments=json.dumps({"site": "Ghat A", "parameter": "BOD"})))
            return NS(choices=[NS(message=NS(content="", tool_calls=[tc]))])
        return NS(choices=[NS(message=NS(content=self.final, tool_calls=None))])


def test_model_answer_passes(syn, rules, cfg):
    text, res, calls = answer("BOD at Ghat A?", syn, rules, cfg, client=ToolClient("BOD was 12.0 in Ganesh 2025 (page 11)."))
    assert res.ok and text.startswith("BOD was 12.0") and calls[0]["source"] == "model"


def test_t19_injected_number_rejected(syn, rules, cfg):
    text, res, calls = answer("BOD at Ghat A?", syn, rules, cfg, client=ToolClient("BOD was 77.7 mg/l."))
    assert "77.7" not in extract_numbers(text) and calls[-1]["source"] == "fallback"
