"use client";

import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { Input, Label } from "@/components/ui/input";
import { usePatients } from "@/hooks/use-practice-store";
import { defaultVisitTimeForDay, toDayKey } from "@/lib/date-utils";
import { summarizeDiagnoses } from "@/lib/diagnosis";
import { updatePatient } from "@/lib/practice-store";
import { CalendarPlus } from "lucide-react";
import { useState } from "react";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  /** Pre-fill date (schedule page) */
  defaultDayKey?: string;
  /** When set, schedule for this patient only */
  patientId?: string;
  onScheduled?: (patientId: string, dayKey: string) => void;
};

export function ScheduleAppointmentDialog(props: DialogProps) {
  return (
    <Drawer
      open={props.open}
      onClose={props.onClose}
      title={props.patientId ? "Schedule visit" : "New appointment"}
      description="Set a date and time. The patient row moves to that day on save."
      icon={<CalendarPlus className="h-5 w-5" aria-hidden />}
    >
      <Body {...props} />
    </Drawer>
  );
}

function Body({
  onClose,
  defaultDayKey,
  patientId: fixedPatientId,
  onScheduled,
}: DialogProps) {
  const patients = usePatients();
  const [patientId, setPatientId] = useState(
    () => fixedPatientId ?? patients[0]?.id ?? "",
  );
  const [visitAt, setVisitAt] = useState(() =>
    defaultVisitTimeForDay(defaultDayKey ?? toDayKey(new Date())),
  );

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
    <form onSubmit={handleSubmit} className="space-y-4">
      {!fixedPatientId && (
        <div>
          <Label>Patient</Label>
          <select
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 focus:border-pulse-300 focus:outline-none focus:ring-2 focus:ring-pulse-200"
            required
          >
            <option value="" disabled>
              Select a patient
            </option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.displayName} — {summarizeDiagnoses(p)}
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
  );
}
