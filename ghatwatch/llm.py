"""Optional Cerebras layer: guarded brief wording with template fallback. Never raises to callers."""
from __future__ import annotations

import concurrent.futures as cf
import hashlib
import json
import logging
import os
import time
from pathlib import Path

from ghatwatch.brief import render_brief
from ghatwatch.guard import GuardResult, guard

log = logging.getLogger(__name__)

SYSTEM_BRIEF = ("Rewrite this water-quality brief for a municipal officer in plain words, in {language}. "
                "Use only the facts given. Keep every number exactly as written. Add no numbers, "
                "no causes and no health claims. If something is not in the facts, do not mention it. "
                "Keep technical terms DO, BOD, pH and CPCB in English letters.")
_HEAD = {"en": ("Top ghats", "Data gaps", "Suggested actions", "What this does not tell you", "pages"),
         "hi": ("सबसे अधिक जोखिम वाले घाट", "आँकड़ों की कमी", "सुझाए गए कदम", "यह रिपोर्ट क्या नहीं बताती", "पेज"),
         "hng": ("Sabse zyada risk wale ghat", "Data gaps", "Suggested actions", "Yeh report kya nahi batati", "pages")}


class CandidateError(Exception):
    """A candidate failed in a recoverable way (bad JSON, length cut-off, guard reject)."""


def _api_key() -> str | None:
    key = os.environ.get("CEREBRAS_API_KEY")
    if key:
        return key
    try:
        import streamlit as st  # optional fallback, guarded (rule 7)
        return st.secrets.get("CEREBRAS_API_KEY")
    except Exception:  # ImportError, missing secrets file, etc.
        return None


def get_client(cfg):
    """Return a Cerebras client, or None if provider is 'none', there is no key, or the SDK is missing."""
    llm = cfg["llm"]
    provider = os.environ.get("LLM_PROVIDER", llm.get("provider", "cerebras"))
    if provider == "none":
        return None
    key = _api_key()
    if not key:
        return None
    try:
        from cerebras.cloud.sdk import Cerebras
        return Cerebras(api_key=key, timeout=llm["timeout_s"], max_retries=0)
    except Exception as e:
        log.warning("Cerebras client unavailable: %s", type(e).__name__)
        return None


def build_brief_schema(site_names: list[str]) -> dict:
    """Strict JSON schema for the brief (TRD 7.2), site enum filled at runtime."""
    ghat = {"type": "object", "properties": {
        "site": {"type": "string", "enum": list(site_names)},
        "summary": {"type": "string"},
        "page_refs": {"type": "array", "items": {"type": "integer"}}},
        "required": ["site", "summary", "page_refs"], "additionalProperties": False}
    return {"type": "object", "properties": {
        "headline": {"type": "string"}, "ghats": {"type": "array", "items": ghat},
        "gaps": {"type": "array", "items": {"type": "string"}},
        "actions": {"type": "array", "items": {"type": "string"}},
        "limits_note": {"type": "string"}},
        "required": ["headline", "ghats", "gaps", "actions", "limits_note"], "additionalProperties": False}


def render_ai(obj: dict, lang: str) -> str:
    """Render a schema-valid brief JSON into the template layout."""
    top, gaps, acts, limits, pages = _HEAD[lang]
    lines = [f"# {obj['headline']}", "", f"## {top}"]
    for g in obj["ghats"]:
        ref = f" [{pages} {', '.join(str(p) for p in g['page_refs'])}]" if g["page_refs"] else ""
        lines.append(f"- **{g['site']}**: {g['summary']}{ref}")
    lines += ["", f"## {gaps}"] + [f"- {x}" for x in obj["gaps"]]
    lines += ["", f"## {acts}"] + [f"- {x}" for x in obj["actions"]]
    lines += ["", f"## {limits}", f"- {obj['limits_note']}"]
    return "\n".join(lines) + "\n"


def status_badge(meta: dict) -> str:
    """'Cerebras, <model>, 1.2 s' or 'AI off, standard text'."""
    if meta.get("source") == "cerebras":
        return f"Cerebras, {meta['model']}, {meta['seconds']:.1f} s"
    if meta.get("note") == "ai_unavailable":
        return "AI wording unavailable, showing standard text"
    return "AI off, standard text"


def _status(e: Exception) -> int | None:
    code = getattr(e, "status_code", None)
    if code is None and getattr(e, "response", None) is not None:
        code = getattr(e.response, "status_code", None)
    return code


def call_with_retry(fn, cfg):
    """Call fn(); retry 429/5xx with exponential backoff up to max_retries. Other errors propagate."""
    llm = cfg["llm"]
    for attempt in range(llm["max_retries"] + 1):
        try:
            return fn()
        except Exception as e:
            code = _status(e)
            if (code == 429 or (code or 0) >= 500) and attempt < llm["max_retries"]:
                time.sleep(llm.get("backoff_s", 1.0) * 2 ** attempt)
                continue
            raise


def _candidate(client, model, messages, schema, cfg, lang, facts):
    """One structured-output request -> (text, GuardResult). Raises on any failure."""
    def go():
        return client.chat.completions.create(
            model=model, messages=messages, temperature=cfg["llm"]["temperature"],
            response_format={"type": "json_schema",
                             "json_schema": {"name": "brief", "strict": True, "schema": schema}})
    resp = call_with_retry(go, cfg)
    choice = resp.choices[0]
    if getattr(choice, "finish_reason", None) == "length":
        raise CandidateError("finish_reason=length")
    try:
        obj = json.loads(choice.message.content)
        text = render_ai(obj, lang)
    except (ValueError, KeyError, TypeError) as e:
        raise CandidateError(f"unparsable: {type(e).__name__}") from None
    return text, guard(text, facts, cfg)


