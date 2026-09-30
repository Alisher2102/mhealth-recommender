# Project Brief

> **A Comparative Evaluation and Intelligent Recommendation System for Mobile Health Applications in Chronic Disease Self-Management**

_Master's dissertation project (MSc Software Engineering), module **Project Paper (122026-RJD)**.
This document is the single source of truth for scope, objectives, and technical direction._

> **Requirements baseline — updated 24 Sep 2026.** The programme constraints in §9 are no longer
> assumptions: they are taken from the **Project Paper Briefing dated 18 Sep 2026** (the current
> cohort authority) and the **APU Thesis/Dissertation Handbook v2.0**. Where the two sources
> disagree, the briefing wins and the conflict is logged in §9.3 for supervisor confirmation.
> University source documents are deliberately **not** stored in this repository.
>
> _Note: the briefing slides carry a `CT095-6-M-RMCE` footer, but RMCE (Research Methodology) is the
> earlier module — the briefing itself distinguishes "the same project of RMCE/RM" from "project
> paper". The module for this submission is **Project Paper (122026-RJD)**._

---

## 1. Introduction

The global burden of chronic non-communicable diseases continues to rise, and millions of
patients increasingly turn to mobile health (mHealth) applications to support day-to-day
self-management. However, the commercial mHealth marketplace is largely unregulated, and
research consistently shows that a substantial proportion of available applications fail to meet
acceptable quality or usability standards. Patients with conditions such as type 2 diabetes
(T2DM), hypertension, and COPD navigate thousands of applications with little reliable guidance
on which tools are genuinely effective.

This project addresses that gap by building a **web-based platform** that (1) captures expert
quality assessments of mHealth apps, (2) collects real user-perceived usability data, and
(3) applies a **weighted multi-criteria algorithm** to produce evidence-based, personalised app
recommendations for a given chronic condition.

---

## 2. Aim & Objectives

**Aim:** Design, develop, and evaluate an intelligent web-based recommendation system that
comparatively assesses mHealth applications for chronic disease self-management using a
weighted multi-criteria scoring algorithm.

**Objectives:**

1. Evaluate 15–20 mHealth apps using the **Mobile Application Rating Scale (MARS)** across three
   disease categories (T2DM, hypertension, COPD/respiratory).
2. Collect user-perception data from 30–50 online participants using the **System Usability
   Scale (SUS)** via the web platform.
3. Design a **weighted scoring algorithm** combining MARS and SUS scores with condition-specific
   weighting.
4. Implement a **personalised recommendation engine** that matches users to the most suitable
   app based on their condition and preferences.
5. **Validate** the recommendation output by comparing system-generated rankings against
   participant preferences (e.g. Spearman rank correlation).
6. **Assess the entrepreneurial value and commercialisation prospects** of the platform
   (market need, target segment, cost/benefit, adoption barriers, sustainability model).
   _Added 24 Sep 2026 to satisfy CLO2 and marking criterion C7 — see §2a._

### 2a. Assessment criteria (confirmed — briefing 18 Sep 2026)

Ten criteria, **10% each**. This is the grade; the phase table in §6 must serve it, not the
reverse.

| # | Criterion | Where it is earned | Current state |
|---|-----------|--------------------|---------------|
| C1 | Aim, objective, problem | Ch.1 | 🟢 Drafted (§2) |
| C2 | Background, literature review | Ch.2 | 🔴 Not started |
| C3 | Design / method | Ch.3 + `docs/ARCHITECTURE.md` | 🟡 Design documented, research method not |
| C4 | Findings / analysis of interpretation | Ch.4 | 🔴 Blocked on data collection |
| C5 | Results / conclusion | Ch.4–5 | 🔴 Not started |
| C6 | Validation | Ch.4 (Spearman vs. participant ranking) | 🔴 Planned only; not implemented |
| C7 | **Entrepreneurial value** | Ch.1/Ch.5 + Objective 6 | 🔴 **Absent — newly identified gap** |
| C8 | Ethical implications | Ch.3 + ethics appendix | 🟡 Technical controls only; no approval |
| C9 | Ethics and professionalism | Process evidence, logsheets | 🟡 Logsheets not started |
| C10 | Structure, references (APA) | Whole thesis | 🔴 Not started |

