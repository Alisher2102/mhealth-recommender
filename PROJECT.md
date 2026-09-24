# Project Brief

> **A Comparative Evaluation and Intelligent Recommendation System for Mobile Health Applications in Chronic Disease Self-Management**

_Master's dissertation project (MSc Software Engineering), module **CT095-6-M-RMCE** (Dissertation /
Project Paper). This document is the single source of truth for scope, objectives, and technical
direction._

> **Requirements baseline — updated 24 Sep 2026.** The programme constraints in §9 are no longer
> assumptions: they are taken from the **Project Paper Briefing dated 18 Sep 2026** (the current
> cohort authority) and the **APU Thesis/Dissertation Handbook v2.0**. Where the two sources
> disagree, the briefing wins and the conflict is logged in §9.3 for supervisor confirmation.
> University source documents are deliberately **not** stored in this repository.

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

| Phase | Task | Coding? | Status (24 Sep 2026) |
|-------|------|---------|----------------------|
| 1 | Select & shortlist 15–20 mHealth apps (18 seeded) | No | 🟡 Provisional — inclusion criteria + version/availability evidence not yet recorded |
| 2 | Score each app with MARS | No | 🔴 Not started — evaluator protocol undefined (see §9.3) |
| 3 | Design architecture & DB schema | Light | 🟢 Designed — some documented components not built |
| 4 | Admin module (auth + MARS entry) | Yes | 🟡 Implemented, **not verified** — no tests |
| 5 | Survey module (consent + SUS + storage) | Yes | 🔴 Implemented **with confirmed defects** — see §6a |
| 6 | Weighted ranking algorithm | Yes | 🟡 Implemented, **not verified** — no tests |
| 7 | Recommendation engine (condition matching) | Yes | 🟡 Implemented; "personalisation" is condition filtering only |
| 8 | Results / recommendation UI | Yes | 🔴 Not started |
| 9 | **Ethics approval** (blocking gate) | No | 🔴 **Not started — blocks Phase 10** |
| 10 | Run survey with 30–50 participants | No | ⛔ Blocked by Phase 9 |
| 11 | Validation analysis (C6) | Light | 🔴 Not started |
| 12 | Entrepreneurial value analysis (C7) | No | 🔴 Not started |
| 13 | Write dissertation (15,000–20,000 words) | No | 🔴 Not started |
| 14 | Recorded presentation + demo | No | 🔴 Not started |

### 6a. Known defects blocking Phase 5 sign-off

Confirmed by code inspection on 24 Sep 2026:

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

No automated tests exist anywhere in the repository, which is why defects 1–2 went unnoticed. These
must be fixed and covered by tests **before** any participant data is collected.

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
| **Silent data corruption from unvalidated SUS input** | Confirmed defect | Critical | 🔴 | Fix `validationSusHelper`, add unit tests before collecting any data |
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
| Similarity | Keep reused RMCE/RM content **below 15%**; paraphrase |
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
- [ ] **MARS evaluator protocol.** Single rater, or multiple raters with inter-rater reliability?
      Affects whether scores may be described as "expert".
- [ ] **Weighting justification.** 0.6 MARS / 0.4 SUS needs literature support + sensitivity
      analysis before it can be presented as a contribution.
- [ ] **Final title.** Currently 15 words; confirm wording and hyphen counting.
- [ ] Data-protection expectations for participant data (retention, destruction, access).

---

## 10. Related Documents

- `docs/ARCHITECTURE.md` — system architecture, API surface, algorithm design
- `docs/DATABASE_SCHEMA.md` — data model, entities, relationships, example records
