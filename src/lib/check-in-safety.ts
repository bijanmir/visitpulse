import { PHQ9_SI_INDEX } from "@/lib/symptom-scales";

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
}): boolean {
  // PHQ-9 item 9 (suicidal ideation) at any non-zero level is a flag.
  const siScore = input.phq9Items?.[PHQ9_SI_INDEX];
  if (typeof siScore === "number" && siScore > 0) return true;

  // Free-text keyword fallback: missed adherence + concerning language.
  const message = input.patientMessage.toLowerCase();
  return (
    input.medicationAdherence === "missed" &&
    (message.includes("worse") ||
      message.includes("suicid") ||
      message.includes("hurt myself"))
  );
}