**Consequence:** software implementation is **not** a standalone criterion. Six of the ten criteria
(C1, C2, C4, C5, C7, C10) can be earned with no further code at all. Development effort beyond
what C3/C6 need is unmarked.

**Programme learning outcomes (CLOs):**

- **CLO1** — Investigate research problems critically by planning and managing domain-specific
  research effectively.
- **CLO2** — Justify **entrepreneur value and prospects** of the proposed solution based on the
  chosen specialism.
- **CLO3** — Follow ethical practice in undertaking the research project.

---

## 3. Target Users

| Tier | User | Need |
|------|------|------|
| Primary | Adults managing T2DM, hypertension, or COPD | Guidance on choosing effective, usable mHealth tools |
| Secondary | mHealth developers / software engineers | Findings to improve app design, usability, clinical relevance |
| Tertiary | Clinicians / healthcare practitioners | A reliable instrument to recommend apps with confidence |

---

## 4. System Components

**Component 1 — Admin Evaluation Module** _(researcher/admin only)_
Authenticated panel to create app records and enter MARS scores (23 items across 5 subscales).
Data persisted via the backend API.

**Component 2 — User Survey Module** _(participants)_
Public flow: consent → pick condition → try 3–5 apps → complete SUS (10 items per app) →
optionally rank preferred apps. Responses persisted per app.

**Component 3 — Recommendation Engine** _(the novel contribution)_
A weighted, configurable multi-criteria algorithm that normalises MARS and SUS to a common
scale, applies condition-specific weights, and produces a ranked list plus a personalised top
recommendation. Includes weight provenance and a sensitivity-analysis view.

---

## 5. Technical Direction

**Decision (confirmed): Node/Express + relational database** — chosen over a Firebase-only
approach to demonstrate genuine software-engineering depth (explicit data modelling, API design,
validation, testability).

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | React + Vite + Tailwind CSS | SPA; three route areas (public, survey, admin) |
| Backend | Node.js + Express (TypeScript) | REST API |
| Database | PostgreSQL (SQLite for local dev) | Same schema targets both; see `docs/DATABASE_SCHEMA.md` |
| ORM/Query | Prisma (recommended) | Type-safe models + migrations |
| Auth (admin) | JWT + hashed password (bcrypt) | Single admin role to start |
| Algorithm | TypeScript module (pure functions) | Unit-tested; see `docs/ARCHITECTURE.md` |
| Analysis | CSV export → Python/Excel/SPSS | For dissertation stats |
| Hosting | TBD (Render / Railway / Fly.io / VPS) | Postgres add-on available on all |

> Rationale for the DB choice is in `docs/DATABASE_SCHEMA.md`. Postgres is production-grade and
> shows proper relational modelling; SQLite keeps local development zero-config. Prisma lets us
> switch between them by changing a connection string.

---

## 6. Project Phases

Status vocabulary is deliberately stricter than "done": **Designed → Implemented → Verified**
(tested) **→ Approved** (ethics, where applicable) **→ Complete**. "Implemented" means the code
exists and compiles; it does **not** imply it has been tested.

