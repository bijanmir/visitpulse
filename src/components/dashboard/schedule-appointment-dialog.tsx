"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { usePatients } from "@/hooks/use-practice-store";
import { defaultVisitTimeForDay, toDayKey } from "@/lib/date-utils";
import { updatePatient } from "@/lib/practice-store";
import { CalendarPlus, X } from "lucide-react";
import { useEffect, useState } from "react";

export function ScheduleAppointmentDialog({
  open,
  onClose,
  defaultDayKey,
  patientId: fixedPatientId,
  onScheduled,
}: {
  open: boolean;
  onClose: () => void;
  /** Pre-fill date (schedule page) */
  defaultDayKey?: string;
  /** When set, schedule for this patient only */
  patientId?: string;
  onScheduled?: (patientId: string, dayKey: string) => void;
}) {
  const patients = usePatients();
  const [patientId, setPatientId] = useState(fixedPatientId ?? "");
  const [visitAt, setVisitAt] = useState("");

  useEffect(() => {
    if (!open) return;
    setPatientId(fixedPatientId ?? patients[0]?.id ?? "");
    const day = defaultDayKey ?? toDayKey(new Date());
    setVisitAt(defaultVisitTimeForDay(day));
  }, [open, fixedPatientId, defaultDayKey, patients]);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!patientId || !visitAt) return;
    const updated = updatePatient(patientId, {
      nextVisitAt: new Date(visitAt).toISOString(),
    });
    if (updated) {
      onScheduled?.(patientId, toDayKey(visitAt));
      onClose();
    }
  }

  const selectedPatient = patients.find((p) => p.id === patientId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="schedule-dialog-title"
    >
      <Card className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-b-none sm:rounded-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2 text-pulse-700">
            <CalendarPlus className="h-5 w-5" />
            <h2
              id="schedule-dialog-title"
              className="font-display text-lg font-semibold text-slate-800"
            >
              {fixedPatientId ? "Schedule visit" : "New appointment"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-mist-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {!fixedPatientId && (
            <div>
              <Label>Patient</Label>
              <select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800"
                required
              >
                <option value="" disabled>
                  Select a patient
                </option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.displayName} — {p.diagnosis}
                  </option>
                ))}
              </select>
            </div>
          )}

          {fixedPatientId && selectedPatient && (
            <p className="text-sm text-slate-600">
              Scheduling for{" "}
              <span className="font-medium text-slate-800">
                {selectedPatient.displayName}
              </span>
            </p>
          )}

          <div>
            <Label>Visit date &amp; time</Label>
            <Input
              type="datetime-local"
              value={visitAt}
              onChange={(e) => setVisitAt(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="submit" className="flex-1">
              Save appointment
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
