import { formatDate, formatTime } from "@/lib/utils";
import type { Patient } from "@/modules/clinical/types";
import type { PrepCard } from "./prep-card";

export type NoteExportOptions = {
  /** Off by default — brand should not land in the medical record */
  includeBrandPrefix?: boolean;
  /** Off by default — reduces PHI in OS clipboard history */
  includeIdentifiers?: boolean;
};

function formatPatientMessage(message: string): string[] {
  const trimmed = message.trim();
  if (!trimmed) return [];
  const lines = trimmed.split(/\r?\n/);
  return ["Patient message:", ...lines.map((line) => `  ${line}`)];
}

/** Plain-text brief formatted for paste into any EHR or note system */
export function formatPrepForNote(
  patient: Patient,
  prep: PrepCard,
  options: NoteExportOptions = {},
): string {
  const { includeBrandPrefix = false, includeIdentifiers = false } = options;

  const header = includeBrandPrefix
    ? "VISITPULSE — PRE-VISIT BRIEF"
    : "PRE-VISIT BRIEF";

  const lines: string[] = [header];

  const dxLine = patient.diagnoses
    .map((d) => (d.code ? `${d.description} (${d.code})` : d.description))
    .join("; ");

  if (includeIdentifiers) {
    lines.push(
      `Patient: ${patient.displayName} | Age ${patient.age}`,
      `Dx: ${dxLine || "—"}`,
    );
  } else if (dxLine) {
    lines.push(`Dx: ${dxLine}`);
  }

  lines.push(
    `Visit: ${formatDate(prep.visitAt)} ${formatTime(prep.visitAt)}`,
    `Generated: ${formatDate(prep.generatedAt)} ${formatTime(prep.generatedAt)}`,
    "",
    "SUMMARY",
    prep.summary,
  );

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
    const checkInWhen = `${formatDate(c.recordedAt)} ${formatTime(c.recordedAt)}`;
    lines.push(
      "",
      `LATEST CHECK-IN (${checkInWhen})`,
      `Sleep: ${c.sleepHours}h | Adherence: ${c.medicationAdherence}`,
    );
    const effects = c.sideEffects.filter((s) => s !== "None");
    if (effects.length) lines.push(`Side effects: ${effects.join(", ")}`);
    lines.push(...formatPatientMessage(c.patientMessage ?? ""));
    if (c.safetyFlag) {
      lines.push(
        "[SAFETY FLAG] Latest check-in flagged — review before visit per practice policy",
      );
    }
  }

  lines.push("", "MEDICATIONS", ...prep.medHighlights.map((h) => `• ${h}`));

  if (prep.talkingPoints.length) {
    lines.push("", "SUGGESTED FOCUS");
    for (const p of prep.talkingPoints) lines.push(`• ${p}`);
  }

  return lines.join("\n");
}

/** Example brief for marketing / demos */
export function sampleNoteExportText(): string {
  return `PRE-VISIT BRIEF
Visit: May 20, 2026 2:00 PM
Generated: May 20, 2026 8:15 AM

SUMMARY
Depression improving · Anxiety stable · Sleep 6.5h, adherence partial

SYMPTOM TRENDS
PHQ-9: Improving (-4 pts)
GAD-7: Stable (0 pts)

LATEST CHECK-IN (May 19, 2026 9:42 AM)
Sleep: 6.5h | Adherence: partial
Side effects: mild nausea
Patient message:
  Felt foggy in the mornings. Hard to focus at work.

MEDICATIONS
• Active: Venlafaxine XR 150mg
• Venlafaxine XR adjusted (150mg)

SUGGESTED FOCUS
• Read the patient's written message before the visit
• Explore barriers to medication adherence`;
}
