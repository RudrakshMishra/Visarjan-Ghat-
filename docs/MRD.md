# MRD: Ghat Watch (Track 2, Visarjan Ghat Watch)

Market / user-need requirements for a hackathon build offered to the Government of Madhya Pradesh through MPSeDC. Date: 11 October 2026. Companion docs: `PRD.md`, `TRD.md`, `IMPLEMENTATION_PLAN.md`.

Scope note: this is a needs and context document, not a commercial market study. We do not quote market-size figures because the pack contains none and we will not invent them.

## 1. Purpose

Show that there is a specific, time-bound, unmet need for a tool that turns buried water-test reports into an actionable ghat risk ranking, who has that need, how the tool would reach them, and what it must prove to be trusted.

## 2. Trigger and timing

- **Durga visarjan: 20 October 2026**, nine days after this event.
- **NGT** has banned immersion in the Upper and Lower Lakes, and **BMC** is building new dedicated ghats (Free Press Journal, 26 Feb 2026). Planning for which ghats to use, clean and monitor is happening now.
- MPPCB already tests three times per festival (before, during, one week after) and publishes reports, so the data exists; the usable analysis does not.

## 3. Stakeholders

| Stakeholder | Role | Need | Influence |
|---|---|---|---|
| BMC officer (primary user) | Plans Durga visarjan at the ghats | Defensible ranking, what to do where, forwardable brief | Decides cleaning, aeration, testing |
| MPPCB | Collects and publishes test data | Correct use of its data; traceability to its reports | Source of truth |
| MPSeDC | State IT agency receiving open-source work | Readable, runnable, maintainable code | Gateway to adoption |
| NGT / CPCB (context) | Immersion order; water-quality limits | Tool should respect their framing | Defines the limits we compare against |
| Jury (event) | Organisers + a department officer or domain expert | Impact the week after, honesty | Scores us |

## 4. The need, in evidence

From the problem statement and data pack:
- Results are in PDFs of 90 to 120 pages each (2023, 2024, 2025) and nobody compares them with legal limits or across years.
- Dissolved oxygen at Bairagarh (Sant Hirdaram) kund read 0 mg/l four times across 2023 and 2025.
- 42 of 116 DO readings are below the Class B limit of 5 mg/l.
- 100 of 112 BOD readings are above the Class B limit of 3 mg/l.
- Today's decision-making basis: the officer's memory.

Gaps that make a naive tool misleading (and therefore create room for a careful one):
- Units are not printed in the reports.
- Blank means "not sampled", not "clean"; some ghats were sampled only during immersion.
- BDL means below detection limit, not zero and not missing.
- Only four metals were tested.
- One site name may cover two places.
- Two ghats lack a Durga 2025 table.

## 5. Target users and segments

| Segment | Today | Fit for v1 |
|---|---|---|
| BMC officer planning Durga visarjan at the 7 tracked Bhopal ghats | PDFs + memory | Primary. Build for this one person |
| BMC officers planning for new ghats after the NGT order | No test history at new sites | Partial: tool flags "no data, test first" and provides a sampling checklist |
| Other MP urban bodies (about 100 sites per festival appear in the statewide file) | Same PDFs | Later; statewide data is less checked (879 rows need a site check) |
| Citizens, media, researchers | Not our user | Out of scope |

## 6. Alternatives the user has today

| Alternative | Why it falls short for the officer |
|---|---|
| Reading MPPCB PDFs manually | 90 to 120 pages each; no cross-year view; no limits applied; no one does it |
| Memory / experience | Cannot be defended or forwarded; misses ghats with sparse data |
| Generic BI dashboards on the CSV | Treat blanks and BDL wrongly unless carefully handled; no plain-words reasons; no Hindi brief; not traceable to a report page |
| Other hackathon teams (assumed) | Likely a ranked dashboard, a map, an LLM summary. Risk: weak traceability, missing data shown as clean, health claims, English-only brief |

## 7. Value proposition

