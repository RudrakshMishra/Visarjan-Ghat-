# Decisions log

| # | Decision | Reason | Alternative |
|---|---|---|---|
| D1 | Local dev venv uses Python 3.12; CI and deploy target 3.11 | Only 3.12 is installed on the dev machine | Install 3.11 locally |
| D2 | Expected Class B/C limits live in `config.yaml` `class_limits`; `load_rules` raises if the CPCB CSV disagrees | Limits come from the CSV; mismatch must fail loudly | Trust the CSV blindly |
| D3 | Config weights must sum to 1 (validated in `load_config`) | Prevents silent score inflation | Normalise silently |
| D4 | Data inspection deferred: the three `data/*.csv` files are not yet in the repo | Cannot inspect or invent data | Block all of Phase 0 |
| D5 | numpy pinned to 2.4.6 (not latest 2.5.4) | 2.5.x has no Python 3.11 wheels; deploy is 3.11 | Deploy on 3.12 |
