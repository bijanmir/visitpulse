import { sortByRecordedAtDesc } from "@/lib/sort";
import type { CheckIn, Patient, ScaleResponse } from "@/modules/clinical/types";
import type { MedEvent } from "@/modules/clinical/types";

export type CheckInHighlight = {
  /** Short label describing what fired this highlight, e.g. "Missed doses". */
  trigger: string;
  /** Action-oriented follow-up, e.g. "assess adherence and relapse risk". */
  suggestion: string;
};

export type PrepCard = {
  patientId: string;
  generatedAt: string;
  visitAt: string;
  summary: string;
  phq9Trend: { label: string; delta: number } | null;
  gad7Trend: { label: string; delta: number } | null;
  latestCheckIn: CheckIn | null;
  safetyAlert: boolean;
  medHighlights: string[];
  /**
   * Items pulled from the latest check-in by deterministic rules. NOT a
   * clinical recommendation — see SAFETY.md.
   */
  checkInHighlights: CheckInHighlight[];
};

function scaleDelta(scales: ScaleResponse[], type: ScaleResponse["type"]) {
  const filtered = sortByRecordedAtDesc(scales.filter((s) => s.type === type));
  if (filtered.length < 2) return null;
  const delta = filtered[0].score - filtered[1].score;
  const label =
    delta < -2 ? "Improving" : delta > 2 ? "Worsening" : "Stable";
  return { label, delta };
}

export function buildPrepCard(
  patient: Patient,
  medEvents: MedEvent[],
): PrepCard {
  const latestCheckIn = sortByRecordedAtDesc(patient.checkIns)[0];

  const activeMeds = medEvents
    .filter((e) => !e.endedAt)
    .map((e) => `${e.medication} ${e.dose}`);

  const recentChanges = medEvents
    .filter((e) => {
      const days =
        (Date.now() - new Date(e.startedAt).getTime()) / (1000 * 60 * 60 * 24);
      return days <= 28 && (e.type === "dose_change" || e.type === "start");
    })
    .slice(0, 2);

  const medHighlights = [
    activeMeds.length
      ? `Active: ${activeMeds.join(", ")}`
      : "No active medications logged",
    ...recentChanges.map(
      (e) =>
        `${e.medication} ${e.type === "start" ? "started" : "adjusted"} (${e.dose})`,
    ),
  ];

  const checkInHighlights: CheckInHighlight[] = [];
  if (latestCheckIn?.patientMessage?.trim()) {
    checkInHighlights.push({
      trigger: "Patient message",
      suggestion: "read before the visit",
    });
  }
  if (latestCheckIn?.safetyFlag) {
    checkInHighlights.push({
      trigger: "Safety flag",
      suggestion: "review safety screen responses",
    });
  }
  if (latestCheckIn?.medicationAdherence === "partial") {
    checkInHighlights.push({
      trigger: "Partial adherence",
      suggestion: "explore barriers",
    });
  }
  if (latestCheckIn?.medicationAdherence === "missed") {
    checkInHighlights.push({
      trigger: "Missed doses",
      suggestion: "assess adherence and relapse risk",
    });
  }
  if (latestCheckIn?.sideEffects.length) {
    const effects = latestCheckIn.sideEffects.filter((s) => s !== "None");
    if (effects.length) {
      checkInHighlights.push({
        trigger: `Side effects (${effects.join(", ")})`,
        suggestion: "follow up on tolerability",
      });
    }
  }

  const phq9 = scaleDelta(patient.scales, "phq9");
  const gad7 = scaleDelta(patient.scales, "gad7");

  const summaryParts = [
    phq9 ? `Depression ${phq9.label.toLowerCase()}` : null,
    gad7 ? `Anxiety ${gad7.label.toLowerCase()}` : null,
    latestCheckIn
      ? `Sleep ${latestCheckIn.sleepHours}h, adherence ${latestCheckIn.medicationAdherence}`
      : null,
  ].filter(Boolean);

  return {
    patientId: patient.id,
    generatedAt: new Date().toISOString(),
    visitAt: patient.nextVisitAt,
    summary:
      summaryParts.join(" · ") || "Awaiting recent patient-reported data",
    phq9Trend: phq9,
    gad7Trend: gad7,
    latestCheckIn: latestCheckIn ?? null,
    safetyAlert: Boolean(latestCheckIn?.safetyFlag),
    medHighlights,
    checkInHighlights,
  };
}
