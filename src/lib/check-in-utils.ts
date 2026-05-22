import { mergeCheckIns } from "@/lib/check-in-store";
import { sortByRecordedAtDesc } from "@/lib/sort";
import type { CheckIn } from "@/modules/clinical/types";

export function getLatestCheckIn(checkIns: CheckIn[]): CheckIn | null {
  if (checkIns.length === 0) return null;
  return sortByRecordedAtDesc(checkIns)[0];
}

export function latestCheckInHasSafetyFlag(
  patientId: string,
  baseCheckIns: CheckIn[],
): boolean {
  const latest = getLatestCheckIn(mergeCheckIns(baseCheckIns, patientId));
  return Boolean(latest?.safetyFlag);
}
