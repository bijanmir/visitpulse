import { findIcd10ByCode } from "@/lib/icd10-codes";
import type { Diagnosis, Patient } from "@/modules/clinical/types";

/** Display label for a single diagnosis (description only; code rendered separately). */
export function diagnosisLabel(d: Diagnosis): string {
  return d.description;
}

/** First diagnosis is treated as primary. */
export function primaryDiagnosis(patient: Patient): Diagnosis | undefined {
  return patient.diagnoses[0];
}

/** Short summary string for surfaces with little room (rows, lists). */
export function summarizeDiagnoses(patient: Patient): string {
  const [first, ...rest] = patient.diagnoses;
  if (!first) return "No diagnosis recorded";
  if (rest.length === 0) return first.description;
  if (rest.length === 1) return `${first.description} + 1 more`;
  return `${first.description} + ${rest.length} more`;
}

/** True if any of the patient's diagnoses match the query substring. */
export function diagnosesMatch(patient: Patient, q: string): boolean {
  const needle = q.toLowerCase();
  return patient.diagnoses.some(
    (d) =>
      d.description.toLowerCase().includes(needle) ||
      d.code.toLowerCase().includes(needle),
  );
}

/**
 * Normalize legacy or partial data into `Diagnosis[]`. Accepts the historical
 * `diagnosis: string` field as a single free-text fallback so older
 * localStorage entries still work.
 */
export function normalizeDiagnoses(input: unknown): Diagnosis[] {
  if (Array.isArray(input)) {
    const result: Diagnosis[] = [];
    for (const raw of input) {
      if (!raw || typeof raw !== "object") continue;
      const r = raw as Record<string, unknown>;
      const description =
        typeof r.description === "string" ? r.description.trim() : "";
      const code = typeof r.code === "string" ? r.code.trim() : "";
      if (!description && !code) continue;
      // If the description is missing but the code is known, fill it in.
      const resolved =
        !description && code
          ? findIcd10ByCode(code)?.description ?? code
          : description;
      result.push({ code, description: resolved });
    }
    return result;
  }
  if (typeof input === "string" && input.trim()) {
    return [{ code: "", description: input.trim() }];
  }
  return [];
}
