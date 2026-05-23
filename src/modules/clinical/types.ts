export type RiskLevel = "low" | "moderate" | "elevated";

export type ScaleType = "phq9" | "gad7";

export type ScaleResponse = {
  type: ScaleType;
  score: number;
  maxScore: number;
  recordedAt: string;
  /** Per-question 0–3 answers when collected via patient check-in. */
  items?: number[];
};

export type MainSymptomChange =
  | "much_worse"
  | "a_little_worse"
  | "about_the_same"
  | "a_little_better"
  | "much_better";

export const MAIN_SYMPTOM_CHANGE_LABELS: Record<MainSymptomChange, string> = {
  much_worse: "Much worse",
  a_little_worse: "A little worse",
  about_the_same: "About the same",
  a_little_better: "A little better",
  much_better: "Much better",
};

/** Ordinal -2 (much worse) → +2 (much better). Useful for sorting/trends. */
export const MAIN_SYMPTOM_CHANGE_SCORE: Record<MainSymptomChange, number> = {
  much_worse: -2,
  a_little_worse: -1,
  about_the_same: 0,
  a_little_better: 1,
  much_better: 2,
};

export type CheckIn = {
  id: string;
  patientId: string;
  recordedAt: string;
  sleepHours: number;
  medicationAdherence: "full" | "partial" | "missed";
  sideEffects: string[];
  safetyFlag: boolean;
  /** Free-text message from the patient to their clinician */
  patientMessage?: string;
  /** Symptom scale scores administered during this check-in. */
  scales?: ScaleResponse[];
  /**
   * Patient-rated change in their primary presenting problem since the last
   * visit (CGI-C-style 5-point scale). Only collected when the clinician has
   * set `mainSymptom` on the patient — covers psychosis, insomnia, OCD, and
   * anything else the PHQ-9 / GAD-7 don't capture.
   */
  mainSymptomChange?: MainSymptomChange;
};

export type Diagnosis = {
  /** ICD-10 code; empty string for free-text diagnoses without a billable code. */
  code: string;
  description: string;
};

export type Patient = {
  id: string;
  displayName: string;
  age: number;
  /** First entry is the primary diagnosis. */
  diagnoses: Diagnosis[];
  nextVisitAt: string;
  riskLevel: RiskLevel;
  checkInToken: string;
  scales: ScaleResponse[];
  checkIns: CheckIn[];
  /**
   * Free-text description of the patient's primary presenting problem
   * — what they're being seen for. When set, the check-in flow asks the
   * patient to rate how this has changed since last visit (CGI-C-style).
   * Examples: "auditory hallucinations", "trouble falling asleep",
   * "intrusive thoughts", "panic episodes".
   */
  mainSymptom?: string;
};

export type MedEventType = "start" | "dose_change" | "stop";

export type MedResponse = "excellent" | "partial" | "none" | "worsened";

export type MedEvent = {
  id: string;
  patientId: string;
  medication: string;
  type: MedEventType;
  dose: string;
  startedAt: string;
  endedAt?: string;
  response?: MedResponse;
  sideEffects?: string[];
  reasonStopped?: string;
};
