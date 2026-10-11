# Data sources

**Update:** the official data pack (`bhopal_ghats_2023_2025.csv`, `cpcb_water_quality_criteria.csv`, `sample_bhopal_2025.csv`, `mp_immersion_sites_2023_2025.csv`) was added by a teammate and is now the data in `data/`. Our PDF extraction below matched it exactly: same 1,524 rows, every value and page identical. Only three site names differ in spelling. The extraction is kept as an independent check.

No organiser data pack was available, so the data files were rebuilt from the public MPPCB reports (the same reports the evidence links point to).

| File | Source | How |
|---|---|---|
| `data/bhopal_ghats_2023_2025.csv` (1,524 rows) | MPPCB visarjan reports 2023, 2024, 2025 (URLs in `config.yaml`) | `scripts/extract_mppcb.py` (dev-time only, PyMuPDF table detection in a separate venv; not a product dependency). Bhopal pages: 2025 Ganesh p28-30, Durga p64-65; 2024 Ganesh p69-72, Durga p23-26; 2023 Ganesh p26-28, Durga p59-61 |
| `data/sample_bhopal_2025.csv` | 2025 rows of the file above | filter |
| `data/cpcb_water_quality_criteria.csv` | CPCB "Designated Best Use" water quality criteria (Classes A to E) | transcribed by hand from the published CPCB table |

Checks done:
- **Row count:** 1,524, the same as the TRD.
- **T1:** DO below 5 in 42 of 116 measured readings, as expected.
- **T2:** BOD above 3 in 100 of 112, as expected.
- **Missing tables:** Bairagarh and Malikhedi have no Durga 2025 table, matching the TRD.
- **Bairagarh:** DO 0.0 appears four times.
- **Pages checked against page images:** 2025 p30 and p64, 2023 p26, all cell for cell.

Conventions:
- `value_as_printed` is the cell exactly as extracted. `_`, `-` and blank cells are NOT_SAMPLED.
- `site_as_printed` is the location line from the report.
- `water_body` is filled only where the report prints it.
- `unit_assumed`: mg/l for DO, BOD, COD, solids and metals; NTU for turbidity; uS/cm for conductivity; none for pH. These are assumptions, shown in the limits panel.
- Rani Kamlapati / Kamla Park is one standard name with `site_match_confidence = medium`.

Still owed by a human: check 10 random rows against the PDFs, and check the CPCB file against the official CPCB page.