For the BMC officer who must decide where to send cleaning, aeration and testing before 20 October, **Ghat Watch** is a one-workflow tool that ranks the 7 ghats against CPCB Class B limits, says whether each problem is chronic or event-linked, shows exactly what was never measured, links every number to the MPPCB report page, and writes a Hindi and English brief that cannot contain a number or health claim that is not in the data. AI wording and question answering run on Cerebras inference, and every AI output must pass the same checks as the standard text.

## 8. Needs and requirements derived from the market

| Need | Requirement | PRD ref |
|---|---|---|
| Decide where to act | Ranked list with action tags (aerate / clean / test) | F1, F6 |
| Defend the decision | Evidence for every number, report and page | F2 |
| Not be misled by gaps | Coverage matrix; missing never clean | F3 |
| Communicate quickly | Hindi + English one-page brief, WhatsApp text | F4 |
| Trust the tool | Claim Guard, robustness, hindcast, honest limits panel | F5, F8, F9 |
| Use it after the event | Runs without API key; 2026 intake; open source MIT | F10 |
| Get wording help without risk | Cerebras-generated brief wording behind the Claim Guard, template fallback | F12 |
| Ask a quick question | Q&A on fixed dataset tools with page citations (Cerebras tool calling) | F13 |

## 9. Adoption path

1. Public GitHub repo with MIT licence (required by the event; offered to the department).
2. Organisers connect winning teams with department officers after the event.
3. Day-one use: officer runs the tool locally or via a hosted link, uses the testing checklist for Durga 2026 sampling.
4. Week-after: officer or MPPCB fills the intake template with 2026 results; ranking updates.
5. Later: extend to other sites using the statewide file after its site names are checked.

Dependencies: MPPCB data continues to be published as PDF reports; a person on the BMC or MPSeDC side can run a Python app or open a hosted link. A Cerebras API key is needed only for the AI features (Cerebras docs describe a free tier with lower rate limits).

## 9a. Constraints that shape the product

- Public data only; no live government system; no personal data.
- No health-effect claims (the data does not show them).
- Units assumed; four metals only; units must be disclosed.
- Event rules: code written from 10:15 AM, repo public by 5:00 PM, teams of 4 to 5.
- Event rule 2 allows Cerebras inference APIs. We name Cerebras in the README as an external service. AI features need a key; the core tool does not.

## 10. Success measures (market view)

| Horizon | Measure |
|---|---|
| At the event | Jury scores on day-one impact (x2), product, idea, demo clarity; jury checklist items met |
| Day one | Officer can open the tool and get a ranked list, evidence and brief with no setup beyond the README |
| Week after | Testing checklist used for Durga 2026; 2026 readings loaded; brief forwarded |
| Month after | Department or MPSeDC forks or runs the repo; issues opened by non-team users |

## 11. Risks to adoption

| Risk | Impact | Mitigation |
|---|---|---|
| Officer distrusts a ranking built on judgment weights | High | Show formula, put weights in config, show robustness across 16 scenarios |
| Data gaps make ranking look more certain than it is | High | Confidence labels; "Unknown, test first" overrides apparent safety |
| Hindi wording is off | Medium | Native-speaker review; template mode; short sentences |
| Department cannot run Python | Medium | Hosted link + recording; README in 5 steps |
| New ghats have no data | Medium | Explicit "no data" note and sampling checklist |
| Misuse of results as health or legal findings | High | Banned-phrase guard; "what this does not tell you" section |
| Department has no Cerebras key or loses access | Medium | The template-mode tool is the complete product; AI is an add-on |
| AI text misstates or invents | High | Strict schema, deterministic Claim Guard, template fallback; no LLM verifies an LLM |
| Free-tier rate limits during heavy use | Low to Medium | Caching; fallback to template; paid tier or dedicated key if adopted |

## 12. Open items to confirm with a mentor or officer on the day

- Is Class B the right designated-use class for immersion ghats? We assume yes and test Class C in robustness.
- Which ghats will actually be used on 20 October, given the NGT order?
- Preferred forwarding channel (WhatsApp text, PDF, email) for the brief.

Sources: Participant guide and data dictionary in `bhopal-impact-lab-2026-problem-statements`, Track 2; MPPCB visarjan reports 2023 to 2025; CPCB water quality criteria; Free Press Journal, 26 Feb 2026; Drik Panchang for the Durga visarjan date.
