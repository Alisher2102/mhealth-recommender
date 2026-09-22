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

| Phase | Task | Coding? | Status |
|:-----:|------|:-------:|--------|
| 1 | Select & shortlist 15–20 mHealth apps (18 selected) | No | 🟡 In progress |
| 2 | Score each app with MARS | No | ⬜ Not started |
| 3 | Design architecture & DB schema | Light | ✅ **Done** |
| 4 | Build admin module (MARS input + storage) | Yes | ✅ **Done** (auth + MARS entry) |
| 5 | Build user survey module (consent + SUS + storage) | Yes | ✅ **Done** |
| 6 | Build weighted ranking algorithm | Yes | ⬜ Not started |
| 7 | Build recommendation engine (condition matching) | Yes | ⬜ Not started |
| 8 | Build results / recommendation UI | Yes | ⬜ Not started |
| 9 | Run survey with 30–50 participants | No | ⬜ Not started |
| 10 | Analyse results & write dissertation | Light | ⬜ Not started |

**Legend:** ✅ Done · 🟡 In progress · ⬜ Not started

**👉 Currently working on:** Phases 4 & 5 complete — the admin module (auth + MARS entry) and the
participant survey module (consent, randomised 3–5 app sessions, SUS submission with integrity
checks) are both done. Both MARS and SUS data now flow into the database. **Next: Phase 6/7 — the
weighted recommendation engine** (the academic centrepiece).

---

## 📂 Documentation

| Document | What's in it |
|----------|--------------|
| [`PROJECT.md`](./PROJECT.md) | Project brief: aim, objectives, users, scope, tech stack, phases, risks |
| [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | System architecture, API surface, MARS/SUS scoring, recommendation algorithm |
| [`docs/DATABASE_SCHEMA.md`](./docs/DATABASE_SCHEMA.md) | Data model, Prisma schema, integrity rules |

---

## 🛠️ Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express (TypeScript) |
| Database | PostgreSQL (prod) · SQLite (local dev) via Prisma |
| Auth (admin) | JWT + bcrypt |
| Algorithm | TypeScript (pure, unit-tested) |

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
