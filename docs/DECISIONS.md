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

## ADR-009 — SUS scoring per the standard Brooke (1986) formula

- **Context:** Participant usability is measured with the System Usability Scale (SUS): 10 items,
  each answered 1–5, with alternating positive (odd) and negative (even) wording.
- **Decision:** Compute SUS by the standard formula — odd items contribute `answer − 1`, even items
  contribute `5 − answer`, summed and multiplied by 2.5 to yield a 0–100 score.
- **Rationale:** This is the validated, widely-cited SUS scoring method; using it verbatim keeps the
  study comparable to the large body of SUS literature. The alternating item wording is a
  deliberate design feature to counter acquiescence bias.
- **Interpretation note (for the discussion chapter):** the *formula* outputs 100 for ideal
  answers, 50 for all-neutral, 0 for worst-case. Separately, the literature benchmark is that a SUS
  of ~68 is "average"; scores should be interpreted against that benchmark, not treated as simple
  percentages. Keep the computation and the interpretation distinct in the write-up.

## ADR-010 — Survey integrity: consent gate, randomised assignment, one-response-per-app

- **Context:** Participant data must be ethically collected and methodologically sound to be
  defensible in the dissertation and viva.
- **Decisions:**
  1. **Consent is enforced server-side** — a participant cannot be created (and thus cannot start a
     session) unless `consentGiven === true`. Consent version + timestamp are recorded.
  2. **App assignment is randomised** using an unbiased Fisher–Yates shuffle; each session gets a
     random 3–5 app subset of the requested condition, and the presentation order is stored.
  3. **A session requires ≥3 apps in the condition** (else `409`), matching the "3–5 apps per
     participant" methodology.
  4. **One SUS response per (session, app)** enforced by a composite unique constraint
     (`@@unique([sessionId, appId])`); submission uses `upsert` so re-submitting updates rather
     than erroring (avoids Prisma P2002 unique-violation).
  5. **Apps must belong to the session** — a SUS submission for an app not in the assigned set is
     rejected (`400`).
- **Rationale:** These directly implement the ethics requirement (informed consent) and the bias
  mitigations (randomised subset + order counter order effects), and protect dataset integrity —
  all points that can be written up and defended.
- **Trade-offs:** Fixed presentation order currently equals assignment order; could randomise them
  independently later if needed. Fisher–Yates chosen over `sort(() => Math.random())` because the
  latter is statistically biased.

## ADR-011 — Min–max normalise MARS and SUS to [0,1] before weighting

- **Context:** The recommendation score combines expert quality (MARS, range 1–5) and perceived
  usability (mean SUS, range 0–100) using weights (default 0.6 MARS / 0.4 SUS).
- **Problem:** Combining the raw scores directly (`0.6·marsTotal + 0.4·susMean`) lets SUS dominate
  purely because of its larger numeric range — max MARS contribution ≈ 3, max SUS contribution ≈
  40 — so the intended weighting is distorted and effectively meaningless.
- **Decision:** Normalise both to [0,1] before weighting, against the instruments' theoretical
  bounds: `marsNorm = (marsTotal − 1) / 4`, `susNorm = susMean / 100`. Then
  `score = wMars·marsNorm + wSus·susNorm` with `wMars + wSus = 1`.
- **Rationale:** Puts both criteria on equal footing so the weights reflect true relative
  importance rather than scale artefacts. Using theoretical bounds (rather than the observed
  min/max) keeps scores comparable across runs and datasets; an `observed` mode remains available
  as a configurable alternative for sensitivity discussion.
- **Trade-off:** Theoretical-bounds normalisation doesn't stretch to use the full [0,1] range if
  no app hits the extremes; acceptable and more reproducible than observed-range scaling.

## ADR-012 — Deterministic ranking with an explicit tie-breaker

- **Context:** Apps are ranked by combined score. Two apps can score identically, and the algorithm
  must produce a stable, reproducible order every run (a research tool must not reorder tied items
  based on incidental database row order).
- **Problem:** A comparator that returns 0 on ties leaves order to `Array.sort` stability + the
  underlying `findMany` order, which has no explicit `orderBy` and can vary — i.e. non-reproducible.
