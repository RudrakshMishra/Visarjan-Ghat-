"""Facade for the UI: the only module app.py should import. Pure functions, no Streamlit."""
from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

import pandas as pd

from ghatwatch import coverage, diagnosis, facts as facts_mod, hindcast as hc, robustness as rb
from ghatwatch.config import load_config
from ghatwatch.evidence import evidence_for
from ghatwatch.guard import guard, guard_badge
from ghatwatch.loader import load_readings
from ghatwatch.rules import load_rules
from ghatwatch.scoring import score_ghats


@dataclass
class Context:
    df: pd.DataFrame
    rules_B: dict
    rules_C: dict
    cfg: dict
    root: Path = Path(".")
    cache: dict = field(default_factory=dict)

    @property
    def rules(self) -> dict:
        return self.rules_B if self.cfg.get("class", "B") == "B" else self.rules_C


def load_context(root: str | Path = ".") -> Context:
    """Load config, readings and Class B/C rules relative to the repo root."""
    root = Path(root)
    cfg = load_config(root / "config.yaml")
    df = load_readings(str(root / cfg["data"]["readings"]))
    crit = str(root / cfg["data"]["criteria"])
    return Context(df, load_rules(crit, "B", cfg), load_rules(crit, "C", cfg), cfg, root)


def _filter(df: pd.DataFrame, festival=None, years=None) -> pd.DataFrame:
    if festival:
        df = df[df["festival"] == festival]
    if years:
        df = df[df["year"].isin([int(y) for y in years])]
    return df


def get_ranking(ctx: Context, festival: str | None = None, years=None) -> pd.DataFrame:
    """Ranking table (see scoring.score_ghats) for an optional festival/years filter."""
    return score_ghats(_filter(ctx.df, festival, years), ctx.rules, ctx.cfg)


def get_ghat_detail(ctx: Context, site: str) -> dict:
    """Readings pivot, limits, diagnosis, metals and evidence rows for one ghat."""
    g = ctx.df[ctx.df["site"] == site]
    if g.empty:
        raise KeyError(f"unknown site {site!r}")
    pivot = g.pivot_table(index=["parameter", "festival", "year"], columns="phase",
                          values="value_as_printed", aggfunc="first").reindex(columns=["pre", "during", "after"])
    return {"site": site, "readings": pivot.reset_index(),
            "limits": {p: {"min": r.min, "max": r.max} for p, r in ctx.rules.items()},
            "diagnosis": diagnosis.diagnose(g, ctx.rules),
            "metals": diagnosis.metals_watch(g, ctx.cfg["metals"]["jump_factor"]),
            "evidence": [evidence_for(r, ctx.cfg) for _, r in g.iterrows()]}


def get_coverage(ctx: Context) -> pd.DataFrame:
    """Full grid incl. TABLE_ABSENT slots."""
    return coverage.coverage_matrix(ctx.df, params=tuple(ctx.rules),
                                    festivals=ctx.cfg.get("festivals"), years=ctx.cfg.get("years"))


def get_checklist(ctx: Context) -> pd.DataFrame:
    """What to measure for Durga 2026, with suggested dates."""
    return coverage.testing_checklist(ctx.df, ctx.rules, ctx.cfg)


def get_facts(ctx: Context) -> dict:
    """facts.json dict (cached on the context)."""
    if "facts" not in ctx.cache:
        ctx.cache["facts"] = facts_mod.build_facts(ctx.df, ctx.rules, ctx.cfg)
    return ctx.cache["facts"]


def get_brief(ctx: Context, lang: str, use_ai: bool = False) -> dict:
    """{text, guard, guard_badge, meta, status_badge}; AI path always falls back to template."""
    from ghatwatch import brief, llm
    f = get_facts(ctx)
    if use_ai:
        text, res, meta = llm.brief_with_guard(f, lang, ctx.cfg)
    else:
        text = brief.render_brief(f, lang)
        res = guard(text, f, ctx.cfg)
        meta = {"source": "template", "model": None, "seconds": 0.0, "candidates_tried": 0, "rejected": []}
    return {"text": text, "guard": res, "guard_badge": guard_badge(res), "meta": meta,
            "status_badge": llm.status_badge(meta)}


def get_robustness(ctx: Context) -> pd.DataFrame:
    """rank_min, rank_max, top3_count, n per ghat over 16 scenarios."""
    return rb.robustness(ctx.df, ctx.rules_B, ctx.rules_C, ctx.cfg)


def get_hindcast(ctx: Context) -> dict:
    """Train-years score vs test-year severity, with caveat."""
    return hc.hindcast(ctx.df, ctx.rules, ctx.cfg)


def get_limits_panel(ctx: Context) -> list[str]:
    """Always-visible honest limits (English strings)."""
    return get_facts(ctx)["limits_panel"]


def get_method(ctx: Context) -> dict:
    """Formula, weights and thresholds for the Method tab (all from config)."""
    c = ctx.cfg
    return {"formula": "score = 100 * (wS*S + wP*P + wE*E); renormalised to S and P when E is missing",
            "weights": c["weights"], "recency": c["recency"], "severity_caps": c["severity_caps"],
            "limits": {p: {"min": r.min, "max": r.max} for p, r in ctx.rules.items()},
            "coverage_thresholds": c["coverage"], "class": c.get("class", "B"),
            "robustness_weight_sets": c["robustness"]["weight_sets"]}