def _cache_key(facts, lang, model, cfg) -> str:
    blob = json.dumps([facts, lang, model, cfg["llm"].get("prompt_version", 1)], sort_keys=True, ensure_ascii=False)
    return hashlib.sha256(blob.encode("utf-8")).hexdigest()


def _cache_load(cfg) -> dict:
    p = Path(cfg["llm"].get("cache_path", ".cache/llm_cache.json"))
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {}


def _cache_save(cfg, key: str, text: str) -> None:
    p = Path(cfg["llm"].get("cache_path", ".cache/llm_cache.json"))
    try:
        data = _cache_load(cfg)
        data[key] = text
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
    except OSError as e:
        log.warning("LLM cache not written: %s", type(e).__name__)


def brief_with_guard(facts: dict, lang: str, cfg, client=None) -> tuple[str, GuardResult, dict]:
    """Best-of-N Cerebras brief that passes the guard; else one repair; else template. Never raises."""
    t0 = time.monotonic()
    model = cfg["llm"]["models"]["brief"]
    meta = {"source": "template", "model": None, "seconds": 0.0, "candidates_tried": 0, "rejected": []}

    def fallback(note: str | None):
        text = render_brief(facts, lang)
        meta.update(seconds=time.monotonic() - t0, note=note)
        return text, guard(text, facts, cfg), meta

    try:
        client = client or get_client(cfg)
        if client is None:
            return fallback(None)
        key = _cache_key(facts, lang, model, cfg)
        if cfg["llm"].get("cache") and key in (cache := _cache_load(cfg)):
            text = cache[key]
            res = guard(text, facts, cfg)
            if res.ok:
                meta.update(source="cerebras", model=model, cached=True, seconds=time.monotonic() - t0)
                return text, res, meta
        schema = build_brief_schema([g["site"] for g in facts["ghats"]])
        base = [{"role": "system", "content": SYSTEM_BRIEF.format(language={"hi": "Hindi", "hng": "Hinglish", "en": "English"}.get(lang, "English"))},
                {"role": "user", "content": "FACTS:\n" + json.dumps(facts, ensure_ascii=False)
                 + "\n\nSTANDARD TEXT:\n" + render_brief(facts, lang)}]
        n = int(cfg["llm"]["n_candidates"])
        winner, fatal, auth = None, False, False
        ex = cf.ThreadPoolExecutor(max_workers=n)
        try:
            futs = [ex.submit(_candidate, client, model, base, schema, cfg, lang, facts) for _ in range(n)]
            cf.wait(futs, timeout=cfg["llm"]["timeout_s"])
            for f in futs:  # submission order: deterministic choice of "first passing"
                meta["candidates_tried"] += 1
                if not f.done():
                    meta["rejected"].append({"reason": "timeout", "bad_numbers": [], "bad_phrases": []})
                    continue
                err = f.exception()
                if err is not None:
                    code = _status(err)
                    fatal |= code in (401, 403, 404)
                    auth |= code in (401, 403)
                    meta["rejected"].append({"reason": f"{type(err).__name__}{f' {code}' if code else ''}",
                                             "bad_numbers": [], "bad_phrases": []})
                    continue
                text, res = f.result()
                if res.ok and winner is None:
                    winner = (text, res)
                elif not res.ok:
                    meta["rejected"].append({"reason": "guard", "bad_numbers": res.bad_numbers,
                                             "bad_phrases": res.bad_phrases})
        finally:
            ex.shutdown(wait=False, cancel_futures=True)
        if winner is None and not fatal:
            bad = [r for r in meta["rejected"] if r["reason"] == "guard"]
            if bad:
                fix = ("Your previous answer was rejected. Remove these numbers that are not in the facts: "
                       f"{sorted({n for r in bad for n in r['bad_numbers']})}; and these phrases: "
                       f"{sorted({p for r in bad for p in r['bad_phrases']})}.")
                meta["candidates_tried"] += 1
                try:
                    text, res = _candidate(client, model, base + [{"role": "user", "content": fix}],
                                           schema, cfg, lang, facts)
                    if res.ok:
                        winner = (text, res)
                    else:
                        meta["rejected"].append({"reason": "guard (repair)", "bad_numbers": res.bad_numbers,
                                                 "bad_phrases": res.bad_phrases})
                except Exception as e:
                    meta["rejected"].append({"reason": f"repair {type(e).__name__}", "bad_numbers": [],
                                             "bad_phrases": []})
        if winner is None:
            if fatal:
                log.warning("Cerebras auth/model error; using template (check key or model ID in config)")
            return fallback(None if auth else "ai_unavailable")
        if cfg["llm"].get("cache"):
            _cache_save(cfg, key, winner[0])
        meta.update(source="cerebras", model=model, seconds=time.monotonic() - t0)
        return winner[0], winner[1], meta
    except Exception as e:  # never raise to the UI
        log.warning("AI brief failed: %s", type(e).__name__)
        return fallback("ai_unavailable")
