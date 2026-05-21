# VisitPulse — Safety & crisis workflow

**Version:** demo / pre-pilot  
**Audience:** clinicians evaluating VisitPulse, and our own engineering checklist before any real patient data.

## What VisitPulse is

VisitPulse is a **pre-visit decision-support workflow**: symptom trends, medication timeline context, patient-reported check-ins, and a formatted brief for paste into your existing note system.

It is **not** a crisis service, emergency line, or replacement for your clinical judgment.

## What VisitPulse does *not* do

- **Does not** provide 24/7 monitoring or real-time crisis response  
- **Does not** guarantee that a clinician will see a submission immediately  
- **Does not** diagnose, triage, or direct treatment  
- **Does not** replace suicide risk assessment (e.g. C-SSRS) where your standard of care requires it  
- **Does not** contact patients, family, or emergency services on your behalf (in the current product)

## Patient-facing expectations

Patients completing a check-in see:

- A clear notice that the form is **not for emergencies**  
- Direction to call **988** (Suicide & Crisis Lifeline) or **911** if they are in immediate danger  

Check-in responses are delivered to the clinician’s dashboard; timing depends on when the clinician next opens the app.

## Safety flags (demo behavior)

A check-in may be marked with a **safety flag** when certain demo rules fire (e.g. missed adherence plus concerning free text). In production, flag rules must be defined with legal/clinical review.

**Current demo limitations:**

| Gap | Risk | Target behavior (pilot) |
|-----|------|-------------------------|
| No push/SMS/email on flag | Clinician may not see flag until next login | Configurable alert channel + audit log |
| No on-call routing | Unclear who is responsible at 11pm | Practice-level escalation policy in onboarding |
| No SLA | Liability ambiguity | Documented response expectations in BAA + in-app |

## Clinician-facing expectations

- **Schedule** and **Patients** lists surface anyone whose **latest check-in** is safety-flagged (badge + highlight).  
- **Pre-visit brief** includes `[SAFETY FLAG]` in copy-to-note text when applicable.  
- Clinicians remain responsible for follow-up per their license, practice policy, and standard of care.

## Recommended practice policy (before pilot)

1. Define who receives alerts and within what window (e.g. same day for outpatient).  
2. Document that check-in is **optional** and **not** for acute crisis use.  
3. Do not represent VisitPulse as HIPAA-compliant until BAA, audit logging, and hosting posture are in place.  
4. Keep copy-to-note exports **identifier-light** by default where possible.

## Reporting & audit (roadmap)

- Immutable audit log: who viewed which patient record and when  
- Export of safety-flag events for practice review  
- No PHI in application logs or third-party analytics  

## Contact

For product safety questions during pilot planning, document your escalation path here before go-live.

*This document is an engineering and positioning draft, not legal advice.*
