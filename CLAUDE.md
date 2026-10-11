# Ghat Watch: agent rules
Project: rank 7 Bhopal immersion ghats by water-quality risk vs CPCB Class B, for a BMC officer. See docs/PRD.md, docs/TRD.md.
Rules:
1. Every number shown must come from data/*.csv. Never invent data, limits, coordinates, page numbers.
2. Missing (not sampled, *, **, blank) is never clean. BDL/ND are very low, not zero, not missing.
3. No health-effect claims anywhere (code, templates, LLM prompts).
4. App must run with no API key. Cerebras (cerebras_cloud_sdk) is the only runtime LLM and is optional; it lives in ghatwatch/llm.py and ghatwatch/askdata.py. Model IDs come from config.yaml. Never combine `tools` and `response_format` in one Cerebras request. Every LLM output goes through guard.py.
5. No secrets in code. Use environment variables (CEREBRAS_API_KEY). Never print or commit keys.
6. Stay inside your assigned files. Follow signatures in docs/TRD.md section 6.
7. Write tests first. Run `pytest -q` before saying done.
8. Python 3.11, pandas, Streamlit, Plotly, cerebras_cloud_sdk. No new dependencies without asking.
