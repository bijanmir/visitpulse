export type RiskLevel = "low" | "moderate" | "elevated";

export type ScaleType = "phq9" | "gad7";

export type ScaleResponse = {
  type: ScaleType;
  score: number;
  maxScore: number;
  recordedAt: string;
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
