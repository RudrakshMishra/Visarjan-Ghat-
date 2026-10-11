# Visarjan-Ghat-
## Backend

Python package `ghatwatch/` (framework-free). The UI imports only `ghatwatch.service`; see `docs/BACKEND_API.md`.

**Architecture:** `data/*.csv` -> `loader` (status: MEASURED / BDL / ND / NOT_SAMPLED; unknown codes raise) -> `rules` (CPCB Class B/C from the CSV, checked against `config.yaml`) -> `scoring`, `diagnosis`, `coverage`, `robustness`, `hindcast` -> `facts` (single source of truth) -> `brief` (Jinja2 EN/HI) -> optional `llm` (Cerebras) -> `guard`.

**Tests:** `pip install -r requirements-dev.txt && pytest -q`. Real-data tests skip until `data/bhopal_ghats_2023_2025.csv` and `data/cpcb_water_quality_criteria.csv` are present.

**Claim Guard:** every brief or answer (template or AI) is checked by deterministic code. Every number (Devanagari digits included) must be in `facts.allowed_numbers`, and banned English/Hindi phrases (causes, health claims) fail the text. On failure the template brief is shown. An LLM never verifies an LLM.

**What is sent to Cerebras (external service, optional):** only `facts.json` (public report data, no personal data) and the officer's typed question. Without `CEREBRAS_API_KEY` the app runs fully offline in template mode.
