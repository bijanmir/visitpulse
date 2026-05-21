"use client";

import { PatientRow } from "@/components/dashboard/patient-row";
import { DayNavigator } from "@/components/ui/day-navigator";
import { Badge } from "@/components/ui/badge";
import { usePatients } from "@/hooks/use-practice-store";
import { mergeCheckIns } from "@/lib/check-in-store";
import { toDayKey } from "@/lib/date-utils";
import { getPatientsForDay } from "@/lib/practice-store";
import { Calendar } from "lucide-react";
import { useMemo, useState } from "react";

export default function DashboardPage() {
  const patients = usePatients();
  const [dayKey, setDayKey] = useState(() => toDayKey(new Date()));

  const dayPatients = useMemo(
    () => getPatientsForDay(dayKey),
    [patients, dayKey],
  );

  const dayKeysWithVisits = useMemo(() => {
    const keys = new Set<string>();
    for (const p of patients) {
      keys.add(toDayKey(p.nextVisitAt));
    }
    return [...keys].sort().reverse();
  }, [patients]);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-slate-800">
            Schedule
          </h1>
          <p className="mt-1 text-slate-600">
            Visits and check-ins for the day you select
          </p>
        </div>
        <Badge tone="lavender" className="shrink-0">
          Demo mode
        </Badge>
      </div>

      <div className="mt-8">
        <DayNavigator
          dayKey={dayKey}
          onDayChange={setDayKey}
          dayKeysWithData={dayKeysWithVisits}
        />
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-600">
          <Calendar className="h-4 w-4 text-pulse-500" />
          {dayPatients.length} visit{dayPatients.length === 1 ? "" : "s"} on
          this day
        </div>
        {dayPatients.length === 0 ? (
          <p className="rounded-2xl bg-mist-50 px-6 py-10 text-center text-sm text-slate-500">
            No visits scheduled for this day. Try another date or add a patient
            with a visit on this day.
          </p>
        ) : (
          <div className="space-y-2">
            {dayPatients.map((patient) => {
              const merged = mergeCheckIns(patient.checkIns, patient.id);
              const hasCheckInToday = merged.some(
                (c) => toDayKey(c.recordedAt) === dayKey,
              );
              return (
                <PatientRow
                  key={patient.id}
                  patient={patient}
                  hasCheckIn={hasCheckInToday}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
