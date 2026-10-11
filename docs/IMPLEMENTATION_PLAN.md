# Implementation Plan: Ghat Watch (Track 2, Visarjan Ghat Watch)

Claude Impact Lab x Cerebras Café Compute, Bhopal, Sunday 11 October 2026.
Build window: 10:15 AM to 5:00 PM IST. This plan starts at 12:20 PM and ends at 5:00 PM (about 4h40m left).
Companion docs: `PRD.md` (what), `MRD.md` (why / market), `TRD.md` (how).

## 0. The one-line plan

Build a Streamlit tool in Python that ranks the 7 Bhopal ghats by water-quality risk against CPCB Class B limits, tells the BMC officer whether each problem is chronic or event-linked, shows exactly which readings are missing, links every number to the MPPCB report page, and produces a forwardable Hindi + English brief that cannot contain a number or health claim that is not in the data. An optional AI layer on **Cerebras inference** writes the brief wording (best of 3 candidates, strict JSON schema) and answers questions through fixed tools; the Claim Guard decides what is shown and the template brief is the fallback.

## 1. Ground rules (read once, obey all day)

1. Code is written after 10:15 AM only. Libraries, frameworks and our own general tools are fine.
2. Data comes from the pack. No scraping of or login to any government portal. Linking to a public PDF URL in the UI is fine; downloading it by script in the app is not.
3. AI agents never invent numbers, coordinates, limits or page numbers. Every number in the product comes from `bhopal_ghats_2023_2025.csv` or `cpcb_water_quality_criteria.csv`.
4. A blank / `not sampled` / `*` / `**` is missing, never clean. `BDL` and `ND` are very low, not zero and not missing.
5. No health-effect claims. We report readings against limits.
6. No API keys in the repo. `.env` only, `.env.example` committed.
7. The app must work with no API key (template mode). Cerebras inference only improves wording and powers Ask-the-data; every AI output passes the Claim Guard or is discarded. Model IDs come from `config.yaml`, never hardcoded.
8. One workflow, one user, one outcome. No portal, no login, no database.

## 2. Team roles (assumes 4 to 5 people; merge roles if fewer)

| Role | Owner works on | Human-only duties (do not delegate to AI) |
|---|---|---|
| R1 Data/Scoring lead | `loader.py`, `rules.py`, `scoring.py`, `diagnosis.py`, `coverage.py`, tests | Verify 10 random rows against the PDFs; sign off the 42/116 and 100/112 test |
| R2 App/UX lead | `app.py`, charts, layout, map | Click through the demo path 5 times; check phone-width view |
| R3 Brief/Cerebras lead | `facts.py`, `brief.py`, `guard.py`, `llm.py`, `scripts/cerebras_smoke.py`, templates | Create the Cerebras key at M0 (or get event credits); own the Claim Guard rules; run the Hindi/English model bake-off; run the brief on all 7 ghats |
| R4 Language + domain | Hindi templates, plain-words reasons, NGT/CPCB notes | Native-level Hindi review of every sentence; fill `ghat_coordinates.csv` from OpenStreetMap or Google Maps manually |
| R5 QA + submission (or R4 doubles) | README, LICENSE, CI, demo script, recording | Fresh-clone test on a second laptop; secrets scan; submit form |

## 3. How we use AI agents without chaos

Dev tools: Claude Code (one session per module), Claude (chat) for reviews and Hindi wording.
Runtime AI in the product: Cerebras inference API (`cerebras_cloud_sdk`, key in `CEREBRAS_API_KEY`). Models seen in the Cerebras catalog on 11 Oct 2026: `gpt-oss-120b`, `qwen-3.8-27b` (IDs live in config; re-check at M0).

**Setup (R5, 10 min):** create repo `visarjan-ghat-watch`, add `CLAUDE.md` (content in section 8), copy data files into `data/`, commit this plan and the PRD / MRD / TRD into `docs/`.

**Parallel work with git worktrees** (one agent per module, no file overlap):

```
git worktree add ../gw-data     -b feat/data
git worktree add ../gw-score    -b feat/scoring
git worktree add ../gw-app      -b feat/app
git worktree add ../gw-brief    -b feat/brief
```

**Contract first:** the function signatures and the `facts.json` schema in `TRD.md` section 6 are the contract. Agents code to the contract, so the app agent can build against a stub `facts.json` before scoring exists.

**Agent loop for every module:**
1. Plan mode: agent reads `CLAUDE.md` + the TRD section and proposes steps.
2. Tests first: agent writes pytest cases from the TRD acceptance list.
3. Implement until tests pass.
4. Human review of the diff (5 min max). Merge to `main` at milestone checkpoints only.

**Prompt templates (paste, then fill the brackets):**

