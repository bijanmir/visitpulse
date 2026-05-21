export function toDayKey(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-CA");
}

export function isSameDay(a: Date | string, b: Date | string): boolean {
  return toDayKey(a) === toDayKey(b);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function formatDayLabel(dayKey: string): string {
  const d = new Date(dayKey + "T12:00:00");
  const today = toDayKey(new Date());
  const yesterday = toDayKey(addDays(new Date(), -1));
  if (dayKey === today) return "Today";
  if (dayKey === yesterday) return "Yesterday";
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
