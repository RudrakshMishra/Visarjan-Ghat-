# TRD: Ghat Watch (Track 2, Visarjan Ghat Watch)

Technical design for a one-day, AI-assisted build. Companion docs: `PRD.md`, `MRD.md`, `IMPLEMENTATION_PLAN.md`. Every decision here favors: ship by 4:30 PM, runs without keys, traceable numbers.

## 1. Architecture

```
data/*.csv ──> loader ──> normalized DataFrame ──┬─> scoring ──────┐
cpcb csv  ──> rules  ──────────────────────────┤  diagnosis      │
                                                 ├─> coverage      ├─> facts.json ─> brief (template) ─> [Cerebras LLM, optional] ─> guard ─> UI
                                                 ├─> robustness    │
                                                 └─> hindcast ─────┘
UI (Streamlit) reads facts + DataFrames only; no business logic in app.py
```

Single process, no database, no server API of our own. Core product needs no network. **Cerebras inference** (Cerebras Cloud SDK) is an optional layer with two jobs: (U1) guarded Hindi/English brief wording via strict JSON-schema output, and (U2) "Ask the data" via tool calling over fixed, dataset-only tools. Every LLM output goes through the Claim Guard; on any failure the template path runs. Evidence links point to public PDF URLs; the app never downloads them.

```
facts.json ──> llm.py (Cerebras, N candidates, strict schema) ──> guard ──pass──> brief
                         │ error / 429 / timeout / no key            └─fail──> template brief
question ──> askdata.py (Cerebras tool loop) ──> tools (pandas, evidence) ──> answer ──> guard
```

## 2. Stack

| Concern | Choice | Notes |
|---|---|---|
| Language | Python 3.11 | One language for team and agents |
| Data | pandas | 1,524 rows; trivial |
| App | Streamlit | Fastest to a working product; tabs for screens |
| Charts | Plotly | Limit lines, hover evidence |
| Map (Could) | folium + streamlit-folium | Coordinates from `ghat_coordinates.csv`, labelled approximate |
| Config | `config.yaml` via PyYAML | Weights, recency, scenarios, banned phrases |
| Templates | Jinja2 | English and Hindi brief templates |
| LLM runtime (optional layer) | **Cerebras inference** via `cerebras_cloud_sdk` | Models `gpt-oss-120b` / `qwen-3.8-27b` (catalog on 11 Oct 2026; IDs in config). Strict JSON-schema output for the brief; tool calling for Ask-the-data. Behind `ghatwatch/llm.py`; template mode when off |
| Dev-time AI | Claude Code (+ Claude chat) | Builds the code; not part of the runtime |
| Tests | pytest | Acceptance list in section 9 |
| CI | GitHub Actions | `pytest -q` on push |
| Hosting (backup) | Streamlit Community Cloud or similar | Local run is primary |
| Hindi export | HTML download + browser print + plain text | No PDF library today: Devanagari shaping and system font dependencies are a time risk |

## 3. Repository layout

```
visarjan-ghat-watch/
  README.md  LICENSE(MIT)  CLAUDE.md  requirements.txt  config.yaml  .env.example  app.py
  ghatwatch/
    __init__.py
    loader.py       # CSV -> normalized DataFrame + status
    rules.py        # CPCB limits -> callable rules per class
    scoring.py      # severity, persistence, event jump, score, rank, confidence
    diagnosis.py    # chronic / event-linked / persisting / transient / no baseline
    coverage.py     # coverage matrix + testing checklist
    robustness.py   # 16 scenarios
    hindcast.py     # 2023-24 -> 2025 check
    evidence.py     # row -> evidence dict + PDF URL with #page
    facts.py        # assemble facts.json (single source of truth for brief)
    brief.py        # template rendering EN/HI + WhatsApp text + HTML
    guard.py        # Claim Guard
    llm.py          # Cerebras client, BRIEF_SCHEMA, best-of-N, retries, cache, fallback
    askdata.py      # 5 dataset-only tools + Cerebras tool-calling loop (Could)
    intake.py       # validate uploaded 2026 CSV (Could)
  data/
    bhopal_ghats_2023_2025.csv  cpcb_water_quality_criteria.csv
    ghat_coordinates.csv        # manual, with source + "approximate"
    intake_template_2026.csv
  templates/ brief_en.md.j2  brief_hi.md.j2
  tests/ test_loader.py test_scoring.py test_diagnosis.py test_coverage.py test_guard.py test_llm.py test_askdata.py test_evidence.py test_intake.py
  scripts/ cerebras_smoke.py   # 1 call per model ID + 1 tool-call test; prints latency
  docs/ PRD.md MRD.md TRD.md IMPLEMENTATION_PLAN.md
  .github/workflows/ci.yml
```