- **Decision:** Break ties deterministically: (1) higher combined score first; (2) if equal, higher
  normalised MARS first (quality edge, nulls treated as -1); (3) if still equal, alphabetical by
  app name (`localeCompare`) as a fully deterministic final fallback.
- **Rationale:** Guarantees the same ranking on every run for the same data — essential for a
  reproducible study and a defensible viva demo. Prefers quality (MARS) as the first tie-break, a
  meaningful and justifiable rule.
- **Trade-off:** Alphabetical fallback is arbitrary but deterministic; acceptable as a last resort
  and clearly documented.

---

# Amendments following the project briefing (24 Sep 2026)

The Project Paper Briefing of 18 Sep 2026 supplied the confirmed marking rubric, deadlines, and
ethics workflow. Several earlier ADRs asserted more than the evidence supported and are corrected
here rather than silently edited, so the reasoning trail stays honest.

- **Preamble correction.** This log previously stated that the handbook "weights the written
  analysis and knowledge gained far above the software artefact". The *direction* is right, but the
  handbook states no numeric weighting. The **actual** rubric is ten criteria at 10% each, in which
  implementation is not a standalone criterion — the stronger and now evidenced statement.
- **ADR-001.** The architectural choice stands. The claim about what "examiners expect" is removed:
  the rubric rewards design/method (C3) and validation (C6), not engineering volume.
- **ADR-003.** The claim that switching database provider needs only a connection-string change is
  inaccurate. `schema.prisma` pins `provider = "sqlite"`; a move to PostgreSQL also requires a
  provider edit, client regeneration, and a fresh migration baseline.
- **ADR-005.** Downgraded from "unit-tested" to **"designed to be unit-testable"**. No test
  framework, test script, or test file exists. The two defects recorded in `PROJECT.md` §6a are the
  direct consequence.
- **ADR-010.** Downgraded from a decided ethics implementation to **provisional technical controls
  pending approval**. A server-side boolean consent gate is a useful control but is *not*
  informed-consent compliance, which additionally requires an approved participant information
  sheet, withdrawal route, and data-handling declaration.
- **ADR-011.** The 0.6 / 0.4 split remains a **working hypothesis**, not a decision, until it has
  literature support and a sensitivity analysis.

---

## ADR-013 — Treat ethics approval as a hard, blocking gate before any data collection

- **Context:** The briefing confirms ethics carries **20% of the grade** (C8 ethical implications +
  C9 ethics and professionalism) and defines the workflow: a one-page research summary, the correct
  form, **supervisor and second-marker signatures**, then submission to Moodle. Three mutually
  exclusive forms exist (disclaimer, fast track, full track).
- **Decision:** No participant may be recruited, piloted, or have data recorded until written
  approval exists. Ethics is modelled as **Phase 9**, blocking Phase 10, rather than as paperwork
  running alongside development.
- **Rationale:** Data collected before approval is unusable and unpublishable, and would jeopardise
  20% of the marks plus CLO3. The gate is also cheap to honour now and impossible to repair later.
- **Route:** Prepare for **full track**. The study involves human participants, self-reported
  chronic-condition status, and potentially patients — the fast-track form routes any such "yes" to
  full review, and the disclaimer form is not defensible here. The supervisor/ethics chair makes the
  formal determination.
- **Trade-off:** Full track takes longer to prepare and review, compressing the survey window. This
  is accepted; the alternative is an invalid study.
- **Status:** Decided. Route pending confirmation.

## ADR-014 — Add entrepreneurial value as an explicit objective

- **Context:** Marking criterion **C7 (10%)** and **CLO2** require justification of the
  entrepreneurial value and prospects of the proposed solution. Neither appeared anywhere in the
  project's aim, objectives, scope, or documentation before this date — a fully unaddressed tenth of
  the grade.
- **Decision:** Add **Objective 6** (entrepreneurial value and commercialisation prospects) and
  **Phase 12**, and allocate explicit sections in Ch.1 and Ch.5 covering market need, target
  segment, cost/benefit, adoption barriers, competing offerings, and a sustainability model.
- **Rationale:** An unaddressed criterion scores zero regardless of how strong the engineering is.
  This is also the single highest-value, lowest-effort correction available: it requires no code.
- **Trade-off:** None of substance; it is a required deliverable.
- **Status:** Decided.

## ADR-015 — Fix and test research-critical code before collecting data

