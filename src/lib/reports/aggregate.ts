import { mergeCheckIns } from "@/lib/check-in-store";
import { toDayKey } from "@/lib/date-utils";
import { mergePatientScales } from "@/lib/scales";
import { sortByRecordedAtDesc } from "@/lib/sort";
import { severity } from "@/lib/symptom-scales";
import type {
  CheckIn,
  MedEvent,
  Patient,
  ScaleResponse,
  ScaleType,
} from "@/modules/clinical/types";

export type PracticeMetrics = {
  totalPatients: number;
  checkInsLast7Days: number;
  checkInsLast30Days: number;
  flaggedLast7Days: number;
  /** Patients whose LATEST check-in is safety-flagged. */
  flaggedActivePatients: number;
  averageLatestPhq9: number | null;
  averageLatestGad7: number | null;
};

export type SeverityBucket =
  | "Minimal"
  | "Mild"
  | "Moderate"
  | "Moderately severe"
  | "Severe";

export type SeverityDistribution = Record<SeverityBucket, number>;

export type DailyCheckInCount = {
  dayKey: string;
  total: number;
  flagged: number;
};

export type FlaggedCheckInRow = {
  patientId: string;
  patientName: string;
  checkInId: string;
  recordedAt: string;
  adherence: CheckIn["medicationAdherence"];
  sleepHours: number;
  message?: string;
};

export type PracticeSnapshot = {
  generatedAt: string;
  metrics: PracticeMetrics;
  phq9Distribution: SeverityDistribution;
  gad7Distribution: SeverityDistribution;
  /** Last 90 days, oldest → newest. */
  checkInVolume: DailyCheckInCount[];
  /** Newest flagged check-ins across all patients (max 25). */
  recentFlagged: FlaggedCheckInRow[];
};

const EMPTY_DIST: SeverityDistribution = {
  Minimal: 0,
  Mild: 0,
  Moderate: 0,
  "Moderately severe": 0,
  Severe: 0,
};

function daysAgoISO(n: number): string {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
}

function withinLastDays(iso: string, n: number): boolean {
  return new Date(iso).getTime() >= new Date(daysAgoISO(n)).getTime();
}

function bucketFor(type: ScaleType, score: number): SeverityBucket {
  const label = severity(type, score);
  // `severity` returns strings that match the SeverityBucket union for PHQ-9;
  // GAD-7 only uses Minimal/Mild/Moderate/Severe (no "Moderately severe").
  return (label as SeverityBucket) ?? "Minimal";
}

