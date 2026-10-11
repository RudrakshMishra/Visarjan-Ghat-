"""Ask-the-data: five dataset-only tools, a Cerebras tool loop, and a deterministic fallback."""
from __future__ import annotations

import json
import logging
import re
import time

import pandas as pd

from ghatwatch.coverage import coverage_matrix
from ghatwatch.evidence import evidence_for, report_url
from ghatwatch.facts import build_facts
from ghatwatch.guard import GuardResult, extract_numbers, guard
from ghatwatch.loader import MEASURED

log = logging.getLogger(__name__)
SYSTEM_ASK = ("Answer the officer's question only from the tool results. Cite the year and report page for "
              "every number. If a tool returns nothing or 'not in the data', say 'not in the data'. "
              "No causes, no health claims. Answer in the language of the question.")


def _fn(name, desc, props=None, req=()):
    return {"type": "function", "function": {"name": name, "description": desc, "parameters": {
        "type": "object", "properties": props or {}, "required": list(req), "additionalProperties": False}}}


_S, _P = {"site": {"type": "string"}}, {"parameter": {"type": "string"}}
TOOLS: list[dict] = [
    _fn("get_ranking", "Risk ranking of all ghats with score, confidence, tags and evidence pages."),
    _fn("get_ghat_summary", "Summary of one ghat: rank, score, reasons with pages.", _S, ["site"]),
    _fn("compare_years", "All readings of one parameter at one ghat across years.", {**_S, **_P}, ["site", "parameter"]),
    _fn("list_missing", "Readings that are not sampled or tables that are absent for one ghat.", _S, ["site"]),
    _fn("get_evidence", "Exact report evidence for one reading.",
        {**_S, **_P, "year": {"type": "integer"}, "festival": {"type": "string"}, "phase": {"type": "string"}},
        ["site", "parameter", "year", "festival", "phase"]),
]


def _not_in_data(what: str) -> dict:
    return {"result": "not in the data", "detail": what, "source_page": None, "url": None}


def run_tool(name: str, args: dict, df, rules, cfg, facts: dict | None = None) -> dict:
    """Run one dataset-only tool; every result carries source_page and url (or 'not in the data')."""
    sites = set(df["site"].unique())
    site = args.get("site")
    if "site" in args and site not in sites:
        return _not_in_data(f"unknown site {site!r}; known: {sorted(sites)}")
    if "parameter" in args and args["parameter"] not in set(df["parameter"].unique()):
        return _not_in_data(f"unknown parameter {args['parameter']!r}")
    facts = facts or build_facts(df, rules, cfg)
    if name in ("get_ranking", "get_ghat_summary"):
        gs = [g for g in facts["ghats"] if name == "get_ranking" or g["site"] == site]
        out = [{"site": g["site"], "rank": g["rank"], "score": g["score"], "confidence": g["confidence"],
                "tags": g["tags"], "reasons": [
                    {**r, "url": f"{report_url(r['year_report'], cfg)}#page={r['page']}" if r["page"] else None}
                    for r in g["reasons"]]} for g in gs]
        pages = [r["page"] for g in out for r in g["reasons"] if r["page"]]
        return {"result": out, "source_page": pages[0] if pages else None,
                "url": next((r["url"] for g in out for r in g["reasons"] if r["url"]), None)}
    if name == "compare_years":
        g = df[(df["site"] == site) & (df["parameter"] == args["parameter"])].sort_values(["year", "festival", "phase"])
        if g.empty:
            return _not_in_data(f"no {args['parameter']} readings for {site}")
        rows = [{**evidence_for(r, cfg), "status": r["status"]} for _, r in g.iterrows()]
        return {"result": rows, "source_page": rows[0]["page"], "url": rows[0]["url"]}
    if name == "list_missing":
        cov = coverage_matrix(df[df["site"] == site], params=tuple(rules),
                              festivals=cfg.get("festivals"), years=cfg.get("years"))
        miss = cov[cov["status"] != MEASURED]
        rows = miss.to_dict("records")
        return {"result": rows or "nothing missing", "source_page": None,
                "url": report_url(max(cfg["report_urls"]), cfg)}
    if name == "get_evidence":
        g = df[(df["site"] == site) & (df["parameter"] == args["parameter"]) & (df["year"] == int(args["year"]))
               & (df["festival"] == str(args["festival"]).title()) & (df["phase"] == str(args["phase"]).lower())]
        if g.empty:
            return _not_in_data("no such reading")
        ev = evidence_for(g.iloc[0], cfg)
        return {"result": {**ev, "status": g.iloc[0]["status"]}, "source_page": ev["page"], "url": ev["url"]}
    return _not_in_data(f"unknown tool {name!r}")


_PARAM_WORDS = {"Dissolved oxygen": ("do", "oxygen", "ऑक्सीजन"), "BOD": ("bod",), "pH": ("ph",)}