## 4. Data model

Input columns (Bhopal CSV): `year, festival, site, water_body, phase, parameter, value, unit_assumed, flag, value_as_printed, parameter_as_printed, site_as_printed, site_match_confidence, source_page`.

Normalized `status` column (derived in `loader.py`):

| Condition | status |
|---|---|
| `value` present | MEASURED |
| `flag` == `BDL` | BDL |
| `flag` == `ND` | ND |
| `flag` in {`not sampled`, `*`, `**`} or `value_as_printed` in {``, `-`, `_`} with no value | NOT_SAMPLED |

Note from the 2025 sample: pH rows use `*` and `**` in `flag`; other parameters use `not sampled`. All three mean missing. Anything else non-numeric is an error and must raise, not be guessed.

Report URLs (public, linked only):
- 2025: `https://www.mppcb.mp.gov.in/proc/mon/Ganesh_and_Durga_visarjan_report-2025.pdf`
- 2024: `https://www.mppcb.mp.gov.in/proc/mon/Ganesh_and_Durga_visarjan_report-2024.pdf`
- 2023: `https://www.mppcb.mp.gov.in/proc/mon/Idol_immer._Report_23_CPCB.pdf`

Evidence link = report URL + `#page={source_page}`. `source_page` is the PDF page of that year's report. Verify 5 links by hand.

Expected table presence: 7 ghats x 2 festivals x 3 years = 42 table slots. Absent slots (e.g. Bairagarh and Malikhedi, Durga 2025) are reported as TABLE_ABSENT in coverage; they are not rows in the CSV.

## 5. Algorithms (exact)

All thresholds and weights live in `config.yaml`. Defaults:

**Rules (CPCB Class B):** DO min 5; BOD max 3; pH range 6.5 to 8.5. Class C for robustness: DO min 4; BOD max 3; pH 6 to 9. Scored parameters: DO, BOD, pH. Other parameters (COD, solids, turbidity, conductivity) are shown as context with no limit. Metals: no Class B limit, so never "exceeds".

**Per-reading severity (0 to 1), MEASURED rows only:**
- DO: `clamp((5 - v) / 5, 0, 1)`
- BOD: `clamp((v - 3) / 9, 0, 1)` (12 mg/l or more is the cap)
- pH: `clamp(distance_outside_[6.5, 8.5] / 1.0, 0, 1)`
- A reading fails if severity > 0. Boundaries: DO of exactly 5 passes; BOD of exactly 3 passes.

**Recency weights (reference year 2026):** `{2026: 1.0, 2025: 1.0, 2024: 0.7, 2023: 0.5}`.

**Components per ghat:**
- **Severity S** = mean over {DO, BOD, pH} of `max over readings (w_year * severity)`.
- **Persistence P** = `sum(w_year * failed) / sum(w_year)` over all measured scored readings.
- **Event jump E** = mean over (festival, year, parameter) where pre and during are both MEASURED: DO uses `clamp((pre - during) / pre, 0, 1)`; BOD uses `clamp((during - pre) / max(pre, 1), 0, 1)`. pH excluded from E. If no pair exists, E is None.

**Score** = `100 * (0.45*S + 0.35*P + 0.20*E)`. If E is None, renormalize to S and P only (`0.45/0.80`, `0.35/0.80`) and tag the ghat "No baseline". Weights are judgment-based; the robustness view exists because of that.

