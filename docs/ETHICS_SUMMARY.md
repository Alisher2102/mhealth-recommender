# Research Summary for Ethical Approval

**Submit this one-page summary alongside the ethics form (Fast Track), per the Project Paper
briefing: research summary → completed form → supervisor and second-marker signatures → Moodle.**

| | |
|---|---|
| **Working title** | A Comparative Evaluation and Intelligent Recommendation System for Mobile Health Applications in Chronic Disease Self-Management |
| **Programme** | MSc Software Engineering — Project Paper (122026-RJD) |
| **Researcher** | _[your name / student ID]_ |
| **Supervisor** | _[supervisor name]_ |
| **Second marker** | _[second marker name]_ |
| **Date** | _[submission date]_ |
| **Status** | DRAFT for supervisor review — no recruitment before written approval |

---

## 1. Background and rationale

Mobile health (mHealth) applications are widely used to support the day-to-day self-management of
long-term conditions such as type 2 diabetes, hypertension and chronic respiratory disease. The
marketplace is largely unregulated, and published evaluations repeatedly find that a substantial
share of available applications fall short on quality and usability. Prospective users therefore
have little reliable basis on which to choose between thousands of options.

This project addresses that gap by building and evaluating a web-based system that combines a
structured expert quality assessment with real user-perceived usability data, and applies a
weighted multi-criteria algorithm to produce evidence-based, ranked recommendations.

## 2. Aim and research question

**Aim:** design, develop and evaluate a web-based recommendation system that comparatively assesses
mHealth applications using a weighted multi-criteria scoring algorithm.

**Primary research question:** to what extent does a weighted combination of expert-rated quality
(MARS) and user-perceived usability (SUS) produce application rankings that agree with the
preference ordering expressed by participants?

**Secondary questions:** how do the two instruments compare across applications, and how sensitive
is the resulting ranking to the weighting applied?

## 3. Design

A cross-sectional, quantitative evaluation study using two validated instruments.

- **Mobile Application Rating Scale (MARS)** — 23 items across four objective subscales plus a
  subjective section. Completed by the **researcher**, not by participants. No participant
  involvement.
- **System Usability Scale (SUS)** — 10 items, each answered 1–5. Completed by **participants**, one
  questionnaire per application reviewed.
- **Preference ranking** — participants place the applications they reviewed in their own order of
  preference. This ordering is the comparison data for the validation analysis.

Data are collected through a purpose-built web platform developed for this project.

## 4. Participants

| | |
|---|---|
| **Population** | General adults. This is **not** a patient study: participants are not recruited on the basis of any health condition, and no clinical population is approached. |
| **Target sample** | 30–50 participants |
| **Inclusion** | Aged 18 or over; **resident in Malaysia**; able to give informed consent; able to read English; has internet access |
| **Exclusion** | Under 18; resident outside Malaysia. No participant is recruited through any clinical, care or patient setting. |
| **Recruitment** | Online invitation through the researcher's own academic and personal networks within Malaysia. Voluntary self-selection. No inducement or payment. Recruitment material states that participation is open to adults in Malaysia. |
| **Relationship to researcher** | No participant is in a dependent or supervisory relationship with the researcher. |

Participants are asked to evaluate the **usability** of an application's interface. Since the System
Usability Scale measures perceived usability rather than clinical benefit, this judgement does not
require the participant to have the condition concerned. That participants are not drawn from the
target patient population is acknowledged as a limitation of the study rather than treated as a
strength.

## 5. Procedure

1. The participant reads the information and consent screen and gives explicit consent. Consent is
   enforced by the system: no participant record can be created without it.
2. They choose **the condition area they feel best able to comment on** — phrased as familiarity,
   not as a statement about their own health.
3. The system randomly assigns **3–5 applications** from that area and records the presentation
   order. Randomisation counters order effects.
4. For each application the participant reviews its public store listing and freely available
   material, then completes the 10-item SUS questionnaire.
5. A participant who would rather not rate a particular application may decline it and move on.
6. They place the applications they rated in their own order of preference.
6. A closing screen thanks and debriefs them.

