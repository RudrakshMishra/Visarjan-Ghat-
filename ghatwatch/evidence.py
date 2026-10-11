"""Map a reading row to its evidence (report year, PDF page, link)."""
from __future__ import annotations


def evidence_for(row) -> dict:
    """Return value_as_printed, parameter_as_printed, unit, year, festival, phase, page, url."""
    raise NotImplementedError
