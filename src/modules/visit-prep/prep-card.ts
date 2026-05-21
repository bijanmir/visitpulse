import type { CheckIn, Patient, ScaleResponse } from "@/modules/clinical/types";
import type { MedEvent } from "@/modules/clinical/types";

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
  talkingPoints: string[];
};

function scaleDelta(scales: ScaleResponse[], type: ScaleResponse["type"]) {
  const filtered = scales
    .filter((s) => s.type === type)
    .sort(
      (a, b) =>
        new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
    );
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
  const latestCheckIn = [...patient.checkIns].sort(
    (a, b) =>
      new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
  )[0];

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

  const talkingPoints: string[] = [];
  if (latestCheckIn?.safetyFlag) {
    talkingPoints.push("Review safety screen responses from latest check-in");
  }
  if (latestCheckIn?.medicationAdherence === "partial") {
    talkingPoints.push("Explore barriers to medication adherence");
  }
  if (latestCheckIn?.medicationAdherence === "missed") {
    talkingPoints.push("Assess missed doses and relapse risk");
  }
  if (latestCheckIn?.sideEffects.length) {
    const effects = latestCheckIn.sideEffects.filter((s) => s !== "None");
    if (effects.length) {
      talkingPoints.push(
        `Follow up on reported side effects: ${effects.join(", ")}`,
      );
    }
  }
  if (latestCheckIn?.patientMessage?.trim()) {
    talkingPoints.unshift(
      "Read the patient's written message before the visit",
    );
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
    talkingPoints,
  };
}