def _route(question: str, df) -> tuple[str, dict]:
    """Keyword router (EN/HI/Hinglish) used when the model is off or fails."""
    q = question.lower()
    words = set(re.findall(r"[\w]+", q))
    site = next((s for s in sorted(df["site"].unique())
                 if re.findall(r"\w+", s.lower())[0] in words or s.lower() in q), None)
    param = next((p for p, ws in _PARAM_WORDS.items() if words & set(ws)), None)
    if site and param:
        return "compare_years", {"site": site, "parameter": param}
    if site and re.search(r"missing|not sampled|gap|kami|नहीं|कमी|baseline", q):
        return "list_missing", {"site": site}
    if site:
        return "get_ghat_summary", {"site": site}
    return "get_ranking", {}


def _fallback_text(question: str, name: str, res: dict) -> str:
    hi = bool(re.search(r"[ऀ-ॿ]", question))
    page_w, rep = ("पेज", "रिपोर्ट") if hi else ("page", "report")
    r = res["result"]
    if r == "not in the data":
        return "यह आँकड़ों में नहीं है।" if hi else "Not in the data."
    if name == "compare_years":
        parts = [f"{x['festival']} {x['year']} {x['phase']}: {x['value_as_printed']} [{x['year']} {rep}, {page_w} {x['page']}]"
                 for x in r]
        return f"{r[0]['site']}, {r[0]['parameter']}: " + "; ".join(parts)
    if name == "list_missing":
        if isinstance(r, str):
            return "कोई माप छूटा नहीं।" if hi else "Nothing missing."
        parts = [f"{x['festival']} {x['year']} {x['phase']} {x['parameter']} ({x['status']})" for x in r]
        return ("छूटे हुए माप: " if hi else "Missing: ") + "; ".join(parts)
    lines = []
    want_nb = "baseline" in question.lower()
    for g in r:
        if want_nb and "No baseline" not in g["tags"]:
            continue
        cite = next((f" [{x['year_report']} {rep}, {page_w} {x['page']}]" for x in g["reasons"] if x["page"]), "")
        lines.append(f"{g['rank']}. {g['site']}: score {g['score']}, {g['confidence']}{cite}")
    return "\n".join(lines) or ("यह आँकड़ों में नहीं है।" if hi else "Not in the data.")


def _numbers_in(results: list) -> set[str]:
    return set(extract_numbers(json.dumps(results, ensure_ascii=False, default=str)))


def answer(question: str, df, rules, cfg, client=None) -> tuple[str, GuardResult, list[dict]]:
    """Tool-calling answer (tools only, never response_format) guarded; deterministic fallback."""
    facts = build_facts(df, rules, cfg)
    calls: list[dict] = []

    def fallback():
        name, args = _route(question, df)
        res = run_tool(name, args, df, rules, cfg, facts)
        calls.append({"name": name, "args": args, "result": res, "source": "fallback"})
        text = _fallback_text(question, name, res)
        return text, guard(text, facts, cfg, _numbers_in([c["result"] for c in calls])), calls

    try:
        if client is None:
            from ghatwatch.llm import get_client
            client = get_client(cfg)
        if client is None:
            return fallback()
        llm, t0 = cfg["llm"], time.monotonic()
        msgs = [{"role": "system", "content": SYSTEM_ASK}, {"role": "user", "content": question}]
        for _ in range(llm["max_tool_rounds"]):
            if time.monotonic() - t0 > llm.get("ask_timeout_s", 25):
                break
            msg = client.chat.completions.create(model=llm["models"]["ask"], messages=msgs, tools=TOOLS,
                                                 temperature=0).choices[0].message
            tcs = getattr(msg, "tool_calls", None) or []
            if not tcs:
                text = msg.content or ""
                res = guard(text, facts, cfg, _numbers_in([c["result"] for c in calls]))
                if res.ok and text.strip():
                    return text, res, calls
                log.info("ask answer rejected by guard: %s %s", res.bad_numbers, res.bad_phrases)
                break
            msgs.append({"role": "assistant", "content": msg.content or "", "tool_calls": [
                {"id": t.id, "type": "function", "function": {"name": t.function.name,
                                                              "arguments": t.function.arguments}} for t in tcs]})
            for t in tcs:
                try:
                    args = json.loads(t.function.arguments or "{}")
                    out = run_tool(t.function.name, args, df, rules, cfg, facts)
                except (ValueError, TypeError, KeyError):
                    args, out = {}, _not_in_data("bad tool arguments")
                calls.append({"name": t.function.name, "args": args, "result": out, "source": "model"})
                msgs.append({"role": "tool", "tool_call_id": t.id,
                             "content": json.dumps(out, ensure_ascii=False, default=str)})
    except Exception as e:  # never raise to the UI
        log.warning("ask-the-data failed: %s", type(e).__name__)
    return fallback()