/** Build the full snapshot from in-browser data. Pure function — no IO. */
export function buildPracticeSnapshot(input: {
  patients: Patient[];
  /** All known check-ins keyed by patient id (caller assembles via mergeCheckIns). */
  checkInsByPatient: Record<string, CheckIn[]>;
  /** All known scales keyed by patient id (caller assembles via mergePatientScales). */
  scalesByPatient: Record<string, ScaleResponse[]>;
}): PracticeSnapshot {
  const { patients, checkInsByPatient, scalesByPatient } = input;

  const allCheckIns: { row: CheckIn; patient: Patient }[] = [];
  for (const patient of patients) {
    const ci = checkInsByPatient[patient.id] ?? [];
    for (const c of ci) allCheckIns.push({ row: c, patient });
  }

  const checkInsLast7Days = allCheckIns.filter((c) =>
    withinLastDays(c.row.recordedAt, 7),
  ).length;
  const checkInsLast30Days = allCheckIns.filter((c) =>
    withinLastDays(c.row.recordedAt, 30),
  ).length;
  const flaggedLast7Days = allCheckIns.filter(
    (c) => c.row.safetyFlag && withinLastDays(c.row.recordedAt, 7),
  ).length;

  const flaggedActivePatients = patients.filter((p) => {
    const latest = sortByRecordedAtDesc(checkInsByPatient[p.id] ?? [])[0];
    return Boolean(latest?.safetyFlag);
  }).length;

  const latestPhq9Scores: number[] = [];
  const latestGad7Scores: number[] = [];
  const phq9Distribution: SeverityDistribution = { ...EMPTY_DIST };
  const gad7Distribution: SeverityDistribution = { ...EMPTY_DIST };

  for (const patient of patients) {
    const scales = scalesByPatient[patient.id] ?? [];
    const latestPhq9 = sortByRecordedAtDesc(scales.filter((s) => s.type === "phq9"))[0];
    const latestGad7 = sortByRecordedAtDesc(scales.filter((s) => s.type === "gad7"))[0];
    if (latestPhq9) {
      latestPhq9Scores.push(latestPhq9.score);
      phq9Distribution[bucketFor("phq9", latestPhq9.score)] += 1;
    }
    if (latestGad7) {
      latestGad7Scores.push(latestGad7.score);
      gad7Distribution[bucketFor("gad7", latestGad7.score)] += 1;
    }
  }

  const averageLatestPhq9 = latestPhq9Scores.length
    ? round1(latestPhq9Scores.reduce((a, b) => a + b, 0) / latestPhq9Scores.length)
    : null;
  const averageLatestGad7 = latestGad7Scores.length
    ? round1(latestGad7Scores.reduce((a, b) => a + b, 0) / latestGad7Scores.length)
    : null;

  // Check-in volume over the last 90 days, bucketed by day-key.
  const volumeMap = new Map<string, { total: number; flagged: number }>();
  for (let n = 89; n >= 0; n--) {
    volumeMap.set(toDayKey(new Date(Date.now() - n * 24 * 60 * 60 * 1000)), {
      total: 0,
      flagged: 0,
    });
  }
  for (const { row } of allCheckIns) {
    const key = toDayKey(row.recordedAt);
    const slot = volumeMap.get(key);
    if (!slot) continue;
    slot.total += 1;
    if (row.safetyFlag) slot.flagged += 1;
  }
  const checkInVolume: DailyCheckInCount[] = Array.from(volumeMap.entries()).map(
    ([dayKey, counts]) => ({ dayKey, ...counts }),
  );

  const recentFlagged: FlaggedCheckInRow[] = allCheckIns
    .filter((c) => c.row.safetyFlag)
    .sort(
      (a, b) =>
        new Date(b.row.recordedAt).getTime() -
        new Date(a.row.recordedAt).getTime(),
    )
    .slice(0, 25)
    .map(({ row, patient }) => ({
      patientId: patient.id,
      patientName: patient.displayName,
      checkInId: row.id,
      recordedAt: row.recordedAt,
      adherence: row.medicationAdherence,
      sleepHours: row.sleepHours,
      message: row.patientMessage,
    }));

  return {
    generatedAt: new Date().toISOString(),
    metrics: {
      totalPatients: patients.length,
      checkInsLast7Days,
      checkInsLast30Days,
      flaggedLast7Days,
      flaggedActivePatients,
      averageLatestPhq9,
      averageLatestGad7,
    },
    phq9Distribution,
    gad7Distribution,
    checkInVolume,
    recentFlagged,
  };
}

/** Helper: assemble the inputs from raw practice store data. */
export function collectAggregationInputs(
  patients: Patient[],
): {
  checkInsByPatient: Record<string, CheckIn[]>;
  scalesByPatient: Record<string, ScaleResponse[]>;
} {
  const checkInsByPatient: Record<string, CheckIn[]> = {};
  const scalesByPatient: Record<string, ScaleResponse[]> = {};
  for (const p of patients) {
    checkInsByPatient[p.id] = mergeCheckIns(p.checkIns, p.id);
    scalesByPatient[p.id] = mergePatientScales(p);
  }
  return { checkInsByPatient, scalesByPatient };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** Useful for the CSV dataset: one row per active medication regimen. */
export function flattenMedEvents(
  patients: Patient[],
  medEventsByPatient: Record<string, MedEvent[]>,
): Array<MedEvent & { patientName: string }> {
  const rows: Array<MedEvent & { patientName: string }> = [];
  for (const p of patients) {
    for (const e of medEventsByPatient[p.id] ?? []) {
      rows.push({ ...e, patientName: p.displayName });
    }
  }
  return rows;
}
