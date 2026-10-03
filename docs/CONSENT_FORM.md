# Consent Form

**Document version:** 1.0 · **Date:** _[date]_ · **Status:** DRAFT pending ethical approval

> **For the researcher:** paste into Word, apply the required formatting, and upload as the
> *Consent Form* on the ethics submission. Replace every `_[bracketed placeholder]_` first.
>
> **Version control matters here.** The platform stores a `consentVersion` against every participant
> (currently `"v1"`). That value, this document's version, and the Information Sheet version must all
> correspond, so that you can demonstrate exactly what any given participant agreed to. If the
> wording changes after approval, increment all three.

---

## Study title

A Comparative Evaluation of Mobile Health Applications for Chronic Disease Self-Management:
A Web-Based User Study

**Researcher:** _[your name]_, MSc Software Engineering (Project Paper 122026-RJD),
Asia Pacific University
**Supervisor:** _[supervisor name]_

---

## How consent is obtained

This study is conducted entirely online and collects **no identifying information**, so consent is
given by explicit confirmation on screen rather than by handwritten signature. Collecting a signature
would require a name, and would therefore make an otherwise anonymous dataset identifiable —
defeating the confidentiality protection described in the Information Sheet.

The participant must actively confirm every statement below before any data can be recorded. This is
enforced by the platform: **a participant record cannot be created unless consent is given**, and the
consent version and timestamp are stored with it.

A signature block is provided at the foot of this document for use if the study is ever administered
in person or on paper.

---

## Statements to be confirmed

Please confirm that you agree with each of the following. You must agree to **all** of them in order
to take part.

| | Statement |
|---|---|
| 1 | I confirm that I am **18 years of age or older** and resident in Malaysia. |
| 2 | I have read and understood the **Participant Information Sheet** (version 1.0) for this study, and I have had the opportunity to consider the information. |
| 3 | I understand that my participation is **voluntary**, and that I am free to stop at any time, without giving a reason and without any consequence. |
| 4 | I understand that the background questions are optional, and that if I would rather not rate a particular application I may **decline that application** and continue. |
| 5 | I understand what I am being asked to do: to look at the publicly available listings of three to five mobile health applications and answer ten short questions about each, then place the ones I rated in my order of preference. |
| 6 | I understand that I am **not** required to install any application, create any account, make any payment, or enter any personal or health information into any application, and that I should **not** enter real personal or health information into any third-party application as part of this study. |
| 7 | I understand that **no name, email address, telephone number, address or other identifying detail** is collected, and that my answers are stored against a randomly generated code. |
| 8 | I understand that the background questions about age, gender and whether I manage a long-term health condition are **optional**, and that I may select "prefer not to say". |
| 9 | I understand that because no identifying information is collected, **once I submit my answers they cannot be traced back to me and therefore cannot be removed on request**, and that I may stop at any time before submitting. |
| 10 | I understand that my answers will be used **solely for a Master's dissertation** and for no other purpose, and that results will be reported **only as group findings**, never individually. |
| 11 | I agree to take part in this study. |

---

## On-screen equivalent

The platform presents the Information Sheet content and then requires the participant to tick a
single confirmation covering the statements above before proceeding:

> ☐ I have read the above, I am 18 or older, and I agree to take part.

Recorded at that moment: `consentGiven = true`, `consentVersion`, and `consentedAt` (timestamp). No
session can be created and no questionnaire response can be stored without it.

> **Note for the committee:** the on-screen wording is deliberately short because the full disclosure
> is presented immediately above it on the same page, so the participant reads the information and
> confirms it without navigating away.

---

## Signature block (for in-person or paper administration only)

Not used for the online study, which collects no identifying information.

| | |
|---|---|
| Name of participant | ____________________________ |
| Signature | ____________________________ |
| Date | ____________________________ |

| | |
|---|---|
| Name of researcher | ____________________________ |
| Signature | ____________________________ |
| Date | ____________________________ |

---

## Contact

Questions or concerns about this study may be directed to the researcher at
_[researcher contact — university email address]_, or to the project supervisor at
_[supervisor contact]_.
