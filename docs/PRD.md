# PRD: Ghat Watch (Track 2, Visarjan Ghat Watch)

Status: hackathon build, 11 October 2026. Owner: team lead. Companion docs: `MRD.md`, `TRD.md`, `IMPLEMENTATION_PLAN.md`.

## 1. Summary

Every Ganesh and Durga festival, MPPCB tests water at Bhopal's idol-immersion ghats before, during and one week after immersion. The results sit in 90 to 120 page PDFs that nobody lines up against legal limits or compares year to year. Ghat Watch turns three years of those tests (7 ghats, 1,524 readings, 2023 to 2025) into a ranked, explained, traceable risk list and a forwardable Hindi + English brief for the officer who plans Durga visarjan on **20 October 2026**. An optional AI layer on **Cerebras inference** writes the brief wording and answers the officer's questions, but every AI output must pass the same number and claim checks as the standard text, and the full product works without it.

## 2. User

**One user:** the Bhopal Municipal Corporation (BMC) officer who plans Durga visarjan at the ghats. They decide where to send extra cleaning, aeration and water testing. Today they decide from memory.

Officer needs: a ranking they can defend, plain-words reasons, a way to check any number in the source, honesty about missing data, and something short to forward (often via WhatsApp or email).

Not our user: citizens, MPPCB scientists, journalists. We do not build a portal.

## 3. Problem evidence (from the problem statement)

- Bairagarh (Sant Hirdaram) kund: dissolved oxygen read 0 mg/l four times across 2023 and 2025.
- 42 of 116 dissolved-oxygen readings are below 5 mg/l (CPCB Class B bathing limit: 5 or more).
- 100 of 112 BOD readings are above 3 mg/l (Class B limit: 3 or less).
- NGT has banned immersion in the Upper and Lower Lakes; BMC is building new ghats (per Free Press Journal, 26 Feb 2026).

## 4. Goals and non-goals

### Goals (what success means this week)
G1. The officer gets a ranked list of all 7 ghats with plain-words reasons.
G2. Every number is traceable to report year and PDF page in one click.
G3. Missing data is visible and never reads as "clean".
G4. A one-page brief in Hindi and English can be forwarded without editing.
G5. The tool tells the officer what to do next: which ghats to clean, aerate, or test, and which readings to collect.

### Non-goals
- No health-effect claims, no pollution-source attribution, no prediction of future readings.
- No live government system connection, no scraping, no login.
- No statewide ranking (statewide data is less checked); possible later.
- No user accounts, database, or portal.

## 5. Core workflow (one workflow, one outcome)

1. Officer opens the app (local or hosted link). No login, no API key needed.
2. Sees the **ranked list** of 7 ghats with score, confidence label and a one-line reason.
3. Opens a ghat: sees readings vs limits per phase, the **chronic vs event-linked** tag, and the **evidence** (year, festival, phase, report page link).
4. Checks the **coverage matrix**: what was measured, BDL, not sampled, or table absent.
5. Opens the **brief**, picks Hindi or English, copies WhatsApp text or downloads the HTML (print to PDF).
6. (Later) Uploads the 2026 readings CSV; the ranking updates.

## 6. Scope, MoSCoW

| ID | Feature | Priority |
|---|---|---|
| F0 | Data loader with correct status handling (MEASURED / BDL / ND / NOT_SAMPLED) | Must |
| F1 | Ranked list of 7 ghats, CPCB Class B (DO, BOD, pH), transparent score | Must |
| F2 | Evidence panel: every number with year, festival, phase, page, PDF link | Must |
| F3 | Missing-data coverage matrix + "Unknown, test first" flag | Must |
| F4 | Hindi + English one-page brief (template mode), WhatsApp text, HTML export | Must |
| F5 | **Claim Guard**: every number in the brief verified against data, health-claim phrases blocked, badge shown | Must |
| F6 | **Chronic vs event-linked diagnosis** per ghat and parameter | Must |
| F7 | **Durga 2026 testing checklist** (which readings to collect, per ghat, per phase) | Should |
| F8 | **Ranking robustness** across 16 scenarios; rank range and top-3 count | Should |
| F9 | **Hindcast**: rank from 2023-24, compare with 2025 observations | Should |
| F10 | **2026 intake**: upload CSV in the same schema, validate, re-rank in session | Could |
| F11 | Map with approximate ghat locations | Could |
| F12 | **Cerebras-powered brief wording** (strict JSON schema, 3 candidates, first one that passes Claim Guard wins, template fallback) | Should |
| F13 | **"Ask the data"** Q&A on Cerebras tool calling over 5 fixed dataset-only tools, answers cite year and page, guarded | Could |
| F15 | AI status badge: provider, model, measured response time, or "AI off" | Should |
| F14 | Resource allocator (officer enters crews/aerators, tool assigns) | Won't unless everything else is done |