- **Context:** Inspection confirmed that SUS input validation never rejects invalid input (the guard
  tests the arity of an imported `console.error` function instead of the `errors` array), and that
  participant registration uses an invalid Express call. There are no tests in the repository.
- **Decision:** Treat correctness of the scoring and capture path as a **research-validity**
  requirement, not a code-quality preference. Fix both defects, then add unit tests covering MARS and
  SUS boundary values, invalid and missing input, and ranking ties, before any participant data is
  collected.
- **Rationale:** A silently wrong SUS score corrupts the dataset that Ch.4 and the C6 validation
  depend on, and the corruption would be undetectable after the fact. Tests are also the concrete
  evidence behind claims made in Ch.3 about instrument implementation.
- **Trade-off:** Costs development time inside a compressed schedule; justified because the
  alternative risks invalidating the empirical contribution entirely.
- **Status:** ✅ **Implemented and verified, 24 Sep 2026.** Both defects fixed; 24 unit tests across
  MARS, SUS, and input validation all passing; the full participant flow exercised over HTTP. The
  SUS score returned by the API (77.5) matched the value derived by hand from Brooke's formula,
  confirming the chain from request through validation and scoring to persistence. See
  `PROJECT.md` §6b for the verification record.
- **Follow-on note:** unit tests cover the pure scoring functions only. There are still **no
  automated route or integration tests** — the API was verified manually. If the survey logic
  changes again, that manual check has to be repeated by hand, so route tests remain a sensible
  addition if time allows.

## ADR-016 — Scope discipline driven by the marking rubric

- **Context:** The rubric contains no standalone criterion for implementation quality. Six of the
  ten criteria (C1, C2, C4, C5, C7, C10) can be satisfied with no further code. Roughly twelve weeks
  remain to the 18 Dec 2026 report deadline, and no chapter has been drafted.
- **Decision:** Build only what the approved protocol and the C3/C6 evidence require. Institute a
  **hard development freeze in mid-November**. Deliberately out of scope unless a criterion demands
  them: multi-admin roles, app-store scraping, a sensitivity-analysis UI, CSV export tooling beyond
  what the analysis needs, and any UI beyond the survey and results screens.
- **Rationale:** Effort spent beyond the rubric is unmarked, and the dominant risk in this project is
  now an unwritten 15,000–20,000-word thesis rather than an incomplete prototype. The handbook
  explicitly accepts a prototype where a complete product is unrealistic.
- **Trade-off:** The artefact will be visibly a prototype. Acceptable and defensible.
- **Status:** Decided.

## ADR-017 — Missing-score policy must be a stated methodological rule

- **Context:** `recommend.ts` converts absent MARS or SUS values to `0` before weighting. An app with
  no evaluation data therefore still receives a score and remains in the ranking, and can surface as
  a fallback recommendation.
- **Problem:** Treating "not yet measured" as "measured as worst" is a substantive methodological
  claim disguised as a default value, and it is not currently documented or justified.
- **Decision (proposed):** Define an explicit eligibility rule — an app must have a MARS evaluation
  and a minimum number of SUS responses to be *ranked*; apps failing that threshold are reported
  separately as "insufficient data" rather than scored as zero. To be confirmed with the supervisor
  and stated in Ch.3.
- **Rationale:** Reviewers will ask how missing data was handled; the answer must be a defensible
  rule, not an implementation artefact.
- **Empirical confirmation (24 Sep 2026).** Running `GET /api/recommendations?condition=T2DM`
  against SUS-only data made both halves of the problem concrete:
  1. **An app with no data at all was still ranked.** "HealthifyMe" had `marsNorm: null` and
     `susNorm: null`, yet appeared at rank 6 with `score: 0` — present in the ranking purely
     because absence was coerced to zero. It should have been excluded as ineligible.
  2. **Absent MARS silently caps the whole scale.** With `wMars = 0.6`, no MARS data means 60% of
     every score is structurally missing, so the top-ranked app scored `0.39` of a possible `1.0`.
     Nothing can exceed `0.4`. The numbers are not on the scale a reader would assume, which is a
     reporting hazard as much as a ranking one.
  The engine behaved exactly as written; the defect is in the *policy*, not the code. Note also
  that `lowConfidence: true` and a human-readable `reason` were correctly emitted on every row —
  the system is honest about its own data quality, which is the right foundation to build the
  eligibility rule on.
