# Database Schema

_Companion to `../PROJECT.md` and `ARCHITECTURE.md`. Defines the data model for the mHealth
recommendation system. Presented DB-agnostically, then as a Prisma schema. Targets PostgreSQL
(production) and SQLite (local dev)._

---

## 1. Why relational (and why Postgres + SQLite)

The data is highly structured and relational: apps have evaluations, participants have sessions,
sessions have per-app SUS responses. Foreign keys and uniqueness constraints (e.g. "one SUS
response per session per app") are first-class in SQL and directly prevent the data-integrity
bugs that would corrupt the study.

- **PostgreSQL** in production — robust, well-understood, examiner-credible, free tiers on
  Render/Railway/Fly.
- **SQLite** for local development — zero-config, file-based, fast to reset while building.
- **Prisma** models both from one `schema.prisma`; switch by changing the datasource URL.

> Note: Prisma enums and native JSON differ slightly between SQLite and Postgres. Where noted, we
> use `String` columns with app-level validation (via `zod`) so the same schema runs on both. On
> Postgres these can later be tightened to native `enum`/`jsonb`.

---

## 2. Entities Overview

| Entity | Purpose |
|--------|---------|
| `admins` | Researcher login accounts (MVP: one) |
| `apps` | The mHealth apps under evaluation |
| `mars_evaluations` | One expert MARS evaluation per app (23 item scores + notes + computed) |
| `participants` | Survey participants (consent + optional demographics) |
| `survey_sessions` | One participant's run for one condition (holds the assigned app set) |
| `sus_responses` | One participant's SUS answers for one app within a session |
| `app_preferences` | Optional participant ranking of the apps they tried (for validation) |
| `algorithm_configs` | Named weight/normalisation configurations + provenance |

### Relationships (text ERD)

```
admins (1) ────────────< (∞) mars_evaluations >──────── (1) apps
                                                            │ 1
                                                            │
apps (1) ──────────< (∞) sus_responses (∞) >──────────── (1) survey_sessions
                                                            │ ∞
                                                            │ 1
participants (1) ──< (∞) survey_sessions (1) ──< (∞) app_preferences

algorithm_configs  — standalone; referenced by the engine at runtime
```

- An **app** has at most **one** MARS evaluation (MVP; a history table can be added later).
- A **survey_session** belongs to one **participant** and one **condition**, and gathers many
  **sus_responses** (one per app tried).
- **Uniqueness:** one `sus_responses` row per `(session_id, app_id)`.

---

## 3. Field-Level Definitions

### 3.1 `admins`
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid/text (PK) | PK | |
| email | text | unique, not null | login |
| password_hash | text | not null | bcrypt |
| created_at | datetime | default now | |

### 3.2 `apps`
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid/text (PK) | PK | |
| name | text | not null | e.g. "mySugr" |
| category | text | not null | `T2DM` \| `HYPERTENSION` \| `COPD` (validated) |
| platform | text | not null | e.g. "Android / iOS" |
| version_evaluated | text | nullable | for reproducibility (Risk mitigation) |
| store_url | text | nullable | Play/App Store link |
| description | text | nullable | shown to participants |
| key_features | text | nullable | comma-separated or JSON string |
| last_updated_on | date | nullable | store "last updated" date |
| is_active | boolean | default true | hide without deleting |
| created_at | datetime | default now | |

### 3.3 `mars_evaluations`
One row per app. Stores the 23 raw item scores plus computed subscale means and the objective
total. Storing computed values makes CSV export and analysis trivial; they are recomputed on
write from the raw items (single source of truth = the raw items).

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid/text (PK) | PK | |
| app_id | fk → apps.id | unique, not null | one evaluation per app (MVP) |
| evaluator_id | fk → admins.id | not null | who scored it |
| **A. Engagement (5)** | | | each 1–5 |
| a1_entertainment | int | 1–5 | |
| a2_interest | int | 1–5 | |
| a3_customisation | int | 1–5 | |
| a4_interactivity | int | 1–5 | |
| a5_target_group | int | 1–5 | |
| **B. Functionality (4)** | | | |
| b1_performance | int | 1–5 | |
| b2_ease_of_use | int | 1–5 | |
| b3_navigation | int | 1–5 | |
| b4_gestural_design | int | 1–5 | |
| **C. Aesthetics (3)** | | | |
| c1_layout | int | 1–5 | |
| c2_graphics | int | 1–5 | |
| c3_visual_appeal | int | 1–5 | |
| **D. Information (7)** | | | |
| d1_accuracy | int | 1–5 | |
| d2_goals | int | 1–5 | |
| d3_quality_of_info | int | 1–5 | |
| d4_quantity_of_info | int | 1–5 | |
| d5_visual_info | int | 1–5 | |
| d6_credibility | int | 1–5 | |
| d7_evidence_base | int | 1–5 | may be marked N/A in practice; see note |
| **E. Subjective (4)** | | | excluded from objective total |
| e1_would_recommend | int | 1–5 | |
| e2_use_frequency | int | 1–5 | |
| e3_would_pay | int | 1–5 | |
| e4_overall_rating | int | 1–5 | |
| engagement_mean | float | computed | mean(a1..a5) |
| functionality_mean | float | computed | mean(b1..b4) |
| aesthetics_mean | float | computed | mean(c1..c3) |
| information_mean | float | computed | mean(d1..d7) |
| subjective_mean | float | computed | mean(e1..e4) |
| mars_total | float | computed | mean of the four objective subscale means (1–5) |
| notes | text | nullable | justification for scores (methodology chapter) |
| created_at | datetime | default now | |

> **N/A items:** MARS allows some items (notably `d7_evidence_base`) to be "not applicable". MVP
> keeps them required 1–5 for simplicity; if the supervisor requires true N/A handling, make the
> column nullable and exclude nulls from the subscale mean. Documented here so the decision is
> explicit.

### 3.4 `participants`
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid/text (PK) | PK | |
| consent_given | boolean | not null | must be true to proceed |
| consent_version | text | not null | which consent text they agreed to |
| consented_at | datetime | not null | timestamp |
| age_band | text | nullable | e.g. "18-29","30-39",... (optional, for diversity analysis) |
| gender | text | nullable | optional |
| has_chronic_condition | boolean | nullable | optional self-report |
| created_at | datetime | default now | |

### 3.5 `survey_sessions`
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid/text (PK) | PK | |
| participant_id | fk → participants.id | not null | |
| condition | text | not null | `T2DM`\|`HYPERTENSION`\|`COPD` |
| assigned_app_ids | text | not null | JSON string array of the 3–5 apps shown (randomised) |
| presentation_order | text | not null | JSON string array capturing shown order (bias control) |
| status | text | default "in_progress" | `in_progress`\|`completed`\|`abandoned` |
| started_at | datetime | default now | |
| completed_at | datetime | nullable | |

### 3.6 `sus_responses`
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid/text (PK) | PK | |
| session_id | fk → survey_sessions.id | not null | |
| app_id | fk → apps.id | not null | |
| q1 … q10 | int | 1–5 each | raw Likert answers |
| sus_score | float | computed | 0–100 per SUS formula |
| submitted_at | datetime | default now | |
| — | | **unique (session_id, app_id)** | one response per app per session |

### 3.7 `app_preferences`
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid/text (PK) | PK | |
| session_id | fk → survey_sessions.id | not null | |
| ranked_app_ids | text | not null | JSON string array, best→worst |
| created_at | datetime | default now | |

### 3.8 `algorithm_configs`
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid/text (PK) | PK | |
| name | text | unique, not null | e.g. "default", "usability-heavy" |
| w_mars | float | 0–1 | weight for normalised MARS |
| w_sus | float | 0–1 | weight for normalised SUS (w_mars + w_sus = 1) |
| normalisation_mode | text | not null | `theoretical` \| `observed` |
| condition_match_boost | float | default 0 | optional additive boost |
| min_sus_responses | int | default 3 | below → lowConfidence flag |
| provenance | text | not null | literature justification for the weights |
| is_default | boolean | default false | one row true |
| created_at | datetime | default now | |

---

## 4. Prisma Schema (draft)

```prisma
// datasource: switch provider/url for SQLite (dev) vs PostgreSQL (prod)
datasource db {
  provider = "sqlite"            // dev; use "postgresql" in prod
  url      = env("DATABASE_URL") // e.g. file:./dev.db  OR  postgresql://...
}

generator client {
  provider = "prisma-client-js"
}

model Admin {
  id           String            @id @default(cuid())
  email        String            @unique
  passwordHash String
  createdAt    DateTime          @default(now())
  evaluations  MarsEvaluation[]
}

model App {
  id               String           @id @default(cuid())
  name             String
  category         String           // T2DM | HYPERTENSION | COPD
  platform         String
  versionEvaluated String?
  storeUrl         String?
  description      String?
  keyFeatures      String?
  lastUpdatedOn    DateTime?
  isActive         Boolean          @default(true)
  createdAt        DateTime         @default(now())
  marsEvaluation   MarsEvaluation?
  susResponses     SusResponse[]
}

model MarsEvaluation {
  id               String   @id @default(cuid())
  app              App      @relation(fields: [appId], references: [id])
  appId            String   @unique
  evaluator        Admin    @relation(fields: [evaluatorId], references: [id])
  evaluatorId      String

  a1Entertainment  Int
  a2Interest       Int
  a3Customisation  Int
  a4Interactivity  Int
  a5TargetGroup    Int
  b1Performance    Int
  b2EaseOfUse      Int
  b3Navigation     Int
  b4GesturalDesign Int
  c1Layout         Int
  c2Graphics       Int
  c3VisualAppeal   Int
  d1Accuracy       Int
  d2Goals          Int
  d3QualityOfInfo  Int
  d4QuantityOfInfo Int
  d5VisualInfo     Int
  d6Credibility    Int
  d7EvidenceBase   Int
  e1WouldRecommend Int
  e2UseFrequency   Int
  e3WouldPay       Int
  e4OverallRating  Int

  engagementMean    Float
  functionalityMean Float
  aestheticsMean    Float
  informationMean   Float
  subjectiveMean    Float
  marsTotal         Float

  notes     String?
  createdAt DateTime @default(now())
}

model Participant {
  id                  String          @id @default(cuid())
  consentGiven        Boolean
  consentVersion      String
  consentedAt         DateTime
  ageBand             String?
  gender              String?
  hasChronicCondition Boolean?
  createdAt           DateTime        @default(now())
  sessions            SurveySession[]
}

model SurveySession {
  id                String          @id @default(cuid())
  participant       Participant     @relation(fields: [participantId], references: [id])
  participantId     String
  condition         String
  assignedAppIds    String          // JSON string[]
  presentationOrder String          // JSON string[]
  status            String          @default("in_progress")
  startedAt         DateTime        @default(now())
  completedAt       DateTime?
  susResponses      SusResponse[]
  preferences       AppPreference[]
}

model SusResponse {
  id          String        @id @default(cuid())
  session     SurveySession @relation(fields: [sessionId], references: [id])
  sessionId   String
  app         App           @relation(fields: [appId], references: [id])
  appId       String
  q1 Int
  q2 Int
  q3 Int
  q4 Int
  q5 Int
  q6 Int
  q7 Int
  q8 Int
  q9 Int
  q10 Int
  susScore    Float
  submittedAt DateTime      @default(now())

  @@unique([sessionId, appId])
}

model AppPreference {
  id           String        @id @default(cuid())
  session      SurveySession @relation(fields: [sessionId], references: [id])
  sessionId    String
  rankedAppIds String        // JSON string[]
  createdAt    DateTime      @default(now())
}

model AlgorithmConfig {
  id                   String   @id @default(cuid())
  name                 String   @unique
  wMars                Float
  wSus                 Float
  normalisationMode    String   // theoretical | observed
  conditionMatchBoost  Float    @default(0)
  minSusResponses      Int      @default(3)
  provenance           String
  isDefault            Boolean  @default(false)
  createdAt            DateTime @default(now())
}
```

---

## 5. Example Records (illustrative)

**App**
```json
{ "id": "app_mysugr", "name": "mySugr", "category": "T2DM",
  "platform": "Android / iOS", "versionEvaluated": "3.xx.x",
  "keyFeatures": "Glucose logging, HbA1c estimator, gamified tracking",
  "isActive": true }
```

**MARS evaluation (abridged)** — raw items in, computed out
```json
{ "appId": "app_mysugr",
  "a1Entertainment": 4, "a2Interest": 4, "a3Customisation": 3, "a4Interactivity": 4, "a5TargetGroup": 5,
  "engagementMean": 4.0, "functionalityMean": 4.5, "aestheticsMean": 4.33, "informationMean": 4.14,
  "marsTotal": 4.24 }
```

**SUS response (abridged)** — sus_score computed from q1..q10
```json
{ "sessionId": "sess_01", "appId": "app_mysugr",
  "q1":4,"q2":2,"q3":5,"q4":1,"q5":4,"q6":2,"q7":5,"q8":1,"q9":4,"q10":2,
  "susScore": 85.0 }
```

**AlgorithmConfig (default)**
```json
{ "name": "default", "wMars": 0.6, "wSus": 0.4,
  "normalisationMode": "theoretical", "minSusResponses": 3, "isDefault": true,
  "provenance": "Weights favour expert quality (MARS) while retaining strong usability influence (SUS); see literature review §X." }
```

---

## 6. Seed & Migration Notes

- **Seed** the 18 apps (from Phase 1) and one `AlgorithmConfig` named `default` on first run.
- **Seed** one admin account from env vars (`ADMIN_EMAIL`, `ADMIN_PASSWORD`) — never commit
  credentials.
- Use `prisma migrate dev` locally (SQLite) and `prisma migrate deploy` in prod (Postgres).
- Computed MARS/SUS values are written by the service layer on create/update; the raw item
  columns remain the single source of truth (recompute if formula changes).
- JSON-in-`String` columns (`assignedAppIds`, `presentationOrder`, `rankedAppIds`) are validated
  with `zod` on write; on Postgres these can migrate to `jsonb` later.

---

## 7. Data Integrity Rules (enforced)

1. `sus_responses` unique per `(session_id, app_id)` — no double submissions.
2. `mars_evaluations` unique per `app_id` — one expert evaluation per app (MVP).
3. All Likert columns constrained to 1–5 at the app layer (and via check constraints on Postgres).
4. `participants.consent_given` must be true before any session is created.
5. `algorithm_configs`: exactly one `is_default = true` (enforced in service layer).
