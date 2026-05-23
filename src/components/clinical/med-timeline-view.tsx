"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MedEventDialog } from "@/components/clinical/med-event-dialog";
import { formatDate } from "@/lib/utils";
import { buildTimeline } from "@/modules/med-timeline/timeline";
import type { MedEvent } from "@/modules/clinical/types";
import { cn } from "@/lib/utils";
import { GitBranch, Pencil, Plus } from "lucide-react";
import { useState } from "react";

const toneStyles = {
  active: "border-pulse-300 bg-pulse-50",
  changed: "border-lavender-200 bg-lavender-100/50",
  stopped: "border-slate-200 bg-mist-50",
};

const toneBadge = {
  active: "pulse" as const,
  changed: "lavender" as const,
  stopped: "slate" as const,
};

export function MedTimelineView({
  events,
  patientId,
}: {
  events: MedEvent[];
  patientId: string;
}) {
  const segments = buildTimeline(events);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MedEvent | null>(null);

  function openAdd() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(event: MedEvent) {
    setEditing(event);
    setDialogOpen(true);
  }

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-pulse-700">
          <GitBranch className="h-4 w-4" aria-hidden />
          <h3 className="font-display text-lg font-semibold text-slate-800">
            Medication timeline
          </h3>
        </div>
        <Button size="sm" variant="soft" onClick={openAdd} className="print:hidden">
          <Plus className="h-4 w-4" aria-hidden />
          Add medication
        </Button>
      </div>

      {segments.length === 0 ? (
        <p className="mt-6 rounded-xl bg-mist-50 px-4 py-8 text-center text-sm text-slate-500">
          No medication trials logged yet. Add the first entry to build the
          timeline.
        </p>
      ) : (
        <div className="mt-6 space-y-0">
          {segments.map((seg, i) => (
            <div key={seg.event.id} className="relative flex gap-4 pb-8 last:pb-0">
              {i < segments.length - 1 && (
                <span
                  className="absolute left-[11px] top-6 h-[calc(100%-12px)] w-px bg-pulse-200"
                  aria-hidden
                />
              )}
              <span
                className={cn(
                  "relative z-10 mt-1 h-[22px] w-[22px] shrink-0 rounded-full border-2 bg-white",
                  seg.tone === "active"
                    ? "border-pulse-400"
                    : seg.tone === "changed"
                      ? "border-lavender-300"
                      : "border-slate-300",
                )}
              />
              <div className="min-w-0 flex-1">
                <div
                  className={cn(
                    "group rounded-xl border px-4 py-3",
                    toneStyles[seg.tone],
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-slate-800">
                      {seg.event.medication}
                    </span>
                    <Badge tone={toneBadge[seg.tone]}>
                      {seg.event.type.replace("_", " ")}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      {formatDate(seg.event.startedAt)} · {seg.durationDays}d
                    </span>
                    <button
                      type="button"
                      onClick={() => openEdit(seg.event)}
                      className="ml-auto inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 opacity-0 transition-opacity hover:bg-white/60 hover:text-pulse-700 focus-visible:opacity-100 group-hover:opacity-100 print:hidden"
                      aria-label={`Edit ${seg.event.medication}`}
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden />
                      Edit
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{seg.label}</p>
                  {seg.event.sideEffects && seg.event.sideEffects.length > 0 && (
                    <p className="mt-2 text-xs text-slate-500">
                      Side effects: {seg.event.sideEffects.join(", ")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <MedEventDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        patientId={patientId}
        editing={editing}
      />
    </Card>
  );
}
