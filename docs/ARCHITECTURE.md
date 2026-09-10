# System Architecture

_Companion to `../PROJECT.md`. Describes the technical structure, request flows, API surface, and
the design of the recommendation algorithm._

---

## 1. High-Level Overview

A classic three-tier web application: a React SPA talks to a stateless Express REST API, which
persists to a relational database via Prisma.

```
┌─────────────────────────────────────────────────────────────┐
│                         Client (Browser)                      │
│                                                               │
│   React SPA (Vite + Tailwind)                                 │
│   ┌───────────────┐  ┌───────────────┐  ┌────────────────┐   │
│   │ Public / Home │  │ Survey (SUS)  │  │ Admin (MARS)   │   │
│   │  + Recommend  │  │  + Consent    │  │  (JWT-gated)   │   │
│   └───────┬───────┘  └───────┬───────┘  └────────┬───────┘   │
└───────────┼──────────────────┼───────────────────┼───────────┘
            │        HTTPS / JSON (REST)            │
┌───────────▼──────────────────▼───────────────────▼───────────┐
│                    API Server (Node + Express, TS)            │
│                                                               │
│   Routes → Controllers → Services → Prisma Client             │
│   ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌──────────────────┐   │
│   │  auth   │ │  apps   │ │  survey  │ │ recommendation   │   │
│   │ (JWT)   │ │ + MARS  │ │  (SUS)   │ │ engine (algo)    │   │
│   └─────────┘ └─────────┘ └──────────┘ └──────────────────┘   │
│   Middleware: validation (zod), auth guard, error handler     │
└───────────────────────────┬───────────────────────────────────┘
                            │  Prisma ORM
┌───────────────────────────▼───────────────────────────────────┐
│         Database — PostgreSQL (prod) / SQLite (local dev)       │
│   apps · mars_evaluations · participants · survey_sessions ·   │
│   sus_responses · app_preferences · algorithm_configs          │
└────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Responsibilities

### 2.1 Frontend (React SPA)
Three route areas:

- **Public (`/`)** — project explanation, condition picker, and the recommendation results page
  (`/recommendations?condition=...`). Shows ranked apps + personalised top pick + weight controls.
- **Survey (`/survey`)** — consent gate → condition select → per-app SUS forms (3–5 apps, order
  randomised) → optional preference ranking → thank-you. Each SUS response is POSTed as soon as
  the participant completes that app (no "submit everything at the end") to protect against
  drop-off (Risk mitigation).
- **Admin (`/admin`)** — login → dashboard → app management (create/edit) → MARS entry form
  (23 items) → CSV export. Gated by JWT stored in memory (+ refresh strategy TBD).

### 2.2 Backend (Express, TypeScript)
Layered: `routes → controllers → services → prisma`. Cross-cutting middleware:
- **Validation** — `zod` schemas on every request body/params.
- **Auth guard** — verifies JWT for `/admin/*` and any write to MARS/config.
- **Error handler** — consistent JSON error shape `{ error: { code, message, details? } }`.

### 2.3 Database
See `DATABASE_SCHEMA.md`. Prisma provides type-safe models + migrations and lets us target
SQLite locally and Postgres in production by switching the datasource URL.

---

## 3. Key Request Flows

### 3.1 Admin enters a MARS evaluation
```
Admin UI → POST /api/auth/login {email,password}
         ← 200 {token}
Admin UI → POST /api/apps {name, category, platform, version, ...}   (Bearer token)
         ← 201 {app}
Admin UI → POST /api/apps/:appId/mars {scores{...23 items}, notes}   (Bearer token)
         ← 201 {evaluation with computed subscale + total scores}
```

### 3.2 Participant completes the SUS survey
```
User UI → POST /api/participants {consent:true, demographics?}       (creates participant)
        ← 201 {participantId}
User UI → POST /api/survey/sessions {participantId, condition}
        ← 201 {sessionId, apps:[randomised 3–5 for that condition]}
For each app:
User UI → POST /api/survey/sessions/:sessionId/sus {appId, answers[10]}
        ← 201 {susScore}                                (persisted immediately)
User UI → POST /api/survey/sessions/:sessionId/preferences {rankedAppIds[]}  (optional)
        ← 201 {ok}
```

### 3.3 Recommendation is generated
```
User UI → GET /api/recommendations?condition=T2DM[&wMars=0.6&wSus=0.4]
        ← 200 {
             config: {weights, normalisation, provenance},
             ranking: [{appId, name, marsNorm, susNorm, score, rank}, ...],
             topRecommendation: {appId, name, score, why},
          }
```

---

## 4. API Surface (v1)

Base path: `/api`

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/auth/login` | — | Admin login → JWT |
| GET | `/apps` | — | List apps (filter by `?category=`) |
| GET | `/apps/:id` | — | App detail |
| POST | `/apps` | admin | Create app |
| PUT | `/apps/:id` | admin | Update app |
| DELETE | `/apps/:id` | admin | Remove app |
| POST | `/apps/:id/mars` | admin | Create/replace MARS evaluation |
| GET | `/apps/:id/mars` | admin | Get MARS evaluation |
| POST | `/participants` | — | Register participant (consent required) |
| POST | `/survey/sessions` | — | Start a survey session for a condition |
| POST | `/survey/sessions/:id/sus` | — | Submit one app's SUS answers |
| POST | `/survey/sessions/:id/preferences` | — | Submit optional preference ranking |
| GET | `/recommendations` | — | Ranked apps + top pick for a condition |
| GET | `/export/mars.csv` | admin | Export all MARS data as CSV |
| GET | `/export/sus.csv` | admin | Export all SUS data as CSV |
| GET | `/config/algorithm` | — | Current default weights + provenance |
| PUT | `/config/algorithm` | admin | Update default weights |

---

## 5. Scoring: MARS & SUS (computation rules)

### 5.1 MARS
- 23 objective items, each 1–5, grouped into subscales:
  - **A. Engagement** (5 items)
  - **B. Functionality** (4 items)
  - **C. Aesthetics** (3 items)
  - **D. Information** (7 items)
- Subscale score = mean of its items.
- **MARS objective total = mean of the four subscale means** (range 1–5).
- **E. Subjective quality** (4 items) is recorded but excluded from the objective total (used in
  discussion only).

### 5.2 SUS
- 10 items, each 1–5 (Likert).
- Odd items (1,3,5,7,9): contribution = `answer − 1`.
- Even items (2,4,6,8,10): contribution = `5 − answer`.
- **SUS score = sum of contributions × 2.5** (range 0–100).
- Per-app SUS = mean of participants' SUS scores for that app.

---

## 6. Recommendation Algorithm (the novel contribution)

Pure, unit-tested TypeScript module. Deterministic given inputs.

### 6.1 Steps
1. **Gather** per app (within the requested condition): MARS objective total (1–5) and mean SUS
   (0–100), plus the count of SUS responses.
2. **Normalise** both to a common `0–1` scale so neither dominates:
   - `marsNorm = (marsTotal − 1) / (5 − 1)`
   - `susNorm  = susMean / 100`
   > Min–max against the instruments' theoretical bounds keeps scores comparable across runs.
   > (Alternative: min–max against the observed range — configurable; documented for the
   > methodology chapter.)
3. **Weight & combine**:
   - `score = (wMars × marsNorm) + (wSus × susNorm)` where `wMars + wSus = 1`.
   - Defaults: `wMars = 0.6`, `wSus = 0.4` (literature-justified; provenance stored in
     `algorithm_configs`). Users/admin may override.
4. **Condition matching**: only apps tagged with the requested condition are eligible; a small
   `conditionMatchBoost` may be applied when an app targets the condition exclusively (configurable,
   default 0 to keep the baseline pure).
5. **Rank** descending by `score`; expose the full ranking + the top pick with a `why` explanation
   (its normalised components and weights).
6. **Confidence flag**: mark apps with fewer than `minSusResponses` (default 3) as
   `lowConfidence` so thin data is visible rather than hidden.

### 6.2 Sensitivity analysis (Risk 4 mitigation)
The engine can compute rankings across a sweep of `wMars` from 0→1 (step configurable) and return
how each app's rank changes. The UI renders this so the examiner can see the ranking is not
brittle to a single arbitrary weight choice.

### 6.3 Validation hook (Objective 5)
Participant preference rankings (from `app_preferences`) are compared to the algorithm's ranking
using **Spearman's rank correlation coefficient (ρ)**. This is computed offline from the CSV
exports (Python/SPSS) initially; a `/api/validation` endpoint can be added later.

---

## 7. Cross-Cutting Concerns

- **Validation:** `zod` on all inputs; reject out-of-range Likert values early.
- **Security:** bcrypt password hashing; JWT with short expiry; CORS locked to the frontend
  origin; helmet headers; rate-limit auth + survey POSTs.
- **Data protection:** participant data minimised; demographics optional; consent recorded with
  timestamp + consent version. (Align with university ethics/GDPR once known.)
- **Reliability:** each SUS response persisted immediately; DB constraints prevent duplicate
  submissions per (session, app).
- **Testing:** unit tests for scoring + algorithm (pure functions), integration tests for API
  routes, a small e2e happy-path for the survey flow.
- **Config over hard-coding:** weights, normalisation mode, and thresholds live in
  `algorithm_configs` / env, never inline constants.

---

## 8. Repository Layout (proposed, for scaffolding step)

```
/               → workspace root
  PROJECT.md
  docs/
    ARCHITECTURE.md
    DATABASE_SCHEMA.md
  server/           → Express + TS API
    src/
      routes/  controllers/  services/  middleware/
      lib/scoring/        → mars.ts, sus.ts, recommend.ts (pure, tested)
      prisma/schema.prisma
    tests/
  web/              → React + Vite + Tailwind SPA
    src/
      pages/  components/  api/  hooks/
  package.json (workspaces) or separate per package
```

> This layout is a proposal for the scaffolding phase (Phase 4), not yet created.
