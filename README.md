# mHealth Recommender

**A Comparative Evaluation and Intelligent Recommendation System for Mobile Health
Applications in Chronic Disease Self-Management.**

An MSc Software Engineering dissertation project: a web platform that evaluates mHealth apps
using expert quality scores (MARS) and real user feedback (SUS), then uses a weighted
multi-criteria algorithm to recommend the most suitable app for a given chronic condition.

---

## 📍 Progress at a glance

> Tick a box when a phase is complete. This is the quick status view — full detail lives in
> [`PROJECT.md`](./PROJECT.md).

> **Deadline: report due 18 December 2026** · slides 19 Dec 2026 · recorded presentation by
> 13 Jan 2027. Module CT095-6-M-RMCE.

**Research governance status:** ⛔ **No ethics approval yet — participant recruitment is not
authorised.** No survey data may be collected until Phase 9 completes.

| Phase | Task | Coding? | Status |
|:-----:|------|:-------:|--------|
| 1 | Select & shortlist 15–20 mHealth apps (18 seeded) | No | 🟡 Provisional (no inclusion evidence yet) |
| 2 | Score each app with MARS | No | ⬜ Not started |
| 3 | Design architecture & DB schema | Light | 🟢 Designed |
| 4 | Admin module (auth + MARS entry) | Yes | 🟡 Implemented, untested |
| 5 | Survey module (consent + SUS + storage) | Yes | 🔴 Implemented, **defects confirmed** |
| 6 | Weighted ranking algorithm | Yes | 🟡 Implemented, untested |
| 7 | Recommendation engine (condition matching) | Yes | 🟡 Implemented, untested |
| 8 | Results / recommendation UI | Yes | ⬜ Not started |
| 9 | **Ethics approval** (blocking) | No | 🔴 Not started |
| 10 | Run survey with 30–50 participants | No | ⛔ Blocked by Phase 9 |
| 11 | Validation analysis (C6) | Light | ⬜ Not started |
| 12 | Entrepreneurial value analysis (C7) | No | ⬜ Not started |
| 13 | Write dissertation (15,000–20,000 words) | No | ⬜ Not started |
| 14 | Recorded presentation + demo | No | ⬜ Not started |

**Legend:** 🟢 Designed · 🟡 Implemented (not verified) · 🔴 Needs work · ⛔ Blocked · ⬜ Not started

**👉 Currently working on:** Three priorities, in order — (1) **submit the ethics summary + form**,
since it blocks the entire survey; (2) **fix the confirmed survey-module defects** and add unit tests
for the scoring functions; (3) **start Ch.2 (literature review)** and the **entrepreneurial value**
analysis, which together carry 20% of the grade and need no code.

> ⚠️ Earlier revisions of this file described the backend as "feature-complete". That was
> inaccurate: no tests exist, and the survey module contains confirmed defects
> (see [`PROJECT.md`](./PROJECT.md) §6a). "Implemented" now means the code exists and compiles —
> nothing more.

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
