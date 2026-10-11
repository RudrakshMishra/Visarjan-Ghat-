"""Render EN/HI briefs, WhatsApp text and printable HTML from facts (template mode)."""
from __future__ import annotations

import html
import re
from pathlib import Path

from jinja2 import Environment, FileSystemLoader, StrictUndefined

from ghatwatch.facts import fmt_num

LANGS = ("en", "hi", "hng")
_ENV = Environment(loader=FileSystemLoader(str(Path(__file__).resolve().parents[1] / "templates")),
                   autoescape=False, trim_blocks=True, lstrip_blocks=True, undefined=StrictUndefined)
_ENV.filters["num"] = lambda x: "" if x is None else fmt_num(x)


def render_brief(facts: dict, lang: str, mode: str = "template") -> str:
    """Render the brief in 'en', 'hi', or 'hng'."""
    if lang not in LANGS:
        raise ValueError(f"lang must be one of {LANGS}, got {lang!r}")
    if mode == "ai":
        from ghatwatch.config import load_config
        from ghatwatch.llm import brief_with_guard
        return brief_with_guard(facts, lang, load_config())[0]
    if mode != "template":
        raise ValueError(f"unknown mode {mode!r}")

    # For hng (hinglish), fallback to English template if not specifically provided
    template_lang = "hi" if lang == "hi" else "en"

    top = facts["ghats"][: facts["n_top"]]
    text = _ENV.get_template(f"brief_{template_lang}.md.j2").render(f=facts, top=top)
    return re.sub(r"\n{3,}", "\n\n", text).strip() + "\n"


def to_whatsapp_text(facts: dict, lang: str) -> str:
    """Plain text for WhatsApp: WhatsApp bold (*x*), no markdown headings."""
    md = render_brief(facts, lang)
    md = re.sub(r"^#+\s*(.+)$", r"*\1*", md, flags=re.M)
    return md.replace("**", "*")


def md_to_html(md: str) -> str:
    """Tiny markdown subset (#, ##, -, **bold**) to HTML."""
    out, in_list = [], False
    for line in md.splitlines():
        esc = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", html.escape(line))
        if line.startswith("- "):
            if not in_list:
                out.append("<ul>")
                in_list = True
            out.append(f"<li>{esc[2:]}</li>")
            continue
        if in_list:
            out.append("</ul>")
            in_list = False
        if line.startswith("## "):
            out.append(f"<h2>{esc[3:]}</h2>")
        elif line.startswith("# "):
            out.append(f"<h1>{esc[2:]}</h1>")
        elif line.strip():
            out.append(f"<p>{esc}</p>")
    if in_list:
        out.append("</ul>")
    return "\n".join(out)


def to_html(facts: dict, lang: str) -> str:
    """Self-contained one-page printable HTML (inline CSS, Devanagari font stack, no assets)."""
    body = md_to_html(render_brief(facts, lang))
    css = ("@page{size:A4;margin:12mm}body{font-family:'Noto Sans Devanagari','Nirmala UI','Mangal',"
           "Arial,sans-serif;font-size:11pt;line-height:1.35;max-width:180mm;margin:auto}"
           "h1{font-size:15pt;margin:0 0 4px}h2{font-size:12pt;margin:10px 0 2px}"
           "ul{margin:2px 0;padding-left:18px}p{margin:3px 0}")
    return (f'<!doctype html><html lang="{lang}"><head><meta charset="utf-8">'
            f"<title>Ghat Watch</title><style>{css}</style></head><body>{body}</body></html>")
