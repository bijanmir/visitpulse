import { sortByRecordedAtDesc } from "@/lib/sort";
import type {
  CheckIn,
  MedEvent,
  Patient,
  ScaleResponse,
} from "@/modules/clinical/types";

/** A field that can appear in a CSV export. */
export type FieldDef<TRow> = {
  /** Stable internal key, used for the field-picker state. */
  key: string;
  /** Spreadsheet column header. */
  header: string;
  /** Whether checked by default in the field picker. */
  defaultOn: boolean;
  /** When true, the field reveals patient-level identifiers / PHI. */
  identifierLevel: "none" | "low" | "high";
  /** Cell value extractor. */
  value: (row: TRow) => string | number | undefined | null;
};

export type DatasetDef<TRow> = {
  id: "patients" | "checkins" | "scales" | "medications";
  label: string;
  description: string;
  fields: FieldDef<TRow>[];
  rows: TRow[];
};

/* -------------------------------------------------------------------------- */
/* CSV serialization                                                          */
/* -------------------------------------------------------------------------- */

function escapeCsvCell(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return "";
  const str = String(value);
  // RFC 4180: quote if the cell contains a comma, quote, newline, or carriage return.
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function serializeCsv<TRow>(
  fields: FieldDef<TRow>[],
  rows: TRow[],
): string {
  if (fields.length === 0) return "";
  const lines: string[] = [];
  lines.push(fields.map((f) => escapeCsvCell(f.header)).join(","));
  for (const row of rows) {
    lines.push(fields.map((f) => escapeCsvCell(f.value(row))).join(","));
  }
  // Use \r\n for max-compatibility with Excel on Windows.
  return lines.join("\r\n") + "\r\n";
}

export function downloadCsv(filename: string, content: string): void {
  if (typeof window === "undefined") return;
  // Add the UTF-8 BOM so Excel auto-detects the encoding correctly.
  const blob = new Blob(["﻿" + content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Defer revoke so the browser has time to start the download.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function isoDateForFilename(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}

/* -------------------------------------------------------------------------- */
/* Dataset definitions                                                        */
/* -------------------------------------------------------------------------- */

export function patientsDataset(patients: Patient[]): DatasetDef<Patient> {
  const fields: FieldDef<Patient>[] = [
    {
      key: "id",
      header: "patient_id",
      defaultOn: true,
      identifierLevel: "low",
      value: (p) => p.id,
    },
    {
      key: "displayName",
      header: "display_name",
      defaultOn: false,
      identifierLevel: "high",
      value: (p) => p.displayName,
    },
    {
      key: "age",
      header: "age",
      defaultOn: true,
      identifierLevel: "low",
      value: (p) => p.age,
    },
    {
      key: "riskLevel",
      header: "risk_level",
      defaultOn: true,
      identifierLevel: "none",
      value: (p) => p.riskLevel,
    },
    {
      key: "primaryDxCode",
      header: "primary_dx_code",
      defaultOn: true,
      identifierLevel: "low",
      value: (p) => p.diagnoses[0]?.code ?? "",
    },
    {
      key: "primaryDxDescription",
      header: "primary_dx_description",
      defaultOn: false,
      identifierLevel: "high",
      value: (p) => p.diagnoses[0]?.description ?? "",
    },
    {
      key: "allDxCodes",
      header: "all_dx_codes",
      defaultOn: false,
      identifierLevel: "low",
      value: (p) => p.diagnoses.map((d) => d.code).filter(Boolean).join(";"),
    },
    {
      key: "allDxDescriptions",
      header: "all_dx_descriptions",
      defaultOn: false,
      identifierLevel: "high",
      value: (p) => p.diagnoses.map((d) => d.description).join(";"),
    },
    {
      key: "mainSymptom",
      header: "main_symptom",
      defaultOn: true,
      identifierLevel: "low",
      value: (p) => p.mainSymptom ?? "",
    },
    {
      key: "nextVisitAt",
      header: "next_visit_at",
      defaultOn: true,
      identifierLevel: "none",
      value: (p) => p.nextVisitAt,
    },
    {
      key: "checkInsCount",
      header: "checkins_count",
      defaultOn: true,
      identifierLevel: "none",
      value: (p) => p.checkIns.length,
    },
  ];
  return {
    id: "patients",
    label: "Patient roster",
    description:
      "One row per active patient with current diagnoses, risk level, and visit metadata.",
    fields,
    rows: patients,
  };
}

export type CheckInRow = CheckIn & { patientName: string };

export function checkInsDataset(
  patients: Patient[],
  checkInsByPatient: Record<string, CheckIn[]>,
): DatasetDef<CheckInRow> {
  const rows: CheckInRow[] = [];
  for (const p of patients) {
    for (const c of checkInsByPatient[p.id] ?? []) {
      rows.push({ ...c, patientName: p.displayName });
    }
  }
  rows.sort(
    (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
  );
  const fields: FieldDef<CheckInRow>[] = [
    {
      key: "patientId",
      header: "patient_id",
      defaultOn: true,
      identifierLevel: "low",
      value: (c) => c.patientId,
    },
    {
      key: "patientName",
      header: "patient_name",
      defaultOn: false,
      identifierLevel: "high",
      value: (c) => c.patientName,
    },
    {
      key: "checkInId",
      header: "checkin_id",
      defaultOn: false,
      identifierLevel: "none",
      value: (c) => c.id,
    },
    {
      key: "recordedAt",
      header: "recorded_at",
      defaultOn: true,
      identifierLevel: "none",
      value: (c) => c.recordedAt,
    },
    {
      key: "sleepHours",
      header: "sleep_hours",
      defaultOn: true,
      identifierLevel: "none",
      value: (c) => c.sleepHours,
    },
    {
      key: "adherence",
      header: "medication_adherence",
      defaultOn: true,
      identifierLevel: "none",
      value: (c) => c.medicationAdherence,
    },
    {
      key: "sideEffects",
      header: "side_effects",
      defaultOn: true,
      identifierLevel: "none",
      value: (c) => c.sideEffects.join(";"),
    },
    {
      key: "safetyFlag",
      header: "safety_flag",
      defaultOn: true,
      identifierLevel: "none",
      value: (c) => (c.safetyFlag ? "true" : "false"),
    },
    {
      key: "mainSymptomChange",
      header: "main_symptom_change",
      defaultOn: true,
      identifierLevel: "none",
      value: (c) => c.mainSymptomChange ?? "",
    },
    {
      key: "patientMessage",
      header: "patient_message",
      defaultOn: false,
      identifierLevel: "high",
      value: (c) => c.patientMessage ?? "",
    },
  ];
  return {
    id: "checkins",
    label: "Check-ins",
    description:
      "One row per submitted patient check-in. Includes sleep, adherence, side effects, and safety-flag state.",
    fields,
    rows,
  };
}

export type ScaleRow = ScaleResponse & {
  patientId: string;
  patientName: string;
};

export function scalesDataset(
  patients: Patient[],
  scalesByPatient: Record<string, ScaleResponse[]>,
): DatasetDef<ScaleRow> {
  const rows: ScaleRow[] = [];
  for (const p of patients) {
    for (const s of scalesByPatient[p.id] ?? []) {
      rows.push({ ...s, patientId: p.id, patientName: p.displayName });
    }
  }
  rows.sort(
    (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
  );
  const fields: FieldDef<ScaleRow>[] = [
    {
      key: "patientId",
      header: "patient_id",
      defaultOn: true,
      identifierLevel: "low",
      value: (s) => s.patientId,
    },
    {
      key: "patientName",
      header: "patient_name",
      defaultOn: false,
      identifierLevel: "high",
      value: (s) => s.patientName,
    },
    {
      key: "type",
      header: "scale_type",
      defaultOn: true,
      identifierLevel: "none",
      value: (s) => s.type,
    },
    {
      key: "score",
      header: "score",
      defaultOn: true,
      identifierLevel: "none",
      value: (s) => s.score,
    },
    {
      key: "maxScore",
      header: "max_score",
      defaultOn: true,
      identifierLevel: "none",
      value: (s) => s.maxScore,
    },
    {
      key: "recordedAt",
      header: "recorded_at",
      defaultOn: true,
      identifierLevel: "none",
      value: (s) => s.recordedAt,
    },
    {
      key: "items",
      header: "per_item_answers",
      defaultOn: false,
      identifierLevel: "none",
      value: (s) => (s.items ? s.items.join(";") : ""),
    },
  ];
  return {
    id: "scales",
    label: "Symptom scales",
    description:
      "One row per PHQ-9 or GAD-7 measurement. Per-item answers included as a semicolon-separated list when collected via check-in.",
    fields,
    rows,
  };
}

export type MedRow = MedEvent & { patientName: string };

export function medicationsDataset(
  patients: Patient[],
  medEventsByPatient: Record<string, MedEvent[]>,
): DatasetDef<MedRow> {
  const rows: MedRow[] = [];
  for (const p of patients) {
    for (const m of medEventsByPatient[p.id] ?? []) {
      rows.push({ ...m, patientName: p.displayName });
    }
  }
  rows.sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
  );
  const fields: FieldDef<MedRow>[] = [
    {
      key: "patientId",
      header: "patient_id",
      defaultOn: true,
      identifierLevel: "low",
      value: (m) => m.patientId,
    },
    {
      key: "patientName",
      header: "patient_name",
      defaultOn: false,
      identifierLevel: "high",
      value: (m) => m.patientName,
    },
    {
      key: "medEventId",
      header: "med_event_id",
      defaultOn: false,
      identifierLevel: "none",
      value: (m) => m.id,
    },
    {
      key: "medication",
      header: "medication",
      defaultOn: true,
      identifierLevel: "low",
      value: (m) => m.medication,
    },
    {
      key: "dose",
      header: "dose",
      defaultOn: true,
      identifierLevel: "low",
      value: (m) => m.dose,
    },
    {
      key: "type",
      header: "event_type",
      defaultOn: true,
      identifierLevel: "none",
      value: (m) => m.type,
    },
    {
      key: "startedAt",
      header: "started_at",
      defaultOn: true,
      identifierLevel: "none",
      value: (m) => m.startedAt,
    },
    {
      key: "endedAt",
      header: "ended_at",
      defaultOn: true,
      identifierLevel: "none",
      value: (m) => m.endedAt ?? "",
    },
    {
      key: "response",
      header: "response",
      defaultOn: true,
      identifierLevel: "none",
      value: (m) => m.response ?? "",
    },
    {
      key: "sideEffects",
      header: "side_effects",
      defaultOn: true,
      identifierLevel: "none",
      value: (m) => (m.sideEffects ?? []).join(";"),
    },
    {
      key: "reasonStopped",
      header: "reason_stopped",
      defaultOn: false,
      identifierLevel: "low",
      value: (m) => m.reasonStopped ?? "",
    },
  ];
  return {
    id: "medications",
    label: "Medications",
    description: "One row per medication event (start, dose change, stop).",
    fields,
    rows,
  };
}

/** Re-export shared sort util for callers that need it. */
export { sortByRecordedAtDesc };