| Phase | Task | Coding? | Status (24 Sep 2026, end of day) |
|-------|------|---------|----------------------------------|
| 1 | Select & shortlist 15–20 mHealth apps (18 seeded) | No | 🟡 Provisional — inclusion criteria, **store URLs**, version and availability evidence still missing (see §6c) |
| 2 | Score each app with MARS | No | 🔴 **Not started — now the top technical blocker** (see §6c.3); evaluator protocol undefined (§9.3) |
| 3 | Design architecture & DB schema | Light | 🟢 Designed — some documented components not built |
| 4 | Admin module (auth + MARS entry) | Yes | 🟡 Implemented; auth verified manually, MARS entry not yet exercised |
| 5 | Survey module (consent + SUS + storage) | Yes | 🟢 **Verified** — defects fixed, full participant flow exercised end to end (§6b) |
| 6 | Weighted ranking algorithm | Yes | 🟢 **Verified** — 24 unit tests passing; SUS score confirmed over HTTP |
| 7 | Recommendation engine (condition matching) | Yes | 🟡 Verified as *running*; output not yet meaningful without MARS data. "Personalisation" is still condition filtering only |
| 8a | **Participant survey UI** (consent → condition → SUS → ranking → debrief) | Yes | 🟢 **Implemented and walked end to end** (26 Sep) — consent copy still DRAFT pending ethics |
| 8b | Results / recommendation UI | Yes | 🟢 **Implemented and verified** (ADR-026) — suppresses the top pick when no app has sufficient data; weight controls deferred pending defect M1 |
| 8c | Admin MARS-entry UI | Yes | ⬜ Deliberately deferred — MARS can be entered via the API; a UI earns no marks (ADR-016) |
| 9 | **Ethics approval** (blocking gate) | No | 🔴 **Not started — blocks Phase 10** |
| 10 | Run survey with 30–50 participants | No | ⛔ Blocked by Phase 9 |
| 11 | Validation analysis (C6) | Light | 🔴 Not started — capture endpoint now exists (§6b) |
| 12 | Entrepreneurial value analysis (C7) | No | 🔴 Not started |
| 13 | Write dissertation (15,000–20,000 words) | No | 🔴 Not started |
| 14 | Recorded presentation + demo | No | 🔴 Not started |

### 6a. Defects found and fixed — 24 Sep 2026 ✅ RESOLVED

All three were found by code inspection, fixed, and confirmed working over HTTP the same day.
Retained here (rather than deleted) because the first one is directly relevant to the
data-integrity discussion in the methodology chapter.

1. **`server/src/lib/scoring/validationSusHelper.ts`** — the guard reads
   `if (error.length > 0)`, where `error` is the imported `console.error` **function**, not the
   local `errors` array. A function's `.length` is its declared-parameter count, so this condition
   is effectively never true: **invalid SUS input is never rejected**, and missing answers flow
   into `computeSusScore` as `undefined`, yielding `NaN` scores. This is a **data-integrity defect
   that would silently corrupt the study dataset**, not a cosmetic bug.
2. **`server/src/routes/survey.ts`** — `return res.json(201).json({ participantId })` is not the
   Express status API. It sends the literal body `201` and then throws `ERR_HTTP_HEADERS_SENT`, so
   participant registration never returns a usable participant ID.
3. **`server/src/routes/survey.ts`** — unused import of `JsonNull` from a Prisma *internal* path
   (`../generated/prisma/internal/...`); internal paths are not part of Prisma's public API and can
   break on minor upgrades.

No automated tests existed at the time, which is why defects 1–2 went unnoticed. Defect 2 was
independently spotted and fixed locally by the author before the repository fix landed.

### 6b. Verification record — 24 Sep 2026

Evidence for criterion C3 (design/method). Both layers were verified, and the distinction between
them matters: passing unit tests do **not** demonstrate that the API works.

**Unit tests — 24 tests, 6 suites, all passing** (`npm test`, Node 22.11.0):

| Suite | Covers |
|-------|--------|
| `mars.test.ts` (8) | Instrument bounds (1–5), per-subscale item counts, Section E exclusion (ADR-004), average-then-round precision (ADR-008) |
| `scoring.test.ts` (7) | SUS reference values — ideal 100, worst 0, neutral 50, and **all-1s / all-5s both 50** because item wording alternates |
| `validationSusHelper.test.ts` (9) | Rejection of missing items, out-of-range, non-integer, numeric strings, null and non-object bodies |

The ADR-008 test deliberately uses input where average-then-round (3.15) and round-then-average
(3.16) **disagree**, so it can actually fail if the rounding policy regresses.

**API verification — full participant flow exercised with `curl`:**

