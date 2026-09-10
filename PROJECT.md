# Project Brief

> **A Comparative Evaluation and Intelligent Recommendation System for Mobile Health Applications in Chronic Disease Self-Management**

_Master's dissertation project (MSc Software Engineering). This document is the single source of truth for scope, objectives, and technical direction. It will evolve as university constraints and supervisor feedback arrive._

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

| Phase | Task | Coding? | Status |
|-------|------|---------|--------|
| 1 | Select & shortlist 15–20 mHealth apps (18 selected) | No | In progress |
| 2 | Score each app with MARS | No | Not started |
| 3 | Design architecture & DB schema | Light | **This step** |
| 4 | Build admin module (MARS input + storage) | Yes | Not started |
| 5 | Build user survey module (consent + SUS + storage) | Yes | Not started |
| 6 | Build weighted ranking algorithm | Yes | Not started |
| 7 | Build recommendation engine (condition matching) | Yes | Not started |
| 8 | Build results / recommendation UI | Yes | Not started |
| 9 | Run survey with 30–50 participants | No | Not started |
| 10 | Analyse results & write dissertation | Light | Not started |

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

---

## 9. Open Constraints (to confirm with supervisor / project manager)

- [ ] Required or forbidden technologies?
- [ ] Ethics approval process + consent form requirements (needed before running the survey)
- [ ] Submission deadline / milestone dates (drives the Gantt chart and dev-freeze date)
- [ ] Data protection / GDPR handling for participant data
- [ ] Preferred statistical method for validation (Spearman correlation assumed)

_These are unknown at present; the project is being started on best-practice defaults and will be
adjusted when requirements are received._

---

## 10. Related Documents

- `docs/ARCHITECTURE.md` — system architecture, API surface, algorithm design
- `docs/DATABASE_SCHEMA.md` — data model, entities, relationships, example records
