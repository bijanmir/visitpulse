import { latestCheckInHasSafetyFlag } from "@/lib/check-in-utils";
import type { Patient } from "@/modules/clinical/types";

/** One pass over patients — avoids per-row localStorage reads in lists */
export function buildSafetyFlagMap(
  patients: Patient[],
): Record<string, boolean> {
  const flags: Record<string, boolean> = {};
  for (const patient of patients) {
    flags[patient.id] = latestCheckInHasSafetyFlag(
      patient.id,
      patient.checkIns,
    );
  }
  return flags;
}
