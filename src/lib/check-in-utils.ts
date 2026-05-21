import { mergeCheckIns } from "@/lib/check-in-store";
import type { CheckIn } from "@/modules/clinical/types";

export function getMergedCheckIns(
  patientId: string,
  baseCheckIns: CheckIn[],
): CheckIn[] {
  return mergeCheckIns(baseCheckIns, patientId);
}

export function getLatestCheckIn(checkIns: CheckIn[]): CheckIn | null {
  if (checkIns.length === 0) return null;
  return [...checkIns].sort(
    (a, b) =>
      new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
  )[0];
}

export function latestCheckInHasSafetyFlag(
  patientId: string,
  baseCheckIns: CheckIn[],
): boolean {
  const latest = getLatestCheckIn(getMergedCheckIns(patientId, baseCheckIns));
  return Boolean(latest?.safetyFlag);
}
