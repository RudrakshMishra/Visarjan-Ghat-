# Backend status

**Important:** the three `data/*.csv` files were not available when this was built. All logic is tested on a **synthetic** fixture (`tests/conftest.py`), and the real-data tests skip automatically until the files are added. No number below comes from real data.

## Tests (T1 to T21)

| ID | Status | Evidence |
|---|---|---|
| T1 DO < 5: 42 of 116 | PENDING (needs data) | `tests/test_loader.py::test_t1_do_below_5` |
| T2 BOD > 3: 100 of 112 | PENDING (needs data) | `test_t2_bod_above_3` |
| T3 BDL / ND | PASS | `test_t3_bdl_nd_status` |
| T4 missing codes | PASS | `test_t4_missing_codes`, unknown codes raise |
| T5 boundaries | PASS | `test_t5_boundaries` |
| T6 determinism | PASS | `test_t6_deterministic` (shuffled input, identical output) |
| T7 missing never a pass | PASS (reworded, see D15) | `test_t7_*` |
| T8 evidence | PASS synthetic; real page check PENDING | `test_t8_evidence`, `test_t8_real_pages` |
| T9 guard | PASS | `tests/test_guard.py` |
| T10 diagnosis | PASS | 11 tag cases + synthetic table |
| T11 intake | PASS | `tests/test_intake.py` |
| T12 config weights | PASS | `test_t12_weight_change` |
| T13 LLM happy path (mock) | PASS | `tests/test_llm.py` |
| T14 fake number, repair, template | PASS | `test_t14_*` |
| T15 429 / timeout | PASS | `test_t15_*` |
| T16 no key | PASS | `test_t16_no_key` |
| T17 schema rules | PASS | `test_t17_schema` |
| T18 tools return data numbers | PASS | `tests/test_askdata.py` |
| T19 injected number rejected | PASS | `test_t19_injected_number_rejected` |
| T20 secret scan | PASS locally; CI step in `.github/workflows/ci.yml` | `git grep` key patterns: no matches |
| T21 live Cerebras smoke | PENDING (no key on dev machine) | `scripts/cerebras_smoke.py` |

Acceptance items A1 to A11 are in IMPLEMENTATION_PLAN; they depend on the UI and real data, so they are not assessed here.

## What works
- Loader with strict status codes. Rules come from the CPCB CSV and are checked against config. Scoring, diagnosis, coverage (incl. TABLE_ABSENT), evidence links, facts, EN/HI template briefs, Claim Guard, HTML/WhatsApp export, robustness (16 scenarios), hindcast, service facade, Cerebras layer with fallback, ask-the-data with deterministic fallback, intake validation.
- The whole thing runs with no key and no network.

## What doesn't (yet)
- Not run on real data. The CPCB CSV parser handles long (`class, parameter, criteria|min|max`) and wide (`parameter, A, B, C...`) layouts; any other layout raises a clear error.
- Metal names are matched exactly (`Chromium, Lead, Zinc, Copper`, D16).
- No live Cerebras call has been made, so model IDs and the tool-calling/structured-output behaviour are unverified.
- `llm.py` is about 240 lines (over the ~200 guideline).

## Manual checks still owed
1. Add the CSVs and run `pytest -q`. T1/T2 must match or be explained in DECISIONS.md.
2. Check 10 random rows against the PDFs and open 5 evidence links.
3. Native Hindi speaker reads `templates/brief_hi.md.j2` (HI-01 to HI-27) and the Hindi banned list in `config.yaml`.
4. Review the Claim Guard banned-phrase list.
5. With a key: run `scripts/cerebras_smoke.py` and generate one real EN and HI brief.

All decisions: see `docs/DECISIONS.md` (D1 to D23).