- **Consequence for planning:** this promotes MARS evaluation (Phase 2) from routine preparation to
  the blocker on the recommendation engine producing meaningful output at all.
- **Status:** Proposed, now evidenced. Needs supervisor confirmation, then implementation.

## ADR-018 — Keep test data out of the analysis database

- **Context:** Verification on 24 Sep 2026 showed recommendation output reporting 2 SUS responses
  for apps that had received only 1 during that session, revealing that earlier manual test data
  was still present in `dev.db`.
- **Problem:** Once fabricated test responses and real participant responses share a database, they
  cannot be reliably separated after the fact, and every descriptive statistic and correlation
  computed from that data is suspect. It would have to be disclosed as a limitation at best.
- **Decision:** Treat the development database as disposable and never let it become the analysis
  database. Before collection begins: delete `dev.db`, re-run `prisma migrate dev` and
  `prisma db seed`, and confirm the SUS response count is zero. Live participant data lives in its
  own database.
- **Rationale:** Cheap to honour now and impossible to repair later — the same reasoning as the
  ethics gate in ADR-013. Being able to state that the analysis dataset contained only participant
  responses is a precondition for trusting any result in Ch.4.
- **Trade-off:** Loses the convenience of pre-existing data while developing. Acceptable; the seed
  script recreates the app catalogue in seconds.
- **Status:** Decided.

---

# Frontend decisions (Phase 8, 26 Sep 2026)

Decisions taken while building the participant-facing survey UI
(`web/`: Vite + React + TypeScript + Tailwind v4 + React Router).

## ADR-019 — Survey progress is derived from server state, not client state

- **Context:** A participant answers a 10-item SUS questionnaire for each of 3–5 apps in one
  sitting. The UI must know which app to show next.
- **Problem:** The obvious approach is a client-side counter (`currentAppIndex`). But a refresh, an
  accidental back-navigation, a flat battery, or a dropped connection would reset it — and the
  participant would either re-answer apps they had already rated or abandon the survey. Both
  outcomes damage the dataset, and "low survey response rate" is already the top risk on the
  register.
- **Decision:** The client holds **no progress state**. `GET /api/survey/sessions/:id` returns the
  assigned apps in stored presentation order plus `completedAppIds`, and the UI renders the first
  app not in that list. Each SUS response is persisted immediately on submission rather than being
  batched to the end.
- **Rationale:** The server is the single source of truth, so progress survives anything that
  happens to the browser. Reloading the same URL resumes exactly where the participant was. This
  also means the ranking page can bounce anyone who reaches it early (`remainingCount > 0`) back to
  the questionnaire, and the completion endpoint can refuse to finish a partial session — the same
  invariant enforced in three places from one piece of data.
- **Trade-off:** One extra HTTP request after each submission to refresh progress. Negligible
  against the cost of losing a participant mid-survey.
- **Status:** Implemented and manually verified — a mid-survey refresh retains position.

## ADR-020 — Preference ranking uses arrow buttons, not drag-and-drop

- **Context:** Participants must place the apps they tried in their own order of preference. This
  ordering is the comparison data for Objective 5 / criterion C6.
- **Options considered:** (a) drag-and-drop, (b) up/down arrow buttons, (c) a rank number per app
  via dropdowns.
- **Decision:** Up/down arrow buttons, with `aria-label` on each control and the boundary buttons
  disabled.
- **Rationale:** Drag-and-drop is the most visually appealing option and the worst on the criteria
  that matter here: it is difficult with a keyboard, unreliable on touch screens, and a known
  barrier for less confident and older users. **In a study whose subject is usability, an
  inaccessible ranking control would undermine the study's own premise** — a participant who cannot
  operate the control does not produce a missing data point, they produce a *wrong* one. Option (c)
  invites duplicate or missing ranks, which the API rejects anyway (see ADR-010), producing avoidable
  errors. Arrow buttons also add no dependency.
- **Trade-off:** Reordering a long list takes more clicks. Irrelevant at 3–5 items.
- **Related:** The reorder is animated via the View Transitions API with feature detection, and
  honours `prefers-reduced-motion`. Motion is never mandatory — unrequested animation can cause
  discomfort for some users, which would be a poor fit for this study in particular.
