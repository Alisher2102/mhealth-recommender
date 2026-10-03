# mHealth Recommender

**A Comparative Evaluation of Mobile Health Applications for Chronic Disease
Self-Management: A Web-Based User Study**

An MSc Software Engineering dissertation project: a web platform that evaluates mHealth apps
using expert quality scores (MARS) and real user feedback (SUS), then uses a weighted
multi-criteria algorithm to recommend the most suitable app for a given chronic condition.

---

## 📍 Progress at a glance

> Tick a box when a phase is complete. This is the quick status view — full detail lives in
> [`PROJECT.md`](./PROJECT.md).

> **Deadline: report due 18 December 2026** · slides 19 Dec 2026 · recorded presentation by
> 13 Jan 2027. Module: **Project Paper (122026-RJD)**.

**Research governance status:** ⛔ **No ethics approval yet — participant recruitment is not
authorised.** No survey data may be collected until Phase 9 completes.

| Phase | Task | Coding? | Status |
|:-----:|------|:-------:|--------|
| 1 | Select & shortlist mHealth apps (**14 final**) | No | 🟡 Selection search still undocumented |
| 2 | Score each app with MARS | No | ⬜ Not started |
| 3 | Design architecture & DB schema | Light | 🟢 Designed |
| 4 | Admin module (auth + MARS entry) | Yes | 🟡 Implemented; MARS entry not yet exercised |
| 5 | Survey module (consent + SUS + storage) | Yes | 🟢 **Verified** — defects fixed, flow tested |
| 6 | Weighted ranking algorithm | Yes | 🟢 **Verified** — 24 tests passing |
| 7 | Recommendation engine (condition matching) | Yes | 🟡 Runs correctly; needs MARS data to be meaningful |
| 8a | **Participant survey UI** (consent → SUS → ranking → debrief) | Yes | 🟢 **Verified end to end** |
| 8b | Results / recommendation UI | Yes | 🟢 **Verified** — honest when data is insufficient |
| 8c | Admin MARS-entry UI | Yes | ⬜ Deferred by design (ADR-016) |
| 9 | **Ethics approval** (blocking) | No | 🔴 Not started |
| 10 | Run survey with 30–50 participants | No | ⛔ Blocked by Phase 9 |
| 11 | Validation analysis (C6) | Light | ⬜ Not started |
| 12 | Entrepreneurial value analysis (C7) | No | ⬜ Not started |
| 13 | Write dissertation (15,000–20,000 words) | No | ⬜ Not started |
| 14 | Recorded presentation + demo | No | ⬜ Not started |

**Legend:** 🟢 Verified (actually exercised) · 🟡 Implemented or partial · 🔴 Needs work · ⛔ Blocked · ⬜ Not started

**👉 Current state:** the **participant survey flow is complete and verified end to end** — consent
through to debrief, with progress persisted server-side so a refresh resumes rather than restarts
(see [`PROJECT.md`](./PROJECT.md) §6b and §6d).

**Priorities in order:**
1. 🔴 **Submit the ethics summary + form** — blocks the entire survey, and carries 20% of the grade
2. 🟠 **Pilot the flow yourself**, then wipe `dev.db` and re-seed (ADR-018)
3. 🟠 **MARS-score the apps** — without it, 60% of every recommendation score is missing
4. 🟠 **Results / recommendation UI** — needed for C6 and the recorded demo
5. 🟠 **Start Ch.2 and the entrepreneurial-value analysis** — 20% of the grade, needs no code

> ⚠️ Earlier revisions of this file described the backend as "feature-complete" and the algorithm as
> "unit-tested" before either was true. Both are now accurate, but the status vocabulary stays
> strict: **Implemented** means it compiles, **Verified** means it was actually exercised. Note that
> unit tests cover the scoring functions only — the API was verified manually, not by automated
> route tests.

### Before collecting real data

Recorded in [`PROJECT.md`](./PROJECT.md) §6c:
- ⛔ **Ethics approval** — no recruitment before it is granted (ADR-013)
- **Align the consent and debrief wording** in `web/src/content/consent.ts` and `DonePage.tsx` with the approved application — both are currently marked DRAFT
- **Wipe `dev.db` and re-seed** — it currently holds manual test responses (ADR-018)
- **Write `description` and `keyFeatures`** for all 14 apps — currently empty, and participants read them on the survey screen
- **Settle the missing-data eligibility rule** — apps with no MARS or SUS data are currently still ranked, scored as 0 (ADR-017)
- **Decide how declined apps are reported** — sessions with fewer than two rated apps yield no ranking and must be excluded from the Spearman comparison; the decline rate per app is itself a finding (ADR-025)
- **Fill in `web/.env.example`** — committed empty; should declare `VITE_API_BASE_URL`
- **Remove the "Start a new response" link** on the debrief page so one person cannot submit repeatedly
- **Consider schema validation** at the API boundary — a field-name mismatch already caused a runtime crash on the SUS page (ADR-024)

---

## 📂 Documentation

| Document | What's in it |
|----------|--------------|
| [`PROJECT.md`](./PROJECT.md) | Project brief: aim, objectives, users, scope, tech stack, phases, risks |
| [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | System architecture, API surface, MARS/SUS scoring, recommendation algorithm |
| [`docs/DATABASE_SCHEMA.md`](./docs/DATABASE_SCHEMA.md) | Data model, Prisma schema, integrity rules |
| [`docs/DECISIONS.md`](./docs/DECISIONS.md) | Design decision log (ADRs) — rationale feeding Ch.3 of the thesis |

---

## 🛠️ Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express (TypeScript) |
| Database | PostgreSQL (prod) · SQLite (local dev) via Prisma |
| Auth (admin) | JWT + bcrypt |
| Algorithm | TypeScript (pure functions — designed to be unit-testable; **tests not yet written**) |

---

## 🚀 Getting started (local)

**Prerequisites:** **Node.js (LTS, v20+)**, **Git**, and an editor (e.g. **VS Code**). No database
install is required for local development — we use SQLite (a local file), added in a later step.

**1. Clone the repo**
```bash
git clone https://github.com/Alisher2102/mhealth-recommender.git
cd mhealth-recommender
```

**2. Run the backend API**
```bash
cd server
cp .env.example .env      # create your local env file (Windows: copy .env.example .env)
npm install               # install dependencies
npm run dev               # start the dev server (auto-reloads on changes)
```

You should see:
```
🚀 mHealth Recommender API listening on http://localhost:4000
   Health check: http://localhost:4000/health
```

**3. Confirm it works** — open <http://localhost:4000/health> in your browser (or run
`curl http://localhost:4000/health`). You should get:
```json
{ "status": "ok", "service": "mhealth-recommender-server", "timestamp": "..." }
```

Stop the server anytime with `Ctrl+C`.

### Backend scripts (`server/`)

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start dev server with auto-reload (tsx watch) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled server from `dist/` |
| `npm run typecheck` | Type-check without emitting files |
