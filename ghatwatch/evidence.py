"""Map a reading row to its evidence (report year, PDF page, link)."""
from __future__ import annotations

import pandas as pd

from ghatwatch.config import load_config

_URLS: dict | None = None


def report_url(year: int, cfg: dict | None = None) -> str:
    """Public MPPCB report URL for a year (from config)."""
    global _URLS
    if cfg is not None:
        return cfg["report_urls"][int(year)]
    if _URLS is None:
        _URLS = load_config()["report_urls"]
    return _URLS[int(year)]


def evidence_for(row, cfg: dict | None = None) -> dict:
    """Return value_as_printed, parameter_as_printed, unit, year, festival, phase, page, url."""
    r = dict(row)
    page = r.get("source_page")
    page = None if page is None or pd.isna(page) else int(page)
    base = report_url(r["year"], cfg)
    ev = {"site": r.get("site"), "parameter": r.get("parameter"),
          "value_as_printed": r.get("value_as_printed"),
          "parameter_as_printed": r.get("parameter_as_printed", r.get("parameter")),
          "unit": r.get("unit_assumed"), "year": int(r["year"]), "festival": r.get("festival"),
          "phase": r.get("phase"), "page": page,
          "url": f"{base}#page={page}" if page is not None else base}
    if page is None:
        ev["page_note"] = "page not recorded; open the report and search for the site"
    return ev
