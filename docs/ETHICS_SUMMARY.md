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
| **Inclusion** | Aged 18 or over; able to give informed consent; able to read English; has internet access |
| **Exclusion** | Under 18. No participant is recruited through any clinical, care or patient setting. |
| **Recruitment** | Open online invitation through the researcher's own academic and personal networks and general social media. Voluntary self-selection. No inducement or payment. |
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
5. They place the applications in their own order of preference.
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
- Data are used solely for this dissertation and any resulting academic output, always in aggregate.
- Retention: retained until the dissertation is assessed and any appeal period has closed, then
  deleted. _[Confirm the required retention period with the supervisor.]_
- Development and test data are kept in a separate database from the analysis data, so that no
  fabricated response can enter the results.

## 8. Consent, voluntariness and withdrawal

- Participation is entirely voluntary and consent is explicit and recorded with a version number.
- A participant may stop at any point, without giving a reason and without consequence. Closing the
  browser ends participation.
- Any question may be skipped; the demographic questions default to "prefer not to say".
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

## Checklist before submitting

- [ ] Replace every `_[bracketed placeholder]_` above
- [ ] Confirm the required data-retention period with the supervisor
- [ ] Confirm whether the optional health-condition field routes this study to Full Track (§6)
- [ ] Align the consent wording in `web/src/content/consent.ts` with this summary
- [ ] Align the debrief wording in `web/src/pages/DonePage.tsx` with this summary
- [ ] Add the statement that responses cannot be withdrawn after submission to the consent screen
- [ ] Complete the Fast Track form and let its screening questions determine the route
- [ ] Obtain supervisor **and** second-marker signatures
- [ ] Submit summary + form via the FYP PG Bank portal / Moodle
