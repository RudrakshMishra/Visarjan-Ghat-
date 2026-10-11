"""DEV-TIME ONLY: rebuild data/bhopal_ghats_2023_2025.csv from the public MPPCB PDFs.

Not imported by the app (the product has no PDF dependency). Needs PyMuPDF in a separate venv:
    python -m venv .tools && .tools/Scripts/pip install pymupdf
    .tools/Scripts/python -I scripts/extract_mppcb.py <pdf_dir> data/bhopal_ghats_2023_2025.csv
Every row keeps value_as_printed, parameter_as_printed, site_as_printed and the PDF page (1-based).
Verify rows by hand against the PDFs; see docs/DATA_SOURCES.md.
"""
import csv
import re
import sys
from pathlib import Path

import pymupdf

REPORTS = {2025: "Ganesh_and_Durga_visarjan_report-2025.pdf",
           2024: "Ganesh_and_Durga_visarjan_report-2024.pdf",
           2023: "Idol_immer._Report_23_CPCB.pdf"}
# (keyword in location text) -> (standard site, water body as printed or "", match confidence)
SITES = [("khatlapura", "Khatlapura ghat", "Lower lake", "high"),
         ("bairagarh", "Bairagarh (Sant Hirdaram) kund", "Upper lake", "high"),
         ("prempura", "Prempura ghat", "", "high"),
         ("kamla", "Rani Kamlapati (Kamla Park) ghat", "Lower lake", "medium"),
         ("hathaikheda", "Hathaikheda kund", "Hathaikheda dam", "high"),
         ("maalikhedi", "Malikhedi kund", "", "high"),
         ("shahpura", "Shahpura ghat", "Shahpura lake", "high")]
PARAMS = [(r"^ph$", "pH", ""), (r"oxygen", "Dissolved oxygen", "mg/l"), (r"^bod", "BOD", "mg/l"),
          (r"^cod", "COD", "mg/l"), (r"total\s*solids", "Total solids", "mg/l"),
          (r"dissolved\s*solids", "Dissolved solids", "mg/l"), (r"suspended", "Suspended solids", "mg/l"),
          (r"turbidity", "Turbidity", "NTU"), (r"conductivity", "Conductivity", "uS/cm"),
          (r"chromium", "Chromium", "mg/l"), (r"lead", "Lead", "mg/l"), (r"zinc", "Zinc", "mg/l"),
          (r"copper", "Copper", "mg/l")]
PHASE_HDR = [("pre", r"pre"), ("during", r"during|idol\s*imm|^immersion"), ("after", r"after|week")]
COLS = ["year", "festival", "site", "water_body", "phase", "parameter", "value", "unit_assumed", "flag",
        "value_as_printed", "parameter_as_printed", "site_as_printed", "site_match_confidence", "source_page"]


def clean(c) -> str:
    return re.sub(r"\s+", " ", str(c or "")).strip()


def site_of(text: str):
    t = text.lower()
    if "bhopal" not in t and not any(k in t for k, *_ in SITES):
        return None
    if re.search(r"vidisha|rajgarh|sehore|chhin", t):
        return None
    return next(((s, w, c) for k, s, w, c in SITES if k in t), None)


def param_of(name: str):
    n = name.lower().replace(".", " ").strip()
    n = re.sub(r"[^a-z ]", " ", n).strip()
    return next(((p, u) for rx, p, u in PARAMS if re.search(rx, n.replace(" ", "") if rx.startswith("^") else n)), None)


def value_fields(printed: str):
    """-> (value, flag) per TRD 4."""
    p = printed.replace(" ", "")
    if p == "":
        return "", ""
    if p in ("*", "**"):
        return "", p
    if p.upper() in ("BDL", "ND"):
        return "", p.upper()
    if p.lower() in ("notsampled", "ns"):
        return "", "not sampled"
    if re.fullmatch(r"\d+(\.\d+)?", p):
        return p, ""
    if p in ("-", "_"):
        return "", ""
    return "", "REVIEW"  # unclear cell: must be fixed by hand from the page image


def extract(pdf: Path, year: int, festival_pages: dict) -> list[dict]:
    rows, current_site, phase_cols = [], None, None
    doc = pymupdf.open(pdf)
    for pno, (lo, hi, fest) in festival_pages.items():
        for i in range(lo, hi + 1):
            page = doc[i - 1]
            locs = []
            for blk in page.get_text("dict")["blocks"]:
                for ln in blk.get("lines", []):
                    txt = clean("".join(sp["text"] for sp in ln["spans"]))
                    if re.search(r"location|ghat|kund|river|talab|dam", txt, re.I)                             and not re.search(r"parameter|monitoring|immersion|report", txt, re.I):
                        locs.append((ln["bbox"][1], site_of(txt), txt))  # site None = non-Bhopal, skipped
            for tab in sorted(page.find_tables().tables, key=lambda t: t.bbox[1]):
                above = [l for l in locs if l[0] <= tab.bbox[1] + 2]
                if above:
                    current_site = max(above, key=lambda l: l[0])
                    phase_cols = None
                if current_site is None or current_site[1] is None:
                    continue
                _, (site, wb, conf), printed_site = current_site
                for cells in tab.extract():
                    cells = [clean(c) for c in cells]
                    hdr = {ph: j for j, c in enumerate(cells) for ph, rx in PHASE_HDR if re.search(rx, c, re.I)}
                    if len(hdr) >= 2:
                        phase_cols = hdr
                        continue
                    pidx = next((j for j, c in enumerate(cells) if c and param_of(c)), None)
                    if pidx is None or phase_cols is None:
                        continue
                    param, unit = param_of(cells[pidx])
                    for ph in ("pre", "during", "after"):
                        j = phase_cols.get(ph)
                        printed = cells[j] if j is not None and j < len(cells) else ""
                        value, flag = value_fields(printed)
                        rows.append(dict(zip(COLS, [year, fest, site, wb, ph, param, value, unit, flag,
                                                    printed, cells[pidx], printed_site, conf, i])))
    return rows


# year -> {key: (first_page, last_page, festival)} (1-based PDF pages, found by survey)
PAGES = {2025: {"g": (28, 30, "Ganesh"), "d": (64, 65, "Durga")},
         2024: {"g": (69, 72, "Ganesh"), "d": (23, 26, "Durga")},
         2023: {"g": (26, 28, "Ganesh"), "d": (59, 61, "Durga")}}

if __name__ == "__main__":
    src, out = Path(sys.argv[1]), Path(sys.argv[2])
    allrows = []
    for year, fname in REPORTS.items():
        allrows += extract(src / fname, year, PAGES[year])
    with open(out, "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=COLS)
        w.writeheader()
        w.writerows(allrows)
    print(f"wrote {len(allrows)} rows to {out}")
