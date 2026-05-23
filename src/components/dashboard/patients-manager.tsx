"use client";

import { PatientFormDrawer } from "@/components/dashboard/patient-form-drawer";
import { PatientRow } from "@/components/dashboard/patient-row";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePatients } from "@/hooks/use-practice-store";
import { buildSafetyFlagMap } from "@/lib/patient-safety-flags";
import { removePatient } from "@/lib/practice-store";
import type { Patient } from "@/modules/clinical/types";
import { Pencil, Plus, Trash2, Users } from "lucide-react";
import { useMemo, useState } from "react";

export function PatientsManager() {
  const patients = usePatients();
  const safetyFlags = useMemo(
    () => buildSafetyFlagMap(patients),
    [patients],
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  function openAdd() {
    setEditing(null);
    setDrawerOpen(true);
  }

  function openEdit(patient: Patient) {
    setEditing(patient);
    setDrawerOpen(true);
  }

  function handleRemove(id: string) {
    removePatient(id);
    setConfirmRemove(null);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-pulse-600" aria-hidden />
          <div>
            <h1 className="font-display text-3xl font-semibold text-slate-800">
              Patients
            </h1>
            <p className="mt-1 text-slate-600">
              {patients.length} active · add, edit, or remove
            </p>
          </div>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" aria-hidden />
          Add patient
        </Button>
      </div>

      {patients.length === 0 && (
        <Card className="mt-8 text-center">
          <Users className="mx-auto h-10 w-10 text-pulse-300" aria-hidden />
          <p className="mt-3 font-medium text-slate-800">No patients yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Add your first patient to start building their visit brief.
          </p>
          <Button className="mt-4" onClick={openAdd}>
            <Plus className="h-4 w-4" aria-hidden />
            Add patient
          </Button>
        </Card>
      )}

      <div className="mt-8 space-y-2">
        {patients.map((patient) => (
          <div key={patient.id} className="group relative">
            <PatientRow
              patient={patient}
              hasCheckIn={patient.checkIns.length > 0}
              safetyFlagLatest={safetyFlags[patient.id] ?? false}
            />
            <div className="absolute right-14 top-1/2 flex -translate-y-1/2 gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
              <button
                type="button"
                onClick={() => openEdit(patient)}
                className="rounded-lg bg-white p-2 shadow-sm ring-1 ring-slate-200 hover:text-pulse-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pulse-300"
                aria-label={`Edit ${patient.displayName}`}
              >
                <Pencil className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => setConfirmRemove(patient.id)}
                className="rounded-lg bg-white p-2 shadow-sm ring-1 ring-slate-200 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
                aria-label={`Remove ${patient.displayName}`}
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </div>
            {confirmRemove === patient.id && (
              <div className="absolute right-4 top-full z-10 mt-1 rounded-xl border border-rose-200 bg-white p-3 shadow-lg">
                <p className="text-sm text-slate-700">Remove this patient?</p>
                <div className="mt-2 flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setConfirmRemove(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="bg-rose-600 hover:bg-rose-700"
                    onClick={() => handleRemove(patient.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <PatientFormDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        editing={editing}
      />
    </div>
  );
}