- **Status:** Implemented.

## ADR-021 — Ranking starts in the randomised presentation order

- **Context:** The ranking screen must show the apps in *some* initial order before the participant
  rearranges them.
- **Problem:** Whatever order is shown acts as an anchor. Some participants will submit without
  changing it, so the initial order partly becomes the measurement.
- **Decision:** Seed the list with the session's stored presentation order, which the server already
  randomises per session using Fisher–Yates (ADR-010).
- **Rationale:** The anchor cannot be removed, but it can be made **random across participants**
  rather than systematic. Any residual anchoring then adds noise instead of bias, which is the
  defensible position.
- **Open question for the supervisor:** a participant can submit an unmodified order. That may be a
  genuine preference or disengagement, and the two are currently indistinguishable. Recording
  whether the order was modified would allow this to be reported as a limitation. **Not yet
  implemented.**
- **Status:** Implemented; the accompanying measurement question is open.

## ADR-022 — SUS item order is load-bearing and lives in a content module

- **Context:** The SUS score depends on item position: odd items are positively worded and
  contribute `answer − 1`, even items are negatively worded and contribute `5 − answer` (ADR-009).
- **Problem:** In the UI the ten items are just an array. Reordering it — a change that looks purely
  cosmetic — would silently invert half the contributions and corrupt every subsequent score. No
  test or type would catch it, because the array would still be valid.
- **Decision:** Keep the items in `web/src/content/sus.ts` with an explicit warning comment that the
  order is not cosmetic, and derive the answer-key type from the array so the keys cannot drift from
  the API payload.
- **Rationale:** The risk is not that the code is wrong today but that a future reasonable-looking
  edit makes it wrong. Putting the constraint next to the data is the cheapest durable guard.
  Participant-facing copy also belongs outside JSX so that wording approved by the ethics committee
  can be changed in one file without touching layout — the same reasoning applies to the consent
  text.
- **Trade-off:** Order is enforced by a comment rather than by code. A stronger guard would be a
  test asserting the tone of each position; worth adding if the instrument is ever edited.
- **Status:** Implemented.

## ADR-023 — Error boundary so a UI crash cannot end a participant's session

- **Context:** "Platform bugs during live survey" is a red-flagged risk. During development, a
  single undefined property in one component produced a **completely blank page**.
- **Problem:** React unmounts the whole tree when a render throws. A participant would see a white
  screen, have no idea their earlier answers were saved, and simply leave. The failure is also
  silent — nothing reaches the researcher.
- **Decision:** Wrap the application in an `ErrorBoundary` that renders a recovery card with a
  reload button, placed outside the router so routing errors are caught too.
- **Rationale:** Crashes cannot be prevented by intention alone, so the design must fail visibly and
  recoverably rather than invisibly and terminally. The fallback can honestly state that previous
  answers are saved **because** progress is persisted server-side (ADR-019) — one decision making
  another one's guarantee possible.
- **Trade-off:** Must be a class component; React provides no hook equivalent. It will also only log
  to the console, so a crash during a real session leaves no durable record. Logging failures
  server-side would be a sensible addition before recruitment.
- **Status:** ⚠️ **NOT IMPLEMENTED.** This entry previously read "Implemented"; a review on
  29 Sep 2026 found no `ErrorBoundary` component anywhere in `web/`, and `main.tsx` renders
  `StrictMode > BrowserRouter > App` with nothing else. The status was recorded before the component
  was built and was never verified.
  **The blank-page risk this ADR exists to close is therefore still open**, on the data-collection
  path. Build it before recruitment, or the mitigation cited by ADR-024 and by the risk register does
  not exist.

## ADR-024 — Runtime validation is missing at the API boundary

- **Context:** The typed API client uses generics (`request<T>`) so each endpoint returns a precise
  type. The final step is `return body as T` — a **cast**, not a check.
- **Incident that exposed this (26 Sep 2026).** The frontend type declared `completedAppdIds` while
  the server sends `completedAppIds`. Because the interface and the component that consumed it
  agreed with *each other*, `tsc` reported no error. The dev server also reported nothing, because
  Vite strips types without checking them. The failure only appeared at runtime, as
  `Cannot read properties of undefined`, **on the SUS page — the screen that collects the study's
  primary data.** Diagnosis took several rounds and was only settled by logging the raw response
  body and comparing it to the interface character by character.
