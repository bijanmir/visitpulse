"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { usePatients } from "@/hooks/use-practice-store";
import { defaultVisitTimeForDay, toDayKey } from "@/lib/date-utils";
import { updatePatient } from "@/lib/practice-store";
import { CalendarPlus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

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
  // Unmount the body when closed so the inner form's lazy state init picks
  // up fresh defaults each time the dialog opens. This avoids the
  // setState-in-effect pattern.
  if (!props.open) return null;
  return <DialogBody {...props} />;
}

function DialogBody({
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
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<Element | null>(null);

  useEffect(() => {
    triggerRef.current = document.activeElement;
    const node = dialogRef.current;
    const first = node?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !node) return;
      const f = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (f.length === 0) return;
      const top = f[0];
      const bottom = f[f.length - 1];
      if (e.shiftKey && document.activeElement === top) {
        e.preventDefault();
        bottom.focus();
      } else if (!e.shiftKey && document.activeElement === bottom) {
        e.preventDefault();
        top.focus();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      if (triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus();
      }
    };
  }, [onClose]);

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
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-dialog-title"
        className="w-full max-w-md"
      >
        <Card className="max-h-[90vh] w-full overflow-y-auto rounded-b-none sm:rounded-2xl">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2 text-pulse-700">
              <CalendarPlus className="h-5 w-5" aria-hidden />
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
              className="rounded-lg p-1 text-slate-400 hover:bg-mist-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pulse-300"
              aria-label="Close"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
    </div>
  );
}
