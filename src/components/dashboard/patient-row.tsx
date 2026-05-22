import { Badge } from "@/components/ui/badge";
import { sortByRecordedAtDesc } from "@/lib/sort";
import { cn, formatTime, initials } from "@/lib/utils";
import type { Patient } from "@/modules/clinical/types";
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
  safetyFlagLatest?: boolean;
}) {
  const latestScale = sortByRecordedAtDesc(
    patient.scales.filter((s) => s.type === "phq9"),
  )[0];

  const statusText = safetyFlagLatest
    ? "Flagged check-in"
    : hasCheckIn
      ? "Brief ready"
      : "Awaiting check-in";

  return (
    <Link
      href={`/dashboard/patients/${patient.id}`}
      aria-label={
        safetyFlagLatest
          ? `${patient.displayName} — safety flag on latest check-in`
          : patient.displayName
      }
      className={cn(
        "group relative flex items-center gap-3 rounded-2xl border px-4 py-4 transition-all sm:gap-4 sm:px-5",
        safetyFlagLatest
          ? "border-rose-300 bg-rose-50 pl-5 shadow-sm shadow-rose-100/60 ring-1 ring-rose-200/70 hover:bg-rose-50/90 hover:shadow-md hover:shadow-rose-200/60 sm:pl-6"
          : "border-transparent bg-white/60 hover:border-pulse-200/80 hover:bg-white hover:shadow-md hover:shadow-pulse-100/40",
      )}
    >
      {safetyFlagLatest && (
        <span
          aria-hidden
          className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-rose-500"
        />
      )}
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pulse-200 to-lavender-200 text-sm font-semibold text-pulse-800 sm:h-12 sm:w-12">
        {initials(patient.displayName)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="font-medium text-slate-800">
            {patient.displayName}
          </span>
          <Badge tone={riskTone[patient.riskLevel]}>{patient.riskLevel}</Badge>
          {safetyFlagLatest && (
            <Badge tone="rose" className="gap-0.5">
              <AlertTriangle className="h-3 w-3" />
              Safety
            </Badge>
          )}
        </div>
        <p className="truncate text-sm text-slate-500">{patient.diagnosis}</p>
        <p className="mt-1 text-xs text-slate-500 sm:hidden">
          {formatTime(patient.nextVisitAt)} · {statusText}
        </p>
      </div>
      <div className="hidden shrink-0 text-right sm:block">
        <p className="text-sm font-medium text-slate-700">
          {formatTime(patient.nextVisitAt)}
        </p>
        <p className="text-xs text-slate-500">
          PHQ-9: {latestScale?.score ?? "—"} · {statusText}
        </p>
      </div>
      <ChevronRight
        className={cn(
          "h-5 w-5 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-pulse-500",
        )}
      />
    </Link>
  );
}
