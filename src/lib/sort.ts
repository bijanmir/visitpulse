type WithRecordedAt = { recordedAt: string };

/** Newest-first sort by `recordedAt` ISO timestamp. */
export function sortByRecordedAtDesc<T extends WithRecordedAt>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
  );
}