- Module agent: "Read CLAUDE.md and docs/TRD.md section [N]. Implement `[file]` exactly to the signatures in TRD section 6. Write tests in `tests/test_[x].py` first. Do not touch files outside `[file list]`. Do not invent any data. Run pytest and report failures."
- Review agent: "Review this diff against CLAUDE.md rules 1 to 8 and TRD section [N]. List violations only, each with file and line. Check specifically: missing treated as clean, BDL treated as zero, any hardcoded number."
- Hindi agent: "Translate the English brief template to plain Hindi for a municipal officer. Keep every `{placeholder}` untouched. Do not add or remove numbers. Avoid health claims. Output only the template."

## 4. Timeline (IST) with deliverables and exit checks

### M0: Kickoff, 12:20 to 12:45
- Lock decisions: Class B for scoring, ranking default = Ganesh + Durga combined with a festival filter, ref year 2026 (TRD section 5).
- Repo, `CLAUDE.md`, data copied, venv, `pip install -r requirements.txt` (includes `cerebras_cloud_sdk`), CI stub.
- R3: get a Cerebras API key (Cloud Console, or ask organisers about credits), set `CEREBRAS_API_KEY` in `.env` (never committed), run `scripts/cerebras_smoke.py`: one reply per model ID, one tool-call test, latency printed. If tool calling fails for the model, note it now and plan to cut Ask-the-data.
- Assign roles and worktrees.
- Exit check: `streamlit run app.py` shows an empty page on every laptop.

### M1: Data core, 12:45 to 1:45
- R1 + agent: `loader.py` normalizes the CSV (status = MEASURED / BDL / ND / NOT_SAMPLED), `rules.py` loads CPCB limits.
- Tests T1 (42 of 116 DO below 5), T2 (100 of 112 BOD above 3), T3 (BDL not zero, not missing). If counts differ, find out why (boundary handling, duplicates) before moving on.
- R2 + agent: Streamlit skeleton with tabs and a stub `facts.json`.
- R4: Hindi/English template drafts; start `ghat_coordinates.csv`.
- Exit check: T1 to T3 green; skeleton renders the stub ranking.

### M2: Scoring, diagnosis, coverage, 1:45 to 2:45
- R1 + agent: `scoring.py`, `diagnosis.py` (chronic vs event-linked), `coverage.py` (missing-data matrix).
- R2: ranking table, ghat detail charts with limit lines, evidence panel with PDF page links.
- R3: `facts.py` assembling `facts.json` from the real functions.
- Exit check: real ranking of 7 ghats on screen; clicking a number opens the right PDF page (test 5 numbers by hand).

### M3: Brief + Claim Guard + export, 2:45 to 3:30
- R3 + agent: `brief.py` (template mode) and `guard.py` first (needed for everything else); WhatsApp text, copy button, downloadable HTML (print to PDF from browser).
- R3 + agent, right after the guard is green: `llm.py` with Cerebras: strict JSON-schema output, 3 parallel candidates, first guard-passing one wins, one repair try, backoff on 429, 20 s timeout, cache, template fallback, AI status badge. Mock the client in tests T13 to T17.
- 3:00 bake-off (10 min): Hindi + English brief from `gpt-oss-120b` and `qwen-3.8-27b`; R4 picks the default model in `config.yaml`.
- R5 + agent: `askdata.py` tools (pure pandas functions + tests T18). The Cerebras tool loop is wired in M4 only if the smoke test showed tool calling works.
- R4: review Hindi on all 7 ghats and the top-3 brief.
- R2: coverage tab + Durga 2026 testing checklist.
- R1 + agent (starts as soon as `scoring.py` is merged): `robustness.py` and `hindcast.py`. They depend only on scoring, so they run in parallel with the brief work.
- Exit check: brief passes the guard with the badge showing; guard rejects an injected fake number in a test.

### M4: Stand-out features, 3:30 to 3:50 (only if M3 exit check passed)
Robustness and hindcast code already exists from M3, so this slot is wiring and polish. In priority order, stop when the clock says 3:50:
1. Show robustness (16 scenarios) with the stability column in the Method tab.
2. Show the hindcast panel (rank from 2023-24, compare with 2025).
3. Ask the data on Cerebras tool calling (tool loop + guard; 5 fixed tools already built in M3).
4. 2026 intake (CSV upload, validation, re-rank in session).
5. Resource allocator (only if everything else is done; default is to skip).

### FREEZE at 3:50. Only bug fixes and docs after this.

