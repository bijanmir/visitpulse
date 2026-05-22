"use client";

import { PatientRow } from "@/components/dashboard/patient-row";
import { ScheduleAppointmentDialog } from "@/components/dashboard/schedule-appointment-dialog";
import { DayNavigator } from "@/components/ui/day-navigator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePatients } from "@/hooks/use-practice-store";
import { mergeCheckIns } from "@/lib/check-in-store";
import { buildSafetyFlagMap } from "@/lib/patient-safety-flags";
import { toDayKey } from "@/lib/date-utils";
import { getPatientsForDay } from "@/lib/practice-store";
import { Calendar, CalendarPlus } from "lucide-react";
import { useMemo, useState } from "react";

export default function DashboardPage() {
  const patients = usePatients();
  const [dayKey, setDayKey] = useState(() => toDayKey(new Date()));
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const dayPatients = useMemo(
    () => getPatientsForDay(dayKey, patients),
    [patients, dayKey],
  );

  const dayKeysWithVisits = useMemo(() => {
    const keys = new Set<string>();
    for (const p of patients) {
      keys.add(toDayKey(p.nextVisitAt));
    }
    return [...keys].sort().reverse();
  }, [patients]);

  const safetyFlags = useMemo(
    () => buildSafetyFlagMap(patients),
    [patients],
  );

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-800 sm:text-3xl">
            Schedule
          </h1>
          <p className="mt-1 text-sm text-slate-600 sm:text-base">
            Pick any day — past or upcoming visits
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => setScheduleOpen(true)}
          >
            <CalendarPlus className="h-4 w-4" />
            New appointment
          </Button>
          <Badge tone="lavender" className="shrink-0">
            Demo mode
          </Badge>
        </div>
      </div>

      <div className="mt-6">
        <DayNavigator
          dayKey={dayKey}
          onDayChange={setDayKey}
          dayKeysWithData={dayKeysWithVisits}
        />
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-600">
          <Calendar className="h-4 w-4 shrink-0 text-pulse-500" />
          {dayPatients.length} visit{dayPatients.length === 1 ? "" : "s"} on
          this day
        </div>
        {dayPatients.length === 0 ? (
          <div className="rounded-2xl bg-mist-50 px-4 py-10 text-center sm:px-6">
            <p className="text-sm text-slate-500">
              No visits on this day.
            </p>
            <Button
              variant="soft"
              size="sm"
              className="mt-4"
              onClick={() => setScheduleOpen(true)}
            >
              <CalendarPlus className="h-4 w-4" />
              Schedule a visit
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {dayPatients.map((patient) => {
              const merged = mergeCheckIns(patient.checkIns, patient.id);
              const hasCheckInOnDay = merged.some(
                (c) => toDayKey(c.recordedAt) === dayKey,
              );
              return (
                <PatientRow
                  key={patient.id}
                  patient={patient}
                  hasCheckIn={hasCheckInOnDay}
                  safetyFlagLatest={safetyFlags[patient.id] ?? false}
                />
              );
            })}
          </div>
        )}
      </section>

      <ScheduleAppointmentDialog
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        defaultDayKey={dayKey}
        onScheduled={(_id, scheduledDay) => setDayKey(scheduledDay)}
      />
    </div>
  );
}
