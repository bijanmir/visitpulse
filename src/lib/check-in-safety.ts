/**
 * Demo-only safety flag heuristic — NOT a clinical triage rule.
 * Production must use a reviewed instrument (e.g. C-SSRS items) and practice policy.
 */
export function demoSafetyFlagFromCheckIn(input: {
  medicationAdherence: "full" | "partial" | "missed";
  patientMessage: string;
}): boolean {
  const message = input.patientMessage.toLowerCase();
  return (
    input.medicationAdherence === "missed" &&
    (message.includes("worse") ||
      message.includes("suicid") ||
      message.includes("hurt myself"))
  );
}