| Check | Result |
|-------|--------|
| `POST /api/participants` with consent | `201` + participant id |
| `POST /api/participants` without consent | `400` — consent gate enforced server-side (ADR-010) |
| `POST /api/survey/sessions` | `201`, 5 apps assigned in randomised order |
| `GET /api/survey/sessions/:id` | Apps hydrated in stored presentation order, progress reported |
| `POST /.../sus` with valid answers | `201`, `susScore` **77.5** — matching the value predicted by hand from Brooke's formula |
| `POST /.../sus` with `q1:99` and 8 items missing | `400` listing exactly 9 offending items, correctly **accepting** the one valid item |
| `POST /.../preferences` with a partial ranking | `400` — incomplete orderings refused |
| `POST /.../preferences` with a full ranking | `201` |
| `PATCH /.../complete` with 1 of 5 answered | `409` — completion guard works |
| `PATCH /.../complete` with 5 of 5 answered | `200`, status `completed` |
| `GET /api/recommendations?condition=T2DM` | `200`, ranked output with confidence flags |

Security headers (Helmet) and the CORS origin restriction to the React dev server were both
observed in responses — supporting evidence for C9 (professionalism).

### 6c. Open issues surfaced by verification

Four issues that verification exposed. None is a code defect; all four affect research validity.

1. **Test data is mixed into the development database.** Recommendation output showed 2 SUS
   responses for apps that received only 1 during the scripted run, meaning earlier manual test
   data persists in `dev.db`. **Action:** delete `dev.db` and re-run `prisma migrate dev` +
   `prisma db seed` before any real collection, and never point a live survey at a database that
   has held test data. Contaminated data would otherwise have to be disclosed as a limitation.
2. **`storeUrl` is `null` for every seeded app.** Participants cannot install or try an app the
   survey never locates. Each app record needs a store URL, the **version evaluated**, and the
   **date checked** — required both for the participant task and for reproducibility, since these
   apps change frequently (already on the risk register).
3. **`web/.env.example` was committed empty.** It should declare
   `VITE_API_BASE_URL=http://localhost:4000`. The committed example file is how anyone cloning the
   repository — including an examiner reproducing the work — discovers which variables exist.
   Note that `VITE_`-prefixed variables are compiled into the public bundle, so this file must never
   hold secrets; that distinction differs from `server/.env` and is worth stating in the write-up.
4. **Missing MARS data caps every recommendation at 0.4 and still ranks unevaluated apps.**
   With `wMars = 0.6` and no MARS evaluations, 60% of every score is structurally absent, so the
   top-ranked app scored `0.39` of a possible `1.0`. Worse, an app with *neither* MARS nor SUS data
   (HealthifyMe) was still ranked, scored as `0`. This is ADR-017 confirmed empirically: it
   elevates Phase 2 (MARS scoring) from routine work to **the blocker on the recommendation engine
   producing meaningful output at all**, and it needs an explicit eligibility rule.

### 6d. Frontend verification record — 26 Sep 2026

The participant flow was walked end to end against the live API and confirmed in the database.
Further evidence for criterion C3.

| Check | Result |
|-------|--------|
| Consent screen blocks submission until the agreement box is ticked | ✅ |
| Direct navigation to `/condition` without consenting | ✅ Recovery prompt, not a crash |
| Session creation assigns 5 randomised T2DM apps | ✅ |
| SUS form refuses submission with fewer than ten answers | ✅ |
| Progress advances app-by-app to completion | ✅ |
| **Mid-survey page refresh retains position** | ✅ Server-derived progress (ADR-019) |
| Direct navigation to `/rank` with apps unanswered | ✅ Redirects back to the questionnaire |
| Ranking submits and the session is marked `completed` | ✅ Confirmed in Prisma Studio |
| `AppPreference` row written with the chosen order | ✅ This is the C6 comparison data |
| `npx tsc -b` | ✅ Clean |

**Decline flow added and verified 28 Sep 2026** (ADR-025), so that the ethics declaration about
omitting questions is true in the software:

| Check | Result |
|-------|--------|
| Declining an app advances the progress counter | ✅ |
| Declined app is not shown again after a refresh | ✅ Recorded server-side |
| Skipping an app that already has a response | ✅ Rejected with `409` |
| Ranking page lists only the apps actually rated | ✅ |
| `AppPreference.rankedAppIds` holds the reduced set | ✅ Verified in Prisma Studio |
| Fewer than two rated apps bypasses ranking | ✅ |
| `npm run typecheck` (server) and `npx tsc -b` (web) | ✅ Clean |

