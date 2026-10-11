# Backend API (for `app.py`)

Import only `ghatwatch.service`. Everything returns plain pandas DataFrames, dicts or dataclasses. No Streamlit in the backend: wrap `load_context` yourself.

```python
import streamlit as st
from ghatwatch import service

@st.cache_resource
def ctx():
    return service.load_context(".")          # reads config.yaml + data/*.csv

c = ctx()
rank = service.get_ranking(c)                  # or festival="Durga", years=[2024, 2025]
detail = service.get_ghat_detail(c, rank.iloc[0]["site"])
brief = service.get_brief(c, "hi", use_ai=st.toggle("AI wording"))
st.markdown(brief["text"]); st.caption(brief["guard_badge"] + " | " + brief["status_badge"])
```

| Function | Returns |
|---|---|
| `load_context(root=".")` | `Context(df, rules_B, rules_C, cfg)`; raises `ValueError` with row details if the CSV has unknown codes or CPCB limits mismatch |
| `get_ranking(ctx, festival=None, years=None)` | DataFrame `site, score (0-100, NaN = no data), rank (1 = highest risk), S, P, E (NaN = no baseline), coverage (0-1), confidence (High/Medium/Low), tags (list[str]), worst_do` |
| `get_ghat_detail(ctx, site)` | dict: `readings` (DataFrame `parameter, festival, year, pre, during, after` with values as printed), `limits` `{param: {min, max}}`, `diagnosis` (DataFrame `site, festival, year, parameter, tag, pre, during, after`), `metals` (DataFrame `site, festival, year, parameter, pre, during, flag, source_page`), `evidence` (list of dicts `value_as_printed, parameter_as_printed, unit, year, festival, phase, page, url[, page_note]`). `KeyError` for unknown site |
| `get_coverage(ctx)` | DataFrame `site, festival, year, phase, parameter, status` where status is `MEASURED / BDL / ND / NOT_SAMPLED / TABLE_ABSENT` (full 7 x 2 x 3 grid) |
| `get_checklist(ctx)` | DataFrame `site, phase, parameter, reason, suggested_date` for Durga 2026 |
| `get_facts(ctx)` | facts dict (TRD schema + `gap_items`, `limits_items`, `actions`, `limits`, `n_ghats`, `n_top`, `years`) |
| `get_brief(ctx, lang, use_ai=False)` | dict `text` (markdown), `guard` (`GuardResult`), `guard_badge` (str), `meta` (`source, model, seconds, candidates_tried, rejected`), `status_badge` (str). Never raises; AI falls back to template |
| `get_robustness(ctx)` | DataFrame `site, rank_min, rank_max, top3_count, n` (n = 16) |
| `get_hindcast(ctx)` | dict `train_years, test_year, n_ghats, sites, top3_overlap, spearman, reason, caveat` (`None` metrics + `reason` when fewer than 3 ghats) |
| `get_limits_panel(ctx)` | list[str], always show |
| `get_method(ctx)` | dict `formula, weights, recency, severity_caps, limits, coverage_thresholds, class, robustness_weight_sets` |

Other helpers:
- `ghatwatch.brief.to_html(facts, lang)` gives a self-contained printable HTML string for `st.download_button`.
- `ghatwatch.brief.to_whatsapp_text(facts, lang)` gives plain text.
- `ghatwatch.askdata.answer(question, c.df, c.rules, c.cfg)` returns `(text, GuardResult, tool_calls)` and never raises.
- `ghatwatch.intake.validate_intake(file, c.df)` returns `(clean_df, errors)`; then call `apply_intake(c.df, clean_df)` (in memory only).

Until the real data lands, `tests/fixtures/facts_stub.json` has the facts shape. Regenerate the real one with `python scripts/export_facts.py tests/fixtures/facts_real_sample.json`.