**Expected time: approximately 10–15 minutes.**

Participants are **explicitly instructed not to create accounts, make purchases, or enter any real
personal or health information** into any third-party application. The task is evaluation of the
interface and presented information, not clinical use.

## 6. Data collected

Only the following are recorded, all against a randomly generated identifier:

| Field | Notes |
|---|---|
| Consent given, consent version, timestamp | Required record of informed consent |
| Age band | **Optional**, defaults to "prefer not to say" |
| Gender | **Optional**, defaults to "prefer not to say" |
| Whether the participant manages a long-term health condition (yes / no) | **Optional**, defaults to "prefer not to say". Boolean only — the specific condition is never requested |
| Condition area selected for review | Recorded as familiarity, not as a health status |
| SUS responses (10 items per application) and computed score | The primary measure |
| Preference ranking | The comparison data for validation |

**Not collected:** name, email address, telephone number, postal address, IP address, date of birth,
device identifiers, or any free-text field.

### Declared residual risk

The combination of the optional health-condition field with the selected condition area could, in
principle, permit an inference about a participant's own health. This is disclosed rather than
overlooked, and is mitigated by: the field being optional and defaulting to "prefer not to say";
recording a boolean rather than a named condition; presenting condition choice as familiarity;
holding no identifiers of any kind; and reporting results only in aggregate. No individual response
is reported or published.

## 7. Data handling

- Responses are stored in a project database keyed by a random identifier, with no identifying
  field, so the dataset is pseudonymous at the point of collection and cannot be linked back to an
  individual by the researcher.
- Access is limited to the researcher; the supervisor may inspect aggregate output.
- Data are used **solely for this Master's dissertation** and for no other purpose. There is no
  secondary use, no data sharing with third parties, and no reuse in any later study. Results are
  reported in aggregate only.
- Retention: retained until the dissertation is assessed and any appeal period has closed, then
  deleted. _[Confirm the required retention period with the supervisor.]_
- Development and test data are kept in a separate database from the analysis data, so that no
  fabricated response can enter the results.

## 8. Consent, voluntariness and withdrawal

- Participation is entirely voluntary and consent is explicit and recorded with a version number.
- A participant may stop at any point, without giving a reason and without consequence. Closing the
  browser ends participation.
- The demographic questions are optional and default to "prefer not to say". A participant who would
  rather not rate a particular application may **decline that application** and continue, so no item
  presented to them is compulsory. The ten SUS items are required *within* an application because a
  partial response cannot be scored against the validated instrument; declining the application as a
  whole is the alternative offered.
- Because no identifiers are held, an individual response cannot be located and removed after
  submission. **This is stated plainly on the consent screen before consent is given**, so the limit
  on withdrawal is understood in advance rather than discovered later.
- The closing screen debriefs participants on the purpose of the study.

## 9. Risks and mitigation

| Risk | Level | Mitigation |
|---|---|---|
| Time burden | Low | 10–15 minutes; participant may stop at any time |
| Disclosure of health status | Low | Optional boolean only; no identifiers; aggregate reporting; inference risk declared in §6 |
| Exposure of personal data to third-party applications | Low | Participants are instructed not to register, purchase, or enter real personal or health data |
| Misreading output as medical advice | Low | The platform presents a usability and quality comparison, **not** clinical guidance, and makes no diagnostic or treatment claim |
| Participant discomfort | Very low | No sensitive, distressing or intrusive questions are asked |

There is no deception, no covert observation, no physical intervention, and no vulnerable group is
targeted.

## 10. Analysis

Descriptive statistics for MARS and SUS by application. Both instruments are normalised to a common
0–1 range against their theoretical bounds before weighting, so that the weights express relative
importance rather than an artefact of differing scales. A weighted score is then computed
(provisionally 0.6 MARS / 0.4 SUS, to be justified against the literature and tested by sensitivity
analysis).

Validation compares the system-generated ranking against participants' own preference ordering using
**Spearman rank correlation**. Applications lacking sufficient data are reported separately rather
than scored, so that absent measurements are not treated as poor ones.

## 11. Declaration