## 7. Functional requirements

**FR-1 Ranking.** Score 0 to 100 per ghat from severity, persistence and event jump (formula in TRD section 5). Default view combines Ganesh and Durga, 2023 to 2025; filter by festival and year. Ties broken by worst DO reading.

**FR-2 Confidence.** Each ghat shows coverage % of expected scored cells (DO, BOD, pH x 3 phases x available festival-years) and a label: High (80% or more), Medium (50 to 79%), Low (below 50%). Low coverage adds the tag "Unknown, test first" regardless of score. Missing data never lowers a score.

**FR-3 Reasons in plain words.** Each rank has a sentence built from facts, for example: "Dissolved oxygen was 0.0 mg/l during Ganesh 2025 (limit 5 or more). Before and after readings were not sampled." No causal or health language.

**FR-4 Evidence.** Clicking any number shows: value as printed, parameter as printed, unit assumed, year, festival, phase, source page, and a link to the public MPPCB PDF at that page.

**FR-5 Chronic vs event-linked.** For each ghat x parameter (DO, BOD, pH) and festival-year, tag one of: Chronic (fails before immersion), Event-linked (passes before, fails during), Persisting (fails one week after), Transient (fails during, passes after), No baseline (before missing, so cannot classify), OK. Wording says "event window", never "caused by".

**FR-6 Metals watch.** Chromium, lead, zinc and copper have no Class B limit. Show readings, BDL as "below detection limit", and a "metals watch" flag when during is 3 or more times pre. Never label metals as "exceeds limit".

**FR-7 Brief.** One page, Hindi and English: headline, top 3 ghats with 1 to 2 lines each and page references, data gaps, suggested actions, and "what this does not tell you". Generated from `facts.json` only.

**FR-8 Claim Guard.** Before display: all numerals in the brief must exist in the allowed-number set from `facts.json`; blocked health phrases (English and Hindi lists) fail the text; on failure fall back to the template version. UI badge: "N numbers verified, 0 health claims".

**FR-9 Testing checklist.** For Durga 2026 (20 October): per ghat, list the phase and parameters that are missing from past years, with a suggested before / during / after schedule (after = one week later, about 27 October). Printable.

**FR-10 Robustness.** Re-rank across 16 scenarios (4 weight sets x recency on/off x Class B or C). Show rank range and "top 3 in X of 16".

**FR-11 Hindcast.** Compute ranking from 2023 and 2024 only; compare with severity from 2025 readings using top-3 overlap and rank correlation. Report whatever the result is, with the caveat that 7 ghats is a tiny sample.

**FR-12 Honest limits panel.** Always visible: units assumed, 4 metals only, Rani Kamlapati / Kamla Park may be two places, Bairagarh and Malikhedi have no Durga 2025 table, repeated constant metal values may be placeholders.

**FR-13 2026 intake (Could).** CSV with the same columns as the Bhopal file; validator rejects unknown sites, phases, parameters, and non-numeric values that are not one of BDL, ND, not sampled, `*`, `**`; re-rank in session only; nothing written anywhere.

**FR-14 Cerebras brief wording (Should).** If `CEREBRAS_API_KEY` is set and AI is on, generate the brief wording with Cerebras from `facts.json` only, using structured output. Generate 3 candidates, show the first that passes the Claim Guard; if none pass after one repair try, or on any error, rate limit, timeout or missing key, show the standard template text and the badge "AI off, standard text". The officer can always switch AI off.

**FR-15 Ask the data (Could).** A question box (Hindi or English). The model may call only five fixed tools (ranking, ghat summary, compare years, list missing, get evidence). The answer must cite year and report page, say "not in the data" when a tool returns nothing, contain no causes or health claims, and pass the Claim Guard. Example questions: "Which ghats have no baseline reading?", "How did Shahpura's BOD change between 2023 and 2025?", "Bairagarh ka DO kitna tha?".