**Coverage and confidence:** `coverage = measured scored cells / expected scored cells` where expected = 3 params x 3 phases x number of festival-years with a table present. Label High at 80% or more, Medium 50 to 79%, Low below 50%. Low confidence adds "Unknown, test first". Missing cells are never treated as passes: they are excluded from P and shown in coverage.

**Rank:** descending score; ties broken by lowest DO reading.

**Diagnosis (per ghat x parameter x festival-year):**

| Pre | During | After | Tag |
|---|---|---|---|
| fail | any | any | CHRONIC |
| pass | fail | any | EVENT-LINKED (if after fails too, also PERSISTING) |
| pass | pass | fail | PERSISTING |
| missing | fail | n/a | NO BASELINE |
| pass | pass | pass | OK |

Plus TRANSIENT when pass pre, fail during, pass after. Wording in UI: "event window", never "caused by".

**Metals watch:** flag when during >= 3 x pre (both MEASURED, pre > 0). BDL pre with a measured during value: flag "above detection during event window". Informational only; not in the score.

**Suspicious constants flag:** if one metal value repeats at 5 or more ghat-phase cells within a festival-year, tag "possible placeholder, verify in report". Not interpreted further.

**Robustness (16 scenarios):** weight sets {base 0.45/0.35/0.20, severity-heavy 0.60/0.25/0.15, persistence-heavy 0.30/0.50/0.20, no-event 0.55/0.45/0} x recency {on, off} x class {B, C}. Output per ghat: `rank_min, rank_max, top3_count, n=16`.

**Hindcast:** score using 2023 and 2024 only; compare with severity S from 2025 readings. Report top-3 overlap and Spearman rank correlation over ghats with 2025 data. Print the result as is, with the small-sample caveat.

**2026 intake (Could):** accept CSV with the Bhopal columns. Reject unknown `site`, `phase`, `parameter`; accept `value` numeric or one of BDL, ND, not sampled, `*`, `**`; require `source_page` or `source_note`. Append in memory, recompute, never persist.

## 6. Interfaces (the contract agents code to)

```python
# loader.py
def load_readings(path: str) -> pd.DataFrame
    # cols: year, festival, site, phase, parameter, value(float|NaN), status, value_as_printed, source_page, unit_assumed

# rules.py
def load_rules(path: str, klass: str = "B") -> dict   # {"Dissolved oxygen": Rule(min=5), ...}
def severity(parameter: str, value: float, rules: dict) -> float

# scoring.py
def score_ghats(df, rules, cfg) -> pd.DataFrame
    # cols: site, score, rank, S, P, E, coverage, confidence, tags(list[str]), worst_do

# diagnosis.py
def diagnose(df, rules) -> pd.DataFrame
    # cols: site, festival, year, parameter, tag, pre, during, after

# coverage.py
def coverage_matrix(df) -> pd.DataFrame      # site x (festival,year) x phase -> status / TABLE_ABSENT
def testing_checklist(df, rules) -> pd.DataFrame  # site, phase, parameter, reason

# evidence.py
def evidence_for(row) -> dict                # value_as_printed, parameter_as_printed, unit, year, festival, phase, page, url

# facts.py
def build_facts(df, rules, cfg) -> dict      # see schema below

# brief.py
def render_brief(facts: dict, lang: str, mode: str = "template") -> str   # lang: "en"|"hi"

# guard.py
@dataclass
class GuardResult: ok: bool; numbers_checked: int; bad_numbers: list; bad_phrases: list
def guard(text: str, facts: dict, cfg, extra_allowed: set[str] = frozenset()) -> GuardResult

# llm.py
def get_client(cfg) -> "CerebrasClient | None"   # None if provider == "none" or no CEREBRAS_API_KEY
def brief_with_guard(facts: dict, lang: str, cfg) -> tuple[str, GuardResult, dict]
    # returns (text, guard result, meta{source: "cerebras"|"template", model, seconds, candidates_tried})

# askdata.py
TOOLS: list[dict]                                 # tool specs sent to the model
def run_tool(name: str, args: dict, df, rules, cfg) -> dict   # pure; dataset-only; includes source_page + url
def answer(question: str, df, rules, cfg) -> tuple[str, GuardResult, list[dict]]   # text, guard, tool calls used
```

