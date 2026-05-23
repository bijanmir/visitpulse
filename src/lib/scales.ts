import { getStoredCheckIns } from "@/lib/check-in-store";
import type { Patient, ScaleResponse } from "@/modules/clinical/types";

/**
 * Merge a patient's seed/historic scales with scales attached to their
 * locally-stored check-ins. SSR-safe — returns just `patient.scales` on the
 * server (localStorage is unavailable).
 */
export function mergePatientScales(patient: Patient): ScaleResponse[] {
  if (typeof window === "undefined") return patient.scales;
  const fromCheckIns = getStoredCheckIns(patient.id).flatMap(
    (c) => c.scales ?? [],
  );
  return [...patient.scales, ...fromCheckIns];
}