**FR-16 AI transparency.** The UI shows which parts came from AI (brief wording, Q&A) and which are computed from data (scores, tags, numbers). The README states that Cerebras inference is an external service and what is sent to it (`facts.json` and typed questions only).

## 8. Screens (Streamlit tabs)

1. **Ranking** (home): table + one-line reasons + confidence + action tags.
2. **Ghat detail**: pre / during / after chart per scored parameter with limit line; diagnosis tags; metals table; evidence panel.
3. **Data coverage**: ghat x festival-year x phase grid with legend (Measured / BDL / Not sampled / Table absent) + testing checklist.
4. **Brief**: language toggle, preview, guard badge, copy WhatsApp, download HTML.
5. **Method & trust**: score formula, weights, robustness table, hindcast, limits panel.
6. **Ask the data** (if built): question box, answer with citations, guard badge, AI status badge.
7. **2026 intake** (if built).

## 9. Content and language rules

- Plain words, short sentences, no jargon without a one-line meaning (BOD, DO).
- Units shown with the note "units assumed, reports print none".
- Hindi reviewed by a native speaker before submission. Technical terms (DO, BOD, pH, CPCB) stay in English letters.
- Banned: any phrase asserting health effects, disease, safety for drinking or bathing, or pollution source.

## 10. Acceptance criteria

- A1. Pipeline reproduces 42 of 116 DO below 5 and 100 of 112 BOD above 3 (or explains any gap in README).
- A2. No ghat with missing readings is shown as clean; missing is grey "Not sampled".
- A3. 100% of numbers in the UI and brief have a page reference.
- A4. Guard test: injecting a fake number into the brief makes it fail.
- A5. Runs from a fresh clone in 5 steps or fewer without an API key.
- A6. Hindi and English brief each fit on one printed page.
- A7. README has "what works / what doesn't".
- A8. With no `CEREBRAS_API_KEY` the whole app works and shows "AI off".
- A9. With a key, a candidate containing an invented number is rejected and never shown; on a simulated 429 or timeout the standard brief appears.
- A10. Every Ask-the-data answer cites a report page or says "not in the data".
- A11. No key or secret appears in the repo; README names Cerebras as an external service.

## 11. Success metrics

Hackathon (jury): day-one impact (counts double), product polish, idea, demo clarity. Jury checklist for this track: ranking traceable, missing shown as missing, brief short and readable in Hindi and English, honest about gaps.

Week-after (real): officer opens the tool before 20 October; testing checklist used for Durga 2026 sampling; 2026 readings loaded into the template; brief forwarded at least once.

## 12. How we stand out (differentiators)

We assume most teams will build a ranked dashboard, a map and an LLM-written summary. We compete on trust and decision usefulness:

| # | Differentiator | Why judges care |
|---|---|---|
| D1 | Chronic vs event-linked diagnosis | Changes the action (baseline problem vs event-window spike); a real insight from the data |
| D2 | Coverage matrix + testing checklist | Turns "missing data" from a weakness into the next action |
| D3 | Claim Guard badge | Proves the brief cannot contain invented numbers or health claims |
| D4 | Robustness + hindcast | Honest evidence that the ranking is not arbitrary |
| D5 | 2026 intake + no-API-key run | Usable by the department the week after, not just at the demo |
| D6 | Guarded Cerebras AI: fast candidate generation where the deterministic guard, not the model, decides what is shown | Uses the event partner's inference meaningfully (speed makes best-of-3 and live Q&A practical) without trading away trust |

Rubric mapping: Day-one impact (x2) = D2, D5, WhatsApp brief. Product = ranking to evidence to brief in one flow. Idea = D1, D4. Clarity = one officer, one workflow, one demo path.

## 13. Open questions

- Which festival-years should the default ranking weigh? Default: all, with recency weights; officer can filter.
- Do the organisers provide Cerebras API credits, or do we use a free-tier key (lower rate limits)?
- Which Cerebras model gives the better Hindi? Decided by the 10-minute bake-off at M3 and native review.
- Are Rani Kamlapati ghat and Kamla Park kund one place? Unknown; flagged, not resolved.
- Which new BMC ghats will be used on 20 October? No data; shown as "no data, test first" note.