- **Root cause:** TypeScript verifies code against declared types. It never verifies declared types
  against what the server actually sends. A typed client therefore gives *confidence* about the API
  contract without giving *evidence* for it.
- **Decision (proposed):** Validate responses at the boundary with a schema library (Zod is already
  named in `ARCHITECTURE.md`), so a mismatch fails immediately, names the offending field, and can
  be surfaced as a handled error rather than a crash.
- **Interim mitigations, in force now:**
  1. Copy field names directly from a real `curl` response rather than typing them by hand.
  2. Run `npx tsc -b` when behaviour is unexpected — it catches the class of error the dev server
     hides, and it did find a genuine narrowing bug in `ConditionPage` in the same session.
  3. ~~The error boundary (ADR-023) contains the damage if a mismatch reaches production.~~
     **Not available** — the error boundary is not implemented (see ADR-023). A response-shape
     mismatch currently blanks the page, which is exactly how the `completedAppdIds` defect
     presented.
- **Why this is worth writing up:** it is a concrete, dated example of a real limitation of static
  typing in a data-collection path, with an identified remedy — more defensible in Ch.3 than a
  textbook assertion that "types improve reliability".
- **Trade-off:** Schema validation duplicates the shape definition and adds a dependency and a small
  runtime cost. Justified for endpoints that carry research data; arguably unnecessary elsewhere.
- **Status:** Proposed. Not implemented — recommended before recruitment.

## ADR-025 — Participants decline a whole application rather than omit individual items

- **Context:** The APU Fast Track ethics screening asks (Q6) whether participants will be given the
  option of omitting questions they do not want to answer. A "No" routes the application to Full
  Track.
- **Problem:** The SUS form required **all ten items** — a partial response cannot be scored against
  the validated instrument (ADR-009), so items cannot simply be made optional. Worse, the consent
  screen already promised *"you do not have to answer any question you would rather skip"*, which was
  **untrue** for the questionnaire. The study was therefore about to declare a protection it did not
  provide.
- **Options considered:**
  1. Allow individual SUS items to be skipped — invalidates the instrument, or silently discards
     responses the participant believes they submitted.
  2. Remove the promise and answer Q6 "No" — honest, but routes the study to Full Track.
  3. **Allow a participant to decline an entire application** and continue.
- **Decision:** Option 3. The ten items remain mandatory *within* an application; the alternative
  offered is to decline that application in full. Nothing presented to a participant is compulsory.
- **Rationale:** This is the only option that keeps the instrument valid, keeps the Q6 answer
  truthful, and removes a false promise from the consent screen. It also reflects the real objection a
  participant is likely to have — *"I don't want to rate this app"* — rather than the artificial one
  of objecting to item 7 of 10.
- **Implementation consequences, all deliberate:**
  - Declines are recorded **server-side** (`SurveySession.skippedAppIds`), so progress stays derived
    from the server and a refresh cannot resurrect a declined application (ADR-019).
  - The skip endpoint returns `409` if the application already has a response, so a participant can
    never appear to have both rated and refused the same app.
  - Session completion accepts every assigned app being **either rated or declined**.
  - Preference ranking validates against **rated** apps, not assigned apps. Without this change a
    participant who declined an app could never submit a valid ranking and would be trapped on the
    final screen — the ranking endpoint would reject every ordering they could produce.
  - A session with fewer than two rated apps skips ranking entirely: a one-item ordering carries no
    information for a rank correlation.
- **Consequences for analysis, to address in Ch.3 and Ch.4:**
  - Sessions with fewer than two rated applications produce **no preference data** and must be
    excluded from the Spearman comparison. The exclusion count should be reported rather than left
    implicit.
  - Rankings now vary in length between participants. The correlation is computed per session over
    that session's rated set, so this is handled, but it must be stated.
  - **The decline rate is itself a finding.** An application declined unusually often may be
    signalling something about its store listing or presentation, and is worth reporting alongside
    the SUS scores rather than discarding.
- **Trade-off:** fewer ratings per session, and unequal data across participants. Accepted: a forced
  response is worse data than an absent one, and a study that promises a protection it does not
  deliver is indefensible regardless of the statistics.
