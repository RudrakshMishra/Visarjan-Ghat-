# Decisions log

| # | Decision | Reason | Alternative |
|---|---|---|---|
| D1 | Local dev venv uses Python 3.12; CI and deploy target 3.11 | Only 3.12 is installed on the dev machine | Install 3.11 locally |
| D2 | Expected Class B/C limits live in `config.yaml` `class_limits`; `load_rules` raises if the CPCB CSV disagrees | Limits come from the CSV; mismatch must fail loudly | Trust the CSV blindly |
| D3 | Config weights must sum to 1 (validated in `load_config`) | Prevents silent score inflation | Normalise silently |
| D4 | Data inspection deferred: the three `data/*.csv` files are not yet in the repo | Cannot inspect or invent data | Block all of Phase 0 |
| D5 | numpy pinned to 2.4.6 (not latest 2.5.4) | 2.5.x has no Python 3.11 wheels; deploy is 3.11 | Deploy on 3.12 |
| D6 | `flag`/`value_as_printed` codes (BDL, ND, not sampled, `*`, `**`) win over a numeric `value`; value is then set NaN | A BDL row that also prints a detection limit must not be read as a measurement | Treat any numeric value as MEASURED |
| D7 | Unknown `phase` (not pre/during/after) raises in the loader | Rule 5: never guess | Map synonyms silently |
| D8 | S averages only parameters that have MEASURED readings; BDL/ND scored readings are excluded from S/P/E but count toward coverage | TRD scores MEASURED only; BDL has no numeric value | Impute BDL as half the detection limit |
| D9 | Duplicate readings in one cell: event jump uses the mean per phase; diagnosis uses the worst reading | Mean is neutral for a ratio; worst is conservative for a pass/fail tag | Raise on duplicates |
| D10 | DO event term is 0 when pre == 0 | DO cannot fall below zero | Treat as undefined |
| D11 | Ghat with no measured scored readings: score NaN, ranked last, tag "Unknown, test first"; `E` is NaN (not None) in the DataFrame | pandas stores None as NaN in float columns | Object column |
| D12 | Rank tie-break: score desc, worst_do asc (NaN last), site name | Determinism | Random |
| D13 | Diagnosis tags combine with `+` (e.g. `EVENT-LINKED+TRANSIENT`); undefined combos are `INSUFFICIENT DATA` (incl. pass/pass/missing) | One string column; never guess OK | List column |
| D14 | Diagnosis: BDL/ND passes a max-only limit (BOD) and fails a min limit (DO) | BDL means very low | Treat as missing |
| D15 | T7 reworded: replacing a *failing* reading with NOT_SAMPLED lowers coverage and leaves the count of passes unchanged; replacing a *passing* reading never lowers the score | Under TRD's P formula, removing a fail necessarily changes P; literal T7 conflicts with TRD 5 (TRD formula wins) | Change the P formula |
| D16 | Metals list (Chromium, Lead, Zinc, Copper) is matched on exact `parameter` names; verify against real data | Data not yet available | Fuzzy match |
| D17 | `load_rules`, `evidence_for`, `testing_checklist` take an optional trailing `cfg` argument | Need config values; TRD signatures still work unchanged | Global state |
| D18 | `fmt_num`: ints plain, floats with 1-2 decimals (5.0, 0.0, 3.25); scores rounded to 1 decimal in facts | One format for facts, templates and guard | Strip `.0` |
| D19 | Facts adds `gap_items`, `limits_items`, `actions`, `limits`, `n_ghats`, `n_top`, `coverage_pct`, `years`, dates (beyond TRD schema) so templates never hardcode numbers; HI text renders from items | Hindi needs keys, not English strings | Translate strings at runtime |
| D20 | Actions: DO fail -> aerate, BOD fail -> clean, confidence below High or missing data -> test; shown for top 3, plus "test" for all ghats | Derived from tags/reasons only, no health reasoning | Officer-written actions |
| D21 | `allowed_numbers` = every number in facts + date parts + 2-digit year suffixes (for "2023-25") | Guard must accept what templates legitimately print | Exact strings only |
| D22 | Guard strips URLs and site names before extracting numbers; EN banned phrases use word boundaries, HI uses NFC substrings | Avoid "cleaning" false positives; Hindi has no reliable \b | Plain substring |
