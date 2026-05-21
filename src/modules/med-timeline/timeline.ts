import type { MedEvent } from "@/modules/clinical/types";

export type TimelineSegment = {
  event: MedEvent;
  durationDays: number;
  label: string;
  tone: "active" | "stopped" | "changed";
};

export function buildTimeline(events: MedEvent[]): TimelineSegment[] {
  return [...events]
    .sort(
      (a, b) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
    )
    .map((event) => {
      const end = event.endedAt ? new Date(event.endedAt) : new Date();
      const start = new Date(event.startedAt);
      const durationDays = Math.max(
        1,
        Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
      );

      let label = `${event.medication} · ${event.dose}`;
      let tone: TimelineSegment["tone"] = "active";

      if (event.endedAt) {
        tone = "stopped";
        label += event.reasonStopped
          ? ` · stopped (${event.reasonStopped})`
          : " · discontinued";
      } else if (event.type === "dose_change") {
        tone = "changed";
        label += " · dose adjusted";
      }

      if (event.response) {
        label += ` · ${event.response} response`;
      }

      return { event, durationDays, label, tone };
    });
}