- **Status:** Implemented and verified — declining advances the counter, the ranking page shows only
  rated apps, and `AppPreference.rankedAppIds` records the reduced set.

## ADR-026 — Suppress the top recommendation when no application is confident

- **Context:** `rankApps` sets `topRecommendation` to the first app that is not `lowConfidence`, and
  falls back to `scored[0]` when no such app exists. Because absent MARS and SUS values are coerced
  to `0` before weighting (the policy problem recorded in ADR-017), that fallback can be an
  application holding **no measurements at all** — as observed with HealthifyMe, which ranked while
  having neither a MARS evaluation nor a single SUS response.
- **Problem:** rendering that app beneath a heading reading "Top recommendation" would assert
  something the data cannot support. It is the presentational form of the same error as treating
  "not measured" as "measured as worst": an absence is dressed up as a finding. In a study whose
  stated contribution is *evidence-based* recommendation, that would undermine the central claim.
- **Decision:** the results page computes whether **every** app in the ranking is `lowConfidence`. If
  so it suppresses the top-pick card entirely and shows an explicit notice that the ranking is
  displayed for transparency and should not be read as a recommendation. The ranking itself is still
  shown, with a per-row low-confidence marker.
- **Secondary decision:** each input is displayed **separately** — MARS, SUS, and the combined score —
  rather than the combined score alone. A missing measurement renders as "not evaluated" rather than
  as a number. This matters acutely while MARS data does not exist: with `wMars = 0.6`, every
  combined score is structurally capped at `0.4`, and a reader shown only the total would reasonably
  read a low number as a poor app rather than an unmeasured one.
- **Rationale:** the honest default when data is insufficient is to say so, not to present the
  least-bad option. Showing the ranking anyway preserves transparency, and the computation panel
  displays the live weights and threshold so the algorithm is inspectable rather than a black box
  during the viva.
- **Limitation, stated plainly:** this is a **presentational** mitigation. The API still returns a
  zero-data application as `topRecommendation`, so any other consumer of that endpoint would be
  misled. The durable fix is the eligibility rule proposed in ADR-017 — excluding applications below
  a data threshold from ranking altogether, rather than filtering at the point of display.
- **Trade-off:** a visitor may see no recommendation at all. Correct for now: there genuinely isn't
  one until MARS evaluation (Phase 2) is done. The notice makes that gap visible rather than
  disguising it.
- **Deliberately omitted:** interactive weight controls. The endpoint is entered when *either* weight
  is supplied but validated as though *both* were (defect M1, §6e), so passing one produces a
  misleading error. Worth adding for the sensitivity-analysis demo once M1 is fixed.
- **Status:** Implemented and verified — with no MARS data the notice appears, no top-pick card is
  shown, and every row is marked low confidence with MARS reading "not evaluated".

---

## Open questions / to confirm with supervisor

_Process now confirmed (briefing 18 Sep 2026): one-page research summary → correct form →
supervisor **and second-marker** signatures → submit to Moodle. The remaining questions are
substantive, not procedural._

- **Which ethics route applies** (disclaimer / fast track / full track)? Prepare for full track —
  see ADR-013. Note: the population cannot be reframed as "general adults" purely to avoid review;
  if the study genuinely recruits people managing chronic conditions, it must say so.
- **Supervisor meeting count** — briefing says ≥3, the logsheet template says 6. Assume 6.
- **Is click-through electronic consent acceptable**, and what audit evidence is required?
- ~~**MARS evaluator protocol** — single rater or multiple with inter-rater reliability?~~
  **Resolved:** single rater (no second rater available), with test–retest on ~5 apps as the
  reliability substitute. See `docs/MARS_SCORING_PROTOCOL.md`. Consequence: the scores are
  **"researcher-rated", not "expert-validated"**, and no inter-rater reliability can be reported.
  Still to confirm with the supervisor.
- **Missing-data eligibility rule** for ranking (ADR-017).
- Weight justification for the recommendation algorithm (0.6 MARS / 0.4 SUS) — needs literature
  backing + a sensitivity analysis.
- **Sample-size adequacy** — is 30–50 participants spread across 3 conditions and 18 apps defensible
  for the C6 validation, or should scope narrow to one condition / fewer apps?
- Final title wording (handbook: ≤15 words, avoid "An investigation of…"/"Analysis of…" openers).
