import { sortByRecordedAtDesc } from "@/lib/sort";
import { severity } from "@/lib/symptom-scales";
import type {
  CheckIn,
  MedEvent,
  Patient,
  ScaleResponse,
  ScaleType,
} from "@/modules/clinical/types";

/**
 * Shape sent to the patient-summary route. Deliberately minimal — no PII,
 * no fields the model doesn't need. The cache key on the client is derived
 * from `cacheVersion` so summaries auto-invalidate when patient state changes.
 */
export type PatientSummaryContext = {
  cacheVersion: string;
  promptText: string;
};

function daysAgo(iso: string): number {
  return Math.round((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
}

function latestScale(
  scales: ScaleResponse[],
  type: ScaleType,
): { latest: ScaleResponse; previous: ScaleResponse | undefined } | null {
  const filtered = sortByRecordedAtDesc(scales.filter((s) => s.type === type));
  if (filtered.length === 0) return null;
  return { latest: filtered[0], previous: filtered[1] };
}

function describeScale(scales: ScaleResponse[], type: ScaleType): string {
  const entry = latestScale(scales, type);
  const name = type === "phq9" ? "PHQ-9" : "GAD-7";
  if (!entry) return `Latest ${name}: none on file.`;
  const { latest, previous } = entry;
  const bucket = severity(type, latest.score);
  if (!previous) {
    return `Latest ${name}: ${latest.score}/${latest.maxScore} (${bucket}) — first measurement, no prior delta.`;
  }
  const delta = latest.score - previous.score;
  const direction =
    delta < -2 ? "improving" : delta > 2 ? "worsening" : "stable";
  const sign = delta > 0 ? "+" : "";
  return `Latest ${name}: ${latest.score}/${latest.maxScore} (${bucket}); was ${previous.score} — ${direction}, ${sign}${delta}.`;
}

function describeActiveMeds(events: MedEvent[]): string {
  const active = events.filter((e) => !e.endedAt);
  if (active.length === 0) return "Active meds: none logged.";
  const lines = active.map((e) => {
    const days = daysAgo(e.startedAt);
    return `${e.medication} ${e.dose} (${days} days on this dose)`;
  });
  return `Active meds: ${lines.join("; ")}.`;
}

function describeRecentMedChanges(events: MedEvent[]): string {
  const recent = sortByStartedAtDesc(events).filter((e) => daysAgo(e.startedAt) <= 60);
  if (recent.length === 0) return "Recent med changes (last 60 days): none.";
  const lines = recent.slice(0, 4).map((e) => {
    const days = daysAgo(e.startedAt);
    if (e.endedAt) {
      return `${e.medication} ${e.dose} stopped ${daysAgo(e.endedAt)} days ago${e.reasonStopped ? ` (reason: ${e.reasonStopped})` : ""}`;
    }
    const verb = e.type === "start" ? "started" : e.type === "dose_change" ? "adjusted to" : "stopped";
    return `${e.medication} ${e.dose} ${verb} ${days} days ago${e.response ? ` (response: ${e.response})` : ""}`;
  });
  return `Recent med changes: ${lines.join("; ")}.`;
}

function sortByStartedAtDesc(events: MedEvent[]): MedEvent[] {
  return [...events].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
  );
}

function describeLatestCheckIn(checkIns: CheckIn[]): string {
  const sorted = sortByRecordedAtDesc(checkIns);
  const latest = sorted[0];
  if (!latest) return "Latest check-in: none submitted.";
  const sideEffects = latest.sideEffects.filter((s) => s !== "None");
  const parts: string[] = [
    `${daysAgo(latest.recordedAt)} days ago`,
    `sleep ${latest.sleepHours}h`,
    `adherence ${latest.medicationAdherence}`,
  ];
  if (sideEffects.length) parts.push(`side effects: ${sideEffects.join(", ")}`);
  if (latest.safetyFlag) parts.push(`safety flag: yes`);
  let line = `Latest check-in: ${parts.join(", ")}.`;
  if (latest.patientMessage?.trim()) {
    line += ` Patient message (verbatim): "${latest.patientMessage.trim()}"`;
  }
  return line;
}

function describeDiagnoses(patient: Patient): string {
  if (patient.diagnoses.length === 0) return "Diagnoses: none on file.";
  const lines = patient.diagnoses.map((d, i) => {
    const prefix = i === 0 ? "Primary" : "Also";
    const code = d.code ? ` (${d.code})` : "";
    return `${prefix}: ${d.description}${code}`;
  });
  return `Diagnoses: ${lines.join("; ")}.`;
}

/**
 * Build the user-message text that gets sent to the model. Plain English on
 * purpose — the model's worked examples show this shape, so paragraph-style
 * input matches its training distribution better than JSON.
 */
export function buildPatientSummaryContext(
  patient: Patient,
  medEvents: MedEvent[],
  scales: ScaleResponse[],
  checkIns: CheckIn[],
): PatientSummaryContext {
  const promptText = [
    "Patient chart to summarize:",
    "",
    describeDiagnoses(patient),
    `Age: ${patient.age}y`,
    "",
    describeActiveMeds(medEvents),
    describeRecentMedChanges(medEvents),
    "",
    describeScale(scales, "phq9"),
    describeScale(scales, "gad7"),
    "",
    describeLatestCheckIn(checkIns),
    "",
    "Produce the 2-3 sentence summary now.",
  ].join("\n");

  const cacheVersion = computeCacheVersion(patient, medEvents, scales, checkIns);
  return { cacheVersion, promptText };
}

/**
 * Cache key fingerprint — changes whenever any of the inputs that affect the
 * summary change. Used by the client to decide whether to reuse a stored
 * summary or fetch a fresh one.
 */
function computeCacheVersion(
  patient: Patient,
  medEvents: MedEvent[],
  scales: ScaleResponse[],
  checkIns: CheckIn[],
): string {
  const latestCheckIn = sortByRecordedAtDesc(checkIns)[0];
  const latestPhq9 = latestScale(scales, "phq9")?.latest;
  const latestGad7 = latestScale(scales, "gad7")?.latest;
  const latestMed = sortByStartedAtDesc(medEvents)[0];
  const dxKey = patient.diagnoses.map((d) => d.code || d.description).join("|");
  return [
    `pt:${patient.id}`,
    `dx:${dxKey}`,
    `ci:${latestCheckIn?.id ?? "none"}`,
    `cic:${checkIns.length}`,
    `phq:${latestPhq9?.recordedAt ?? "none"}`,
    `gad:${latestGad7?.recordedAt ?? "none"}`,
    `med:${latestMed?.id ?? "none"}`,
    `medc:${medEvents.length}`,
  ].join(";");
}
