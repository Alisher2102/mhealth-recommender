# Design Decisions Log

_A running record of the significant technical and methodological decisions made while building
the mHealth Recommender, and the reasoning behind each. This log feeds directly into the
**Design** and **Methodology** chapters of the dissertation — the APU handbook weights the
written analysis and "knowledge gained" far above the software artefact itself, so we capture the
rationale here as we go rather than trying to reconstruct it at the end._

> Format: each entry records the **decision**, the **context/problem**, the **options considered**,
> the **choice + rationale**, and any **trade-offs**. Newest entries at the bottom.

---

## ADR-001 — Custom Node/Express + relational DB backend (not Firebase / low-code)

- **Context:** Needed a backend for admin MARS entry, participant SUS capture, and the
  recommendation engine. This is an MSc **Software Engineering** dissertation, where examiners
  expect demonstrable engineering depth.
- **Options considered:** (a) Firebase / BaaS (fastest to ship), (b) Node/Express + relational
  database with an ORM (more to build, more control).
- **Decision:** Node.js + Express (TypeScript) + PostgreSQL (prod) / SQLite (dev) via Prisma.
- **Rationale:** Explicit data modelling, API design, validation, and testability are the kind of
  engineering the degree assesses. A BaaS would hide exactly the parts we want to demonstrate and
  discuss critically.
- **Trade-offs:** More initial setup and code to maintain vs. a hosted BaaS.

## ADR-002 — Prisma ORM, pinned to the stable v6 line

- **Context:** Needed a type-safe data-access layer that works for both SQLite (local dev) and
  PostgreSQL (production).
- **Decision:** Prisma ORM, pinned to v6 (currently 6.19.x); do **not** adopt v7/v8 release
  candidates mid-project.
- **Rationale:** Prisma gives a single `schema.prisma` that targets both databases by swapping the
  datasource URL, plus a fully typed client. Pinning to a stable major keeps the project
  reproducible and aligned with stable documentation — important for a dissertation that must be
  defensible and re-runnable months later.
- **Trade-offs:** Miss newest features, but gain stability. Deliberate.

## ADR-003 — SQLite for development, PostgreSQL for production

- **Context:** Contributors (and examiners) should be able to run the project with minimal setup,
  while production wants a robust RDBMS.
- **Decision:** SQLite (file-based, zero-config) locally; PostgreSQL in production.
- **Rationale:** SQLite removes install friction for local dev; Postgres is production-grade and
  examiner-credible. Prisma abstracts the difference.
- **Trade-offs:** Minor dialect differences (e.g. no native enums/JSON on SQLite) — handled by
  using validated `String` columns at the app layer so the same schema runs on both.

## ADR-004 — MARS objective total = mean of the four objective subscale means

- **Context:** MARS has 23 items across 4 objective subscales (Engagement 5, Functionality 4,
  Aesthetics 3, Information 7) plus a subjective Section E (4 items).
- **Decision:** `marsTotal` = mean of the four **subscale means**, range 1–5. Section E is stored
  but **excluded** from the objective total.
- **Rationale:** This matches the validated MARS instrument definition. Averaging the subscale
  means (rather than all 20 objective items directly) is correct because subscales have different
  item counts; item-count differences would otherwise bias the total. Section E is subjective
  (personal preference) so it is reported/discussed but not part of the objective quality score.
- **Trade-offs:** None methodologically; keeping E available supports the discussion chapter.

## ADR-005 — Scoring logic as pure, unit-testable functions

- **Context:** MARS (and later SUS + the recommendation algorithm) involve calculations that must
  be correct and defensible.
- **Decision:** Implement scoring as pure functions (no DB, no HTTP) in `server/src/lib/scoring/`,
  separate from the route handlers.
- **Rationale:** Pure functions are trivially unit-testable without a running server or database,
  reusable across the app, and keep route handlers focused on HTTP concerns. "I unit-tested my
  scoring logic" is directly defensible to examiners.
- **Trade-offs:** Slightly more files/indirection vs. inlining the maths in the route.

## ADR-006 — JWT-based admin authentication, built from scratch

- **Context:** The admin (MARS entry) module must be protected so only the researcher can submit
  or edit evaluation data.
- **Decision:** Hand-built auth: bcrypt password hashing (cost 12) + signed JWTs
  (`jsonwebtoken`) with a short expiry (2h), verified by an `authGuard` middleware.
- **Rationale:** Building auth explicitly (rather than using a framework's built-in) lets the
  dissertation explain and critically discuss how authentication actually works — hashing, salting,
  signature-based tamper protection, and the stateless-JWT revocation trade-off. Short expiry
  limits the damage window given JWTs cannot be easily revoked server-side.
- **Trade-offs:** Stateless JWTs sacrifice easy immediate revocation; mitigated by short expiry.
  A refresh-token/denylist scheme could be added later if needed.

## ADR-007 — Server-side validation is authoritative (never trust the client)

- **Context:** MARS/SUS inputs must be within valid ranges (e.g. each item an integer 1–5), and a
  future React form will have dropdowns enforcing this.
- **Decision:** Validate all inputs on the **server**, independently of any frontend restrictions.
- **Rationale:** The frontend form is only one way to reach the API; requests can be sent directly
  (curl, scripts, dev tools), bypassing client-side checks entirely. Invalid data would corrupt the
  study's dataset and findings. Frontend validation is for UX; server validation is for correctness
  and security.
- **Trade-offs:** Some duplicated validation intent across client and server — acceptable and
  standard.

## ADR-008 — MARS rounding: average at full precision, round only for presentation

- **Context:** `marsTotal` is the mean of the four objective subscale means. Rounding can be
  applied at different stages, which can shift the total by ~0.01–0.05.
- **Decision:** Compute all means at **full floating-point precision** (average-then-round). The
  overall total is computed from the UNROUNDED subscale means; every value is rounded to 2 d.p.
  for presentation only.
- **Rationale:** Avoids compounding rounding errors, so the total is the most numerically accurate
  representation of the underlying item scores. This is the approach generally preferred in
  quantitative analysis.
- **Trade-off:** A reader averaging the *displayed* (rounded) subscale means by hand may get a
  value differing from the reported total by ~0.01, because the total was computed from unrounded
  means. Mitigated by stating in the methodology: "All computations retain full precision; values
  are rounded to 2 d.p. for presentation only."
- **Status:** Decided (confirm with supervisor at next meeting). Must be stated explicitly in the
  methodology chapter for reproducibility.

---

## Open questions / to confirm with supervisor

- Ethics approval form + process (COMPULSORY before recruiting participants; target users skew
  elderly = "vulnerable" — frame as general usability study with general adults + informed consent).
- Weight justification for the recommendation algorithm (0.6 MARS / 0.4 SUS) — needs literature
  backing + a sensitivity analysis.
- Final title wording (handbook: ≤15 words, avoid "An investigation of…"/"Analysis of…" openers).