**`facts.json` schema (single source of truth):**
```json
{
  "generated_for": "Durga visarjan 2026-10-20",
  "class": "B",
  "ghats": [{
    "site": "Bairagarh (Sant Hirdaram) kund", "rank": 1, "score": 0.0, "confidence": "Low",
    "tags": ["Unknown, test first"],
    "reasons": [{"text_key": "do_below_limit", "params": {"value": 0.0, "limit": 5, "festival": "Ganesh", "year": 2025, "phase": "during"}, "page": 28, "year_report": 2025}]
  }],
  "allowed_numbers": ["0.0", "5", "2025", "28"],
  "gaps": ["..."],
  "limits_panel": ["units assumed", "four metals only", "..."]
}
```
(Example values only; real values come from the data.)

## 7. Cerebras inference layer and Claim Guard

- Default mode is template: Jinja2 fills EN and HI templates from `facts.json`. No network.
- **Cerebras is the product's LLM provider** (event partner; event rule 2 allows Cerebras inference APIs; name it in the README as an external service). It is an add-on: if there is no key, no network, an error, or a guard failure, the app shows the template version and everything else still works.

### 7.1 Client and models (verified against Cerebras docs on 11 Oct 2026; re-check before the demo)
- Install: `pip install --upgrade cerebras_cloud_sdk`. Import: `from cerebras.cloud.sdk import Cerebras`. Init: `Cerebras(api_key=os.environ.get("CEREBRAS_API_KEY"))`.
- Same API over HTTP: `POST https://api.cerebras.ai/v1/chat/completions` with `Authorization: Bearer $CEREBRAS_API_KEY`.
- Key: create at the Cerebras Cloud Console (API Keys). Free accounts have lower per-minute limits than paid ones. Ask the organisers whether event credits are provided.
- Model IDs in the shared catalog on 11 Oct 2026: `gpt-oss-120b` (listed ~3000 tokens/s) and `qwen-3.8-27b` (listed ~1850 tokens/s). Both support JSON Schema structured outputs with `strict: true`. IDs live in `config.yaml`, never hardcoded; a `404 model not found` means a wrong or deprecated ID.
- Bake-off at M3 (10 minutes): generate the Hindi and English brief with both IDs; the Hindi owner picks the default. We make no claim about which is better at Hindi before testing.

### 7.2 Use case U1: guarded brief generation
1. `facts.json` + the template text go to the model as the only source. System prompt: "Rewrite for a municipal officer in plain words. Use only the facts given. Keep every number exactly. Add no numbers, no causes, no health claims. If something is not in the facts, do not mention it."
2. Request uses `response_format={"type": "json_schema", "json_schema": {"name": "brief", "strict": True, "schema": BRIEF_SCHEMA}}`. Strict mode requires `additionalProperties: false` on every object, an `items` schema on every array, and no `pattern`, `format`, `minItems` or `maxItems`.
3. Generate `n_candidates` (default 3) in parallel threads, temperature from config. Render each JSON result into the template layout. Take the first candidate that passes the Claim Guard.
4. If none pass: one repair attempt that tells the model which numbers or phrases failed. If that fails too: template version, with a small "AI wording unavailable, showing standard text" note.

```json
BRIEF_SCHEMA = {
  "type": "object",
  "properties": {
    "headline": {"type": "string"},
    "ghats": {"type": "array", "items": {"type": "object", "properties": {
        "site": {"type": "string", "enum": ["<the 7 standard site names, filled from data at runtime>"]},
        "summary": {"type": "string"},
        "page_refs": {"type": "array", "items": {"type": "integer"}}},
      "required": ["site", "summary", "page_refs"], "additionalProperties": false}},
    "gaps": {"type": "array", "items": {"type": "string"}},
    "actions": {"type": "array", "items": {"type": "string"}},
    "limits_note": {"type": "string"}
  },
  "required": ["headline", "ghats", "gaps", "actions", "limits_note"],
  "additionalProperties": false
}
```