### 6e. Open defects — code review, 29 Sep 2026

A systematic review before starting the results UI. None of these was found by the type checker or
the unit tests, because all of them are logic or contract issues rather than type errors.

**Critical**

| # | Defect | Effect |
|---|--------|--------|
| C1 | `ErrorBoundary` was never built, though three documents claimed it was | Blank page on any render throw; false claim now corrected in ADR-023, ADR-024 and the risk register |
| C2 | `POST /sus` validates against `assignedAppIds` but never checks `skippedAppIds` | An app can be both rated **and** declined. `remainingCount` then double-subtracts and can go negative, the completion guard double-counts so a session can be marked `completed` with untouched apps, and `rankable` excludes an app the ranking page still shows — stranding the participant on the final screen. Not reachable through the normal UI, but reachable from two tabs, a retried request, or any direct call to these unauthenticated endpoints. Contradicts the guarantee stated in ADR-025 |
| C3 | No write endpoint reads `SurveySession.status` | A `completed` session still accepts SUS rows, skips and revised rankings, and `PATCH /complete` can be replayed, overwriting `completedAt`. A marker that keeps changing cannot serve as the analysis-eligibility criterion its own comment claims |

**Moderate — affects the results UI**

| # | Defect | Effect |
|---|--------|--------|
| M4 | `topRecommendation` falls back to `scored[0]` when no app is confident | With no MARS data the headline recommendation can be an app with **no MARS and no SUS at all**. **Mitigated in the UI only** (ADR-026): the results page suppresses the top-pick card when every app is low confidence. The API still returns the zero-data app, so the durable fix remains the ADR-017 eligibility rule |
| M1 | Weight override is entered when *either* weight is present but validated as if *both* are | `?wMars=0.7` alone yields a 400 whose message does not describe the real problem |
| M3 | Weights read from `AlgorithmConfig` are used unnormalised, unlike query weights | A stored config such as `0.7/0.5` silently produces `score > 1.0`, breaking the 0–1 scale ADR-011 exists to create. Nothing enforces `wMars + wSus = 1` |
| M2 | The SUS aggregation has no `where` clause | Every SUS row in the database feeds the mean, including abandoned sessions and residual test data. This is the code-level cause of the contamination in §6c.1; wiping `dev.db` (ADR-018) treats the symptom only |

**Moderate — before data collection**

| # | Defect | Effect |
|---|--------|--------|
| M5 | `AppPreference` has no `@@unique([sessionId])` | The `findFirst`-then-create emulation is not atomic, so concurrent submissions can create the duplicate rows the route's own comment says it prevents |
| M7 | `seed.ts` deletes apps but not `susResponse` / `surveySession` / `participant` | `prisma db seed` fails with a foreign-key error once any survey data exists. The ADR-018 wipe-and-reseed workflow only works if `dev.db` is deleted first |
| M8 | No app CRUD endpoints exist, despite being listed in `ARCHITECTURE.md` and MVP scope | There is no way to populate `storeUrl`, `versionEvaluated` or `lastUpdatedOn` except editing the seed file — which M7 makes awkward. The participant-facing effect is already visible as "No store link recorded for this app yet" |
| M6 | `MarsEvaluation.appId` is `@unique`, and the MARS route upserts on it | One evaluation per app, ever, with a second rater silently overwriting the first. The schema has already answered the "single rater or inter-rater reliability" question that §9.3 still lists as open |
| M9 | No 404 or error-handling middleware, and `client.ts` parses JSON unguarded | An HTML error body throws a raw `SyntaxError` rather than an `ApiError`, so every page falls back to its generic message and the real status is lost |

**Minor**

- `recommend.ts` — missing space in the confident reason string: *"combined with weights0.6/0.4"*.
- `recommend.ts` — inconsistent capitalisation: *"no MARS evaluation"* against *"No SUS evaluation"*.
  Both strings are participant- and demo-facing.

**Two defects were found and fixed during this work, both invisible to the dev server:**