No data collection, pilot with real participants, or recruitment of any kind will take place before
written ethical approval is granted.

---

## 12. Fast Track screening — basis for the route

Recorded so the routing decision is reproducible and can be defended if questioned.

**Q1–8 (baseline protections — all must be Yes or N/A):** all satisfied. Procedures are described in
advance; participation is stated as voluntary; consent is obtained and recorded electronically with a
version and timestamp; the study is not observational (N/A); participants are told they may stop at
any time; no item presented is compulsory (see below); confidentiality and non-identifiability are
stated; a debrief screen is shown on completion.

**On Q6 (omitting questions).** The demographic questions are optional. Within an application the ten
SUS items are required, because a partial response cannot be scored against the validated instrument.
The option offered instead is to **decline that application in full** and continue — so nothing shown
to a participant is compulsory, and no participant is obliged to answer a question they do not wish
to. This was a deliberate design change made in order to answer Q6 honestly rather than rely on a
strained reading.

**Q9–30 (risk and sensitivity — all No):**

- No deception, no distress, no contentious or sensitive topic, no invasive or intrusive procedure.
- **No sensitive materials or sensitive personal data** (Q12, Q24). No personal records are accessed.
  A single optional yes/no indicator is collected with no identifier of any kind and no named
  condition, and is not held as, or linked to, any record.
- No external agency approval, hazardous substances, GMOs, illegal activity, human tissue, or
  administration of substances.
- **No financial compensation** (Q22). Participation is unpaid and there is no inducement.
- **No future use of data** (Q23). The dataset is used solely for this dissertation. There is no
  secondary use, data sharing, or reuse in a later study.
- No photographs, video or audio. No personal particulars are known to any third party, because none
  are collected.
- **Malaysia only** (Q29). Recruitment is limited to adults resident in Malaysia and the recruitment
  material states this.
- **Q30** — the study is conducted online rather than at any physical site. There is no in-person
  attendance at premises, University or otherwise.

**Q31–33 (special groups — all No):**

- No work with animals; no external funding or collaborative partner.
- **No special group is involved** (Q32). Participants are general adults aged 18 or over.
  Specifically: nobody under 18 (confirmed at consent); **no patients**, because no participant is
  recruited on the basis of any health condition and no clinical, care or patient setting is
  approached; no person in custody; nobody lacking capacity; no relationship of influence such as
  carer and patient, or teacher and student; no gatekeeper permission required.

That an individual participant may happen to manage a long-term condition does not make this a study
of patients: the condition is not a recruitment criterion, is never named, and is recorded only as an
optional anonymous indicator.

---

## Checklist before submitting

**Documents to submit**

- [ ] The Fast Track form itself, completed online
- [ ] The 150-word description, typed into the form's *Description* box
- [ ] **Consent Form** — `docs/CONSENT_FORM.md`, converted to Word/PDF
- [ ] **Participant Information Sheet** — `docs/PARTICIPANT_INFORMATION_SHEET.md`, converted
- [ ] **This research summary**, converted — upload under *Additional Files*
- [ ] **The SUS questionnaire** (the ten items as participants see them) — *Additional Files*
- [ ] Tick option **(i)**: all key documents appended

**Before submitting**

- [ ] Replace every `_[bracketed placeholder]_` in all three documents
- [ ] Confirm the required **data-retention period** with the supervisor
- [ ] Confirm the **APU liability / insurance** position — the form asks you to declare awareness of
      it, so do not tick that box until you know whether anything is actually required for a
      low-risk online study
- [ ] Confirm that **electronic click-through consent** satisfies "written consent" (Q3)
- [ ] Implement the **decline-an-application** option in the platform, so the Q6 answer is true in
      the software and not only on paper
- [ ] Align `web/src/content/consent.ts` and `web/src/pages/DonePage.tsx` with these documents
- [ ] Obtain supervisor **and** second-marker signatures
- [ ] Submit via the FYP PG Bank portal / Moodle

**Do not tick** *"no significant ethical implications requiring a full ethics submission"* until the
supervisor has confirmed the route. It is a formal declaration, not a preference.
