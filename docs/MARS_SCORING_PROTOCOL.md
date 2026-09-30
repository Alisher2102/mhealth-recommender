# MARS Scoring Protocol

The procedure followed when rating the shortlisted applications. Written **before** scoring begins so
the method is fixed in advance rather than reconstructed afterwards, and so Chapter 3 can describe
what was actually done.

> **Status:** DRAFT — confirm the single-rater design and the reliability approach with the supervisor
> before scoring begins.

---

## 1. Instrument

The **Mobile App Rating Scale (MARS)**: 23 items across four objective subscales (engagement,
functionality, aesthetics, information) plus one subjective subscale.

**Source:** Stoyanov, S. R., Hides, L., Kavanagh, D. J., Zelenko, O., Tjondronegoro, D., & Mani, M.
(2015). Mobile App Rating Scale: A New Tool for Assessing the Quality of Health Mobile Apps.
*JMIR mHealth and uHealth, 3*(1), e27. https://doi.org/10.2196/mhealth.3422

Each item is rated 1–5 against the anchor descriptors published with the instrument. **Scoring is done
against those published descriptors**, not against a paraphrase — the instrument's validity rests on
its own wording. The authors also released a training video, which is watched before scoring begins.

Scoring is computed by `computeMarsScores` (`server/src/lib/scoring/mars.ts`), which is unit-tested
against the instrument's bounds and subscale structure:

- The objective total is the mean of the **four objective subscale means** (ADR-004).
- Section E is recorded but **excluded** from the objective total.
- Means are computed at full precision and rounded to 2 d.p. for presentation only (ADR-008).

## 2. Rater design

**A single rater** — the researcher — scores all applications. This is a deliberate constraint of a
solo dissertation, not a methodological preference, and carries two consequences that are reported
rather than hidden:

1. **No inter-rater reliability can be computed.** Published MARS practice normally uses two
   independent raters, with some studies having a second rater score a subset purely to report an
   intraclass correlation. No second rater is available here.
2. **The scores are therefore described as "researcher-rated", not "expert-validated".** Any wording
   in the thesis implying independent expert consensus would overstate what was done.

**Reliability substitute — test–retest.** Five applications (roughly 30% of the set, selected across
all three condition categories) are re-scored **at least two weeks** after the first pass, blind to
the original scores. Agreement between the two passes is reported as an indicator of intra-rater
consistency.

The database stores one evaluation per application (`MarsEvaluation.appId` is unique), so the
re-scoring pass is kept in the scoring spreadsheet and the agreement computed offline. The first pass
is the one imported.

## 3. Procedure for each application

1. **Record identity before scoring** — name, platform, store URL, exact version, and the date
   accessed. Without version and date the evaluation is not reproducible, because these applications
   are updated frequently.
2. **Review the publicly available material**: store listing, description, screenshots, stated
   features, developer information, privacy statement, and the free tier where one is accessible.
3. **Search the literature for item D7 (evidence base)** — whether the application has been trialled
   and the results published. This is a search task, not a judgement; a query in Google Scholar and
   PubMed on the app name is recorded for each application.
4. **Score all 23 items in one sitting** for that application. Splitting an application across days
   is where inconsistency creeps in.
5. **Write a one-line justification for every 1 or 5.** Extremes are the scores most likely to be
   questioned in the viva, and the reasoning will not be remembered months later.
6. Enter the scores into `server/data/mars-scores.json` and import them (§6).

## 4. Consistency measures

- **Calibration pass.** The first three applications are scored, then set aside. After all eighteen
  are scored, those three are re-examined. Standards drift during a long rating exercise; comparing
  the first and last applications scored is the cheapest way to detect it.
- **Score by application, not by item.** All 23 items for one app, then move on — rather than scoring
  item A1 across all eighteen. The instrument is designed to be applied to a whole application.
- **No comparative scoring.** Each application is rated against the instrument's descriptors, not
  against the other applications in the set. Otherwise the scale becomes a ranking and loses its
  absolute meaning.

## 5. Edge cases and how they are handled

| Situation | Decision |
|---|---|
| No published trial or evidence for the app | A low score on D7, **not** a missing value. Absence of evidence is what the item measures |
| App requires payment before any use | Score from publicly available material only, and record the paywall in `notes`. State the limitation in Chapter 3 |
| App no longer available in the store | Exclude from the study and record the exclusion with the date checked. Do not score from memory or from cached listings |
| An item genuinely cannot be assessed | Record it in `notes` and raise it with the supervisor. The current schema requires all 23 items as integers 1–5, so there is no N/A path — a decision to exclude an item would need a schema change |
| App updated between scoring and the survey | Record both versions. If the change is substantial, note it as a threat to validity in Chapter 5 |

## 6. Data entry

Scores are kept in `server/data/mars-scores.json` — one entry per application, with metadata and the
23 items — and imported with:

```bash
cd server
npm run import:mars
```

The script validates every item (integer 1–5), computes the subscale means and total using the same
tested functions the API uses, records `storeUrl`, `versionEvaluated` and the date, and reports which
applications are not yet scored so the work can be done in batches.

**Why a file rather than direct API calls:** 18 applications × 23 items is 414 values. Keeping them in
a version-controlled file makes the dataset reviewable and the import repeatable, where equivalent
`curl` commands would leave the scores only in shell history.

## 7. What goes into the thesis

- The instrument, its citation, and the fact that scoring followed the published anchor descriptors.
- The single-rater design, stated as a limitation, with the test–retest agreement reported.
- The number of applications scored, excluded, and why.
- Version and date for every application assessed.
- The subscale means and totals, with Section E reported separately from the objective total.