### 7.3 Use case U2: Ask the data (tool calling)
- Five fixed tools, pure functions over the DataFrame (`askdata.py`): `get_ranking()`, `get_ghat_summary(site)`, `compare_years(site, parameter)`, `list_missing(site)`, `get_evidence(site, parameter, year, festival, phase)`. Every tool result includes `source_page` and the report URL.
- System prompt: answer only from tool results, cite year and page, say "not in the data" when a tool returns nothing, no causes, no health claims.
- Loop: at most 4 tool rounds, 25 s per question. The final text goes through the Claim Guard with allowed numbers = `facts.allowed_numbers` plus the numbers present in that turn's tool outputs.
- Cerebras docs say not to combine `tools` and `response_format` in one request. We use tools only here and structured outputs only in U1.
- Confirm tool calling works with the chosen model in the M0 smoke test; if it does not, hide the tab and cut U2.

### 7.4 Use case U3: honest status badge
UI shows provider, model ID and the measured wall-clock time of the last call (for example "Cerebras, gpt-oss-120b, 1.2 s"). It is measured, never hardcoded. When AI is off the badge says "AI off, standard text".

### 7.5 Config (`config.yaml`)
```yaml
llm:
  provider: cerebras        # cerebras | none
  models:
    brief: gpt-oss-120b     # set after the M3 bake-off
    ask: gpt-oss-120b
    fast: qwen-3.8-27b
  n_candidates: 3
  temperature: 0.3
  timeout_s: 20
  max_retries: 2            # on 429 / 5xx with exponential backoff
  max_tool_rounds: 4
  cache: true               # key = sha256(facts + lang + model + prompt_version)
```

### 7.6 Reliability rules
- `401` or missing key: switch to template mode and show "AI off"; never crash.
- `429`: back off and retry up to `max_retries`, then template. Cap concurrent threads at `n_candidates`.
- `404` model not found: log, template, fix the ID in config.
- Timeout over `timeout_s`: template.
- Cache LLM results so demo reruns do not re-spend rate limit.
- Pre-generate and commit nothing secret: for the recording, run once with a key and keep the output in the cache file excluded from git.
- **Guard runs on every output, template or LLM.** It extracts numerals (including Devanagari digits, normalized), checks each against `allowed_numbers`, and scans for banned phrases (list in `config.yaml`, English and Hindi; reviewed by the Hindi owner). On failure the app shows the template version and logs the reason.
- UI badge: "N numbers verified against data, 0 health claims".
- **Security and privacy:** no keys in code. `.env.example` lists names only (`CEREBRAS_API_KEY`, `LLM_PROVIDER`). `.env` and the LLM cache file are in `.gitignore`. Only `facts.json` (public data, no personal data) and the officer's typed question leave the machine. The hosted demo either has no key (template mode) or reads it from the host's secrets store; never print or log it. CI greps for key patterns.

## 8. Non-functional requirements

| Area | Requirement |
|---|---|
| Run | Fresh clone: `python -m venv`, `pip install -r requirements.txt`, `streamlit run app.py` (5 steps or fewer in README) |
| Offline | Core product works with no network except for opening PDF links. AI features need network and `CEREBRAS_API_KEY` |
| AI latency | Target: brief with N candidates plus guard under 10 s end to end; hard fallback to template at `timeout_s` (20 s). Measured and shown, not promised |
| Performance | All computation under 2 seconds on a laptop (1,524 rows; 16 scenarios) |
| Determinism | Same input gives same ranking; no randomness |
| Accessibility | Phone-width usable; readable font sizes; Devanagari font stack (`Noto Sans Devanagari`, system fallback) |
| Security | No secrets, no PII, no writes to disk beyond optional exports the user triggers |
| Privacy | The intake CSV is processed in memory only |
| Maintainability | Type hints on public functions; each module under about 200 lines; thresholds in config |

