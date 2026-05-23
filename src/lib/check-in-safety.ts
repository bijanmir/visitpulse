import { PHQ9_SI_INDEX } from "@/lib/symptom-scales";
import type { MainSymptomChange } from "@/modules/clinical/types";

/**
 * Demo-only safety flag heuristic — NOT a clinical triage rule.
 * Production must use a reviewed instrument (e.g. C-SSRS items) and practice
 * policy. This intentionally errs on the side of flagging.
 */
export function demoSafetyFlagFromCheckIn(input: {
  medicationAdherence: "full" | "partial" | "missed";
  patientMessage: string;
  /** Per-question PHQ-9 answers (0–3) if collected this check-in. */
  phq9Items?: number[];
  /** Patient-rated change in their main symptom since last visit. */
  mainSymptomChange?: MainSymptomChange;
}): boolean {
  // PHQ-9 item 9 (suicidal ideation) at any non-zero level is a flag.
  const siScore = input.phq9Items?.[PHQ9_SI_INDEX];
  if (typeof siScore === "number" && siScore > 0) return true;

  // "Much worse" on the patient's main symptom combined with missed
  // medication adherence is a flag — both signals together suggest
  // the clinician should look at this before the visit.
  if (
    input.mainSymptomChange === "much_worse" &&
    input.medicationAdherence === "missed"
  ) {
    return true;
  }

  // Free-text keyword fallback: missed adherence + concerning language.
  const message = input.patientMessage.toLowerCase();
  return (
    input.medicationAdherence === "missed" &&
    (message.includes("worse") ||
      message.includes("suicid") ||
      message.includes("hurt myself"))
  );
}