### M5: Ship, 3:50 to 4:30
- R5: README (5-step run, what works / what doesn't, extra data with links), LICENSE (MIT), `.env.example`, secrets scan (`git grep -i "api_key\|secret"`), CI green.
- Deploy hosted demo (Streamlit Community Cloud or similar) as a backup link. Local run stays the source of truth.
- Fresh-clone test on a second laptop following the README literally.
- 4:00 record the 2-minute screen recording when the room reminder goes out (demo script in section 6).
- Repo public. Submit form at 4:30, not at 4:59.

### Buffer 4:30 to 5:00
Fix a broken link, re-record if needed, double-check the form submission.

## 5. Cut lines (decide by the clock, not by feeling)

| If at... | Then drop |
|---|---|
| 2:45 and M2 exit check not met | Map, robustness, hindcast, intake, Ask-the-data, Cerebras brief wording (template brief stays) |
| 3:30 and M3 exit check not met | Everything in M4 |
| 3:50 | Anything unfinished. Hide the tab; do not ship half-working features |

Never cut: evidence links, missing-data matrix, Claim Guard, Hindi brief, README honesty section, tests T1 to T3.

## 6. Demo plan (6 min presentation + 4 min Q&A; 2-min recording)

| Time | Beat |
|---|---|
| 0:00 to 0:30 | Problem: 7 ghats, 3 years of tests buried in 90 to 120 page PDFs; Durga visarjan 20 Oct |
| 0:30 to 0:45 | User: the BMC officer who decides where to send cleaning, aeration and testing |
| 0:45 to 2:15 | Live: ranking, then the top ghat. Show chronic vs event-linked tag, click a number, PDF opens at the page |
| 2:15 to 3:15 | Missing data: coverage matrix shows Bairagarh and Malikhedi have no pre/after readings; the tool says "Unknown, test first", never "clean"; Durga 2026 testing checklist |
| 3:15 to 4:00 | Brief in Hindi and English written live by Cerebras (badge shows model and measured time), Claim Guard badge, show one rejected bad candidate in the log, WhatsApp copy; ask one question in Hindi and get an answer with page citations |
| 4:00 to 4:45 | Trust: robustness ("top-3 in X of 16 scenarios") and hindcast, reported honestly |
| 4:45 to 5:30 | What does not work yet; what the department can do on day one |
| 5:30 to 6:00 | How the officer feeds in the 2026 results next week |

Recording (2 min): skip the problem intro; do ranking, evidence click, coverage matrix, brief + badge.

## 7. Risk register

| Risk | Likelihood | Mitigation |
|---|---|---|
| 42/116 or 100/112 do not reproduce | Medium | Investigate boundaries (`<5`, `>3`), duplicates, status mapping; report any residual difference in README |
| PDF `#page=N` anchors do not open the right page | Medium | Test 5 links by hand at M2; fall back to "open PDF, go to page N" text |
| Hindi PDF rendering breaks | High | Do not use PDF libraries today. HTML download + browser print + WhatsApp text |
| Cerebras API down, key missing or rate-limited (429) at demo | Medium | Template mode is the complete product; cache; backoff + 20 s timeout; recording as backup |
| Cerebras model IDs changed or tool calling not working | Low to Medium | IDs in config; smoke test at M0 and at 3:30; cut Ask-the-data if needed |
| Model Hindi is poor or invents content | Medium | Bake-off + native review; Claim Guard; template Hindi stays available |
| API key leaked in repo | Medium | `.env` + `.gitignore`, `git grep` before push, CI grep, rotate key after the event |
| Streamlit hosting fails | Medium | Local run is primary; recording is the backup |
| Agents edit each other's files | Medium | Worktrees + file ownership + merge only at checkpoints |
| Scoring weights look arbitrary to judges | High | Say they are judgment-based, put them in `config.yaml`, show the robustness view |
| Suspicious repeated constants (chromium 0.03, lead 0.031) | Medium | Flag as "possible placeholder, verify in report"; never interpret |
| Coordinates wrong | Medium | Label "approximate location"; R4 sets by hand; map is P1 and cuttable |
| Running out of time | High | Cut lines in section 5 |

## 8. CLAUDE.md (paste into repo root)

```
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
```

## 9. Submission checklist (R5 owns)

- [ ] Repo public on GitHub by 4:30 PM
- [ ] `README.md`: team name, members, track, the one user, 5-step run, what works / what doesn't, extra data with links
- [ ] `LICENSE` (MIT)
- [ ] No keys or secrets (`git grep` check done, including `CEREBRAS_API_KEY` and any LLM cache file)
- [ ] README names Cerebras inference as an external service and states what is sent (`facts.json` and typed questions only)
- [ ] App verified in both modes: with a key, and with no key ("AI off")
- [ ] CI green; `pytest -q` passes on a fresh clone
- [ ] Docs in `docs/`
- [ ] Recording of 2 minutes or less uploaded
- [ ] Submission form filled with repo link (+ recording)
