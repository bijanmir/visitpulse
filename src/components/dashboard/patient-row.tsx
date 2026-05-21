import { Badge } from "@/components/ui/badge";
import { formatTime, initials } from "@/lib/utils";
import type { Patient } from "@/modules/clinical/types";
import { cn } from "@/lib/utils";
import { AlertTriangle, ChevronRight } from "lucide-react";
import Link from "next/link";

const riskTone = {
  low: "pulse",
  moderate: "peach",
  elevated: "rose",
} as const;

export function PatientRow({
  patient,
  hasCheckIn,
  safetyFlagLatest = false,
}: {
  patient: Patient;
  hasCheckIn: boolean;
  /** Latest check-in (any date) has a safety flag */
  safetyFlagLatest?: boolean;
}) {
  const latestScale = patient.scales
    .filter((s) => s.type === "phq9")
    .sort(
      (a, b) =>
        new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
    )[0];

  return (
    <Link
      href={`/dashboard/patients/${patient.id}`}
      className={cn(
        "group flex items-center gap-4 rounded-2xl border px-5 py-4 transition-all",
        safetyFlagLatest
          ? "border-rose-200/90 bg-rose-50/40 hover:bg-rose-50/70 hover:shadow-md hover:shadow-rose-100/50"
          : "border-transparent bg-white/60 hover:border-pulse-200/80 hover:bg-white hover:shadow-md hover:shadow-pulse-100/40",
      )}
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pulse-200 to-lavender-200 font-semibold text-pulse-800">
        {initials(patient.displayName)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-slate-800">
            {patient.displayName}
          </span>
          <Badge tone={riskTone[patient.riskLevel]}>{patient.riskLevel}</Badge>
          {safetyFlagLatest && (
            <Badge tone="rose" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              Safety review
            </Badge>
          )}
        </div>
        <p className="text-sm text-slate-500">{patient.diagnosis}</p>
      </div>
      <div className="hidden text-right sm:block">
        <p className="text-sm font-medium text-slate-700">
          {formatTime(patient.nextVisitAt)}
        </p>
        <p className="text-xs text-slate-500">
          PHQ-9: {latestScale?.score ?? "—"}
          {safetyFlagLatest
            ? " · Flagged check-in"
            : hasCheckIn
              ? " · Brief ready"
              : " · Awaiting check-in"}
        </p>
      </div>
      <ChevronRight
        className={cn(
          "h-5 w-5 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-pulse-500",
        )}
      />
    </Link>
  );
}
