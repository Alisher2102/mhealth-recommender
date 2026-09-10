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
| 4 | Build admin module (MARS input + storage) | Yes | ⬜ Not started |
| 5 | Build user survey module (consent + SUS + storage) | Yes | ⬜ Not started |
| 6 | Build weighted ranking algorithm | Yes | ⬜ Not started |
| 7 | Build recommendation engine (condition matching) | Yes | ⬜ Not started |
| 8 | Build results / recommendation UI | Yes | ⬜ Not started |
| 9 | Run survey with 30–50 participants | No | ⬜ Not started |
| 10 | Analyse results & write dissertation | Light | ⬜ Not started |

**Legend:** ✅ Done · 🟡 In progress · ⬜ Not started

**👉 Currently working on:** Phase 4 — about to scaffold the backend skeleton (`server/`).

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

> Nothing to run yet — the backend is scaffolded in Phase 4. This section will grow as we build.

```bash
git clone https://github.com/Alisher2102/mhealth-recommender.git
cd mhealth-recommender
```

You'll need **Node.js (LTS)**, **Git**, and an editor (e.g. **VS Code**). No database install is
required for local development — we use SQLite (a local file).