1. **An API field-name mismatch** — the frontend type declared `completedAppdIds` while the server
   sends `completedAppIds`. `tsc` passed because the type and the code consuming it agreed with each
   other; only the runtime disagreed, and it surfaced on the SUS page. See **ADR-024** — the concrete
   argument for adding schema validation at the API boundary.
2. **A closure-narrowing error** in `ConditionPage`, where a null-check could not be carried into a
   hoisted function declaration. Caught by `npx tsc -b`, never by `npm run dev`.

**Process lesson for Ch.3:** `npm run dev` does **not** type-check — Vite strips types without
verifying them. Type checking is a separate, deliberate step, and both defects above prove the
distinction matters in the data-collection path.

---

## 7. Scope (MVP boundary)

**In scope (MVP):**
- Admin auth + app CRUD + MARS entry
- Public consent + condition selection + SUS survey for 3–5 apps
- Weighted ranking algorithm with configurable weights + normalisation
- Personalised recommendation output per condition
- CSV export of MARS and SUS data

**Out of scope (initially, to protect the timeline):**
- Multi-admin roles / user management
- Native mobile apps
- Automated app-store data scraping (may be added later as an enhancement)
- Real-time collaboration

---

## 8. Risk Register (carried from planning)

| Risk | Likelihood | Impact | Priority | Mitigation |
|------|-----------|--------|----------|------------|
| Low survey response rate | High | High | 🔴 | No-signup apps, <10 min survey, targeted recruiting, incentive |
| Algorithm lacks justification | Medium | High | 🔴 | Literature-based weights, sensitivity analysis, user-adjustable weights |
| Platform bugs during live survey | Medium | High | 🔴 | Save each response instantly, pilot with 5 users, Google Form fallback |
| Apps change/removed | Medium | Medium | 🟡 | Record exact version + date, run MARS & survey close together |
| Participant bias in SUS | Medium | Medium | 🟡 | Randomise app order, ask for unfamiliar apps, encourage honesty |
| Limited sample diversity | High | Medium | 🟡 | State as limitation, include older participants where possible |
| Scope creep in development | High | Medium | 🟡 | Strict MVP, hard dev-freeze date, protect write-up time |
| **Ethics approval delays survey past the usable window** | High | Critical | 🔴 | Submit ethics summary + form immediately; survey cannot legitimately run without it |
| **C7 entrepreneurial value (10%) not addressed** | Was certain | High | 🔴 | Added as Objective 6 + Phase 12; write into Ch.1 and Ch.5 |
| ~~Silent data corruption from unvalidated SUS input~~ | Was confirmed | Critical | ✅ **Closed** | Fixed and covered by 9 regression tests; rejection verified over HTTP (§6b) |
| **Test data contaminating the real dataset** | Confirmed present | High | 🔴 | Wipe `dev.db` and re-seed before collection; keep test and live databases separate (§6c.1) |
| **Recommendations meaningless until MARS data exists** | Certain | High | 🔴 | Phase 2 elevated to top technical priority; 60% of each score is absent without it (§6c.3) |
| **Apps with no data still appear in rankings** | Confirmed | Medium | 🟡 | Define an eligibility rule per ADR-017; report insufficient-data apps separately rather than scoring them 0 |
| **Unvalidated API responses fail only at runtime** | Occurred once | High | 🔴 | **No mitigation in place.** The error boundary named in ADR-024 is not implemented; add it, then schema validation at the boundary before recruitment |
| **UI crash silently ends a participant's session** | Confirmed | High | 🔴 **Open** | Previously recorded as mitigated. A review on 29 Sep 2026 found the error boundary was never built (ADR-023), so a render throw still blanks the page. Answers do persist server-side (ADR-019), but the participant is not told that and has no recovery route |
| **Unmodified default ranking may not be a real preference** | Medium | Medium | 🟡 | Initial order is randomised so bias is not systematic (ADR-021); consider recording whether the order was changed, and report as a limitation |
| **Participants cannot locate the apps to try** | Confirmed | High | 🔴 | Populate `storeUrl`, version evaluated, and date checked for all 18 apps before the survey (§6c.2) |
| **Write-up compressed by continued development** | High | Critical | 🔴 | Hard freeze mid-Nov; 6 of 10 criteria need no further code |
| Presentation recording missed by 13 Jan | Low | High | 🟡 | Non-submission = 0 for that component; schedule the recording in December |

