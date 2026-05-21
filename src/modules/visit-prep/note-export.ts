import { formatDate, formatTime } from "@/lib/utils";
import type { Patient } from "@/modules/clinical/types";
import type { PrepCard } from "./prep-card";

/** Plain-text brief formatted for paste into any EHR or note system */
export function formatPrepForNote(patient: Patient, prep: PrepCard): string {
  const lines: string[] = [
    "VISITPULSE — PRE-VISIT BRIEF",
    `Patient: ${patient.displayName} | ${patient.diagnosis} | Age ${patient.age}`,
    `Visit: ${formatDate(prep.visitAt)} ${formatTime(prep.visitAt)}`,
    `Generated: ${formatDate(prep.generatedAt)} ${formatTime(prep.generatedAt)}`,
    "",
    "SUMMARY",
    prep.summary,
  ];

  if (prep.phq9Trend || prep.gad7Trend) {
    lines.push("", "SYMPTOM TRENDS");
    if (prep.phq9Trend) {
      lines.push(
        `PHQ-9: ${prep.phq9Trend.label} (${prep.phq9Trend.delta > 0 ? "+" : ""}${prep.phq9Trend.delta} pts)`,
      );
    }
    if (prep.gad7Trend) {
      lines.push(
        `GAD-7: ${prep.gad7Trend.label} (${prep.gad7Trend.delta > 0 ? "+" : ""}${prep.gad7Trend.delta} pts)`,
      );
    }
  }

  if (prep.latestCheckIn) {
    const c = prep.latestCheckIn;
    lines.push(
      "",
      "LATEST CHECK-IN",
      `Sleep: ${c.sleepHours}h | Adherence: ${c.medicationAdherence}`,
    );
    const effects = c.sideEffects.filter((s) => s !== "None");
    if (effects.length) lines.push(`Side effects: ${effects.join(", ")}`);
    if (c.patientMessage?.trim()) {
      lines.push(`Patient message: "${c.patientMessage.trim()}"`);
    }
    if (c.safetyFlag) lines.push("⚠ Safety flag on latest check-in — review before visit");
  }

  lines.push("", "MEDICATIONS", ...prep.medHighlights.map((h) => `• ${h}`));

  if (prep.talkingPoints.length) {
    lines.push("", "SUGGESTED FOCUS");
    for (const p of prep.talkingPoints) lines.push(`• ${p}`);
  }

  return lines.join("\n");
}
