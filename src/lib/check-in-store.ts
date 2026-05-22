import { sortByRecordedAtDesc } from "@/lib/sort";
import type { CheckIn } from "@/modules/clinical/types";

const STORAGE_KEY = "visitpulse-check-ins";

function readAll(): CheckIn[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CheckIn[]) : [];
  } catch {
    return [];
  }
}

function writeAll(checkIns: CheckIn[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(checkIns));
}

export function saveCheckIn(checkIn: CheckIn): void {
  const all = readAll();
  writeAll([checkIn, ...all]);
}

export function getStoredCheckIns(patientId: string): CheckIn[] {
  return sortByRecordedAtDesc(readAll().filter((c) => c.patientId === patientId));
}

export function mergeCheckIns(
  base: CheckIn[],
  patientId: string,
): CheckIn[] {
  const stored = getStoredCheckIns(patientId);
  const seen = new Set<string>();
  const unique = [...stored, ...base].filter((c) => {
    if (seen.has(c.id)) return false;
    seen.add(c.id);
    return true;
  });
  return sortByRecordedAtDesc(unique);
}