---

## 9. Programme constraints

### 9.1 Confirmed (briefing, 18 Sep 2026)

| Item | Requirement |
|------|-------------|
| **Report submission** | **18 December 2026** (full-time students) |
| **Presentation slides** | **19 December 2026** (separate submission link) |
| **Presentation completion** | **13 January 2027** — must be **recorded and uploaded to Moodle**; non-submission by the 13th scores **0** for the presentation component |
| Thesis length | 15,000–20,000 words (handbook, taught Masters) |
| Abstract | 300–500 words, single paragraph, written last |
| Referencing | **APA** (author–date) |
| Chapter structure | Ch.1 Introduction · Ch.2 Literature Review · Ch.3 Methodology · Ch.4 Results & Discussion (incl. **Validation**) · Ch.5 Conclusion & Recommendations |
| Supervision | Meet supervisor **at least 3 times**; second marker once (optional); record every meeting on the logsheets |
| Ethics workflow | 1-page research summary → complete the correct form → obtain **supervisor *and* second-marker signatures** → submit form + summary to **Moodle** |
| Ethics forms | Disclaimer (no ethical issues) · Fast Track · Full Track |
| Similarity | If reusing your earlier **RMCE / Research Methodology** work, keep that reused content **below 15%**; paraphrase |
| Presentation content | Introduction · LR summary & inferences · Methodology · Project schedule · Implementation/results · Validation · Conclusions — **and demo the prototype** |
| Technology | No mandated or forbidden stack — free choice |

**Time remaining: ~12 weeks to the report deadline (24 Sep → 18 Dec 2026).**

### 9.2 Working schedule implied by the deadline

| Window | Focus |
|--------|-------|
| Now → early Oct | Ethics summary + form submitted; literature review started; defects fixed |
| Oct | MARS evaluation of the app set; Ch.2 + Ch.3 drafted |
| Late Oct → mid Nov | Survey live (post-approval only); minimal UI to support it |
| Mid Nov | **Hard development freeze**; validation analysis (C6) |
| Mid Nov → 18 Dec | Ch.4, Ch.5, entrepreneurial value (C7), APA pass, full assembly |
| 19 Dec → 13 Jan | Slides, recorded presentation, demo |

### 9.3 Open — needs supervisor / project-manager confirmation

- [ ] **Ethics route.** Three forms exist; which applies? The design involves human participants,
      health-condition self-report, and possible chronic-disease patients — this points to
      **Full Track**, not the disclaimer. Only the supervisor/ethics chair can rule.
- [ ] **Supervisor meeting count.** Briefing says **≥3**; the Supervisory Logsheet template says a
      minimum of **6** sessions. Conflict — assume 6 until told otherwise (safer).
- [ ] **Electronic consent.** The API records a boolean + version + timestamp; the full-track form
      describes dated signatures. Is click-through consent acceptable, and what audit evidence?
- [ ] **Participant population.** "General adults" vs. actual chronic-disease patients are
      materially different populations with different review requirements. Must be declared
      honestly — population cannot be reframed merely to avoid review.
- [x] **MARS evaluator protocol.** Resolved: **single rater**, no second rater available. Documented
      in `docs/MARS_SCORING_PROTOCOL.md`, with test–retest on ~5 apps as the reliability substitute.
      Scores must therefore be described as **"researcher-rated", not "expert-validated"**.
      Confirm the design with the supervisor before scoring begins.
- [ ] **Weighting justification.** 0.6 MARS / 0.4 SUS needs literature support + sensitivity
      analysis before it can be presented as a contribution.
- [ ] **Final title.** Currently 15 words; confirm wording and hyphen counting.
- [ ] Data-protection expectations for participant data (retention, destruction, access).

---

## 10. Related Documents

- `docs/ARCHITECTURE.md` — system architecture, API surface, algorithm design
- `docs/DATABASE_SCHEMA.md` — data model, entities, relationships, example records