## 9. Test plan (acceptance list)

| ID | Test | Expect |
|---|---|---|
| T1 | Count DO readings below 5 | 42 of 116 (or documented reason for any difference) |
| T2 | Count BOD readings above 3 | 100 of 112 (same rule) |
| T3 | BDL / ND rows | status BDL / ND; not zero, not NaN-dropped silently |
| T4 | `*`, `**`, `not sampled` | NOT_SAMPLED; excluded from P; never counted as pass |
| T5 | Boundaries | DO 5.0 passes; BOD 3.0 passes; pH 6.5 and 8.5 pass |
| T6 | Score determinism | Two runs identical |
| T7 | Missing never lowers score | Replacing a failing reading with NOT_SAMPLED changes coverage, not the passing share |
| T8 | Evidence | Every displayed number maps to a row with `source_page` |
| T9 | Guard | Injected fake number fails; clean text passes; health phrase fails |
| T10 | Diagnosis | Hand-built cases for each tag |
| T11 | Intake | Bad site / phase / value rejected with a clear message |
| T12 | Config | Changing a weight changes the score without code edits |
| T13 | LLM happy path (mocked Cerebras client) | Valid strict-schema JSON renders into the brief; meta source = cerebras |
| T14 | LLM returns a fake number | Guard rejects, one repair try, then template fallback |
| T15 | Mocked 429 and timeout | Backoff, then template; no exception reaches the UI |
| T16 | No `CEREBRAS_API_KEY` | `get_client` returns None; "AI off" badge; template brief |
| T17 | `BRIEF_SCHEMA` | `additionalProperties: false` on every object; arrays have `items`; no `pattern`, `format`, `minItems`, `maxItems` |
| T18 | Ask-the-data tools | Every number returned by a tool exists in the DataFrame; every result has `source_page` |
| T19 | Ask-the-data answer with an injected number | Guard rejects it |
| T20 | Secret scan | No key-like strings in the repo or in committed cache files |
| T21 | Live smoke test (manual, M0) | `scripts/cerebras_smoke.py` gets a reply for each model ID in config and one tool call |

Manual: 10 random rows checked against the PDFs; 5 evidence links opened; brief read aloud by the Hindi owner.

## 10. Deployment

- Primary: local run from the repo.
- Backup: hosted Streamlit app from the public repo. Template mode by default; if a Cerebras key is added through the host's secrets store, keep a small request cap and never print the key.
- CI: GitHub Actions runs `pytest -q`.
- Release: tag `v0.1-impact-lab` at submission.

## 11. Technical risks and decisions

| Risk / decision | Choice |
|---|---|
| Scoring weights are subjective | Config + robustness view + say so in README |
| Hindi PDF generation | Skipped; HTML + print + WhatsApp text |
| PDF page anchors depend on the viewer | Test; fallback text "open PDF, page N" |
| Rani Kamlapati / Kamla Park ambiguity | Keep one standard name as in data; flag medium confidence; optional split by festival in a toggle |
| Statewide file is unchecked | Not used for ranking; mentioned as future work |
| Repeated constant metal values | Flag, do not interpret |
| LLM drift or invented content | Strict schema + deterministic Claim Guard + template fallback; we never use an LLM to verify an LLM |
| Cerebras rate limit (free tier), outage or key issue at demo | Template mode is the complete product; cache; pre-recorded demo as backup |
| Model IDs change | IDs in config; smoke test at M0 and again at 3:30 |
| Hindi quality from the model is unknown | Bake-off + native review; Hindi template path always available |
| Tool calling not working for the chosen model | Cut U2; U1 and the core are unaffected |
| Key leaked in repo | `.gitignore`, CI secret grep, README check, rotate the key after the event |
| Coordinates | Manual, approximate, source noted; map is cuttable |
