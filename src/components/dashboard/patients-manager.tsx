"use client";

import { PatientRow } from "@/components/dashboard/patient-row";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { usePatients } from "@/hooks/use-practice-store";
import {
  addPatient,
  removePatient,
  updatePatient,
  type NewPatientInput,
} from "@/lib/practice-store";
import type { Patient, RiskLevel } from "@/modules/clinical/types";
import { Pencil, Plus, Trash2, Users, X } from "lucide-react";
import { useState } from "react";

const emptyForm: NewPatientInput = {
  displayName: "",
  age: 30,
  diagnosis: "",
  riskLevel: "low",
  nextVisitAt: localDatetimeValue(
    new Date(Date.now() + 24 * 60 * 60 * 1000),
  ),
};

function localDatetimeValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function PatientsManager() {
  const patients = usePatients();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(patient: Patient) {
    setEditing(patient);
    setForm({
      displayName: patient.displayName,
      age: patient.age,
      diagnosis: patient.diagnosis,
      riskLevel: patient.riskLevel,
      nextVisitAt: localDatetimeValue(new Date(patient.nextVisitAt)),
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const visitIso = new Date(form.nextVisitAt).toISOString();
    const payload = { ...form, nextVisitAt: visitIso };
    if (editing) {
      updatePatient(editing.id, payload);
    } else {
      addPatient(payload);
    }
    closeForm();
  }

  function handleRemove(id: string) {
    removePatient(id);
    setConfirmRemove(null);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-pulse-600" />
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
          <Plus className="h-4 w-4" />
          Add patient
        </Button>
      </div>

      {showForm && (
        <Card className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-slate-800">
              {editing ? "Edit patient" : "New patient"}
            </h2>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-lg p-1 text-slate-400 hover:bg-mist-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Display name</Label>
              <Input
                value={form.displayName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, displayName: e.target.value }))
                }
                placeholder="Jordan M."
                required
              />
            </div>
            <div>
              <Label>Age</Label>
              <Input
                type="number"
                min={1}
                max={120}
                value={form.age}
                onChange={(e) =>
                  setForm((f) => ({ ...f, age: Number(e.target.value) }))
                }
                required
              />
            </div>
            <div>
              <Label>Risk level</Label>
              <select
                value={form.riskLevel}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    riskLevel: e.target.value as RiskLevel,
                  }))
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm"
              >
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="elevated">Elevated</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <Label>Diagnosis</Label>
              <Input
                value={form.diagnosis}
                onChange={(e) =>
                  setForm((f) => ({ ...f, diagnosis: e.target.value }))
                }
                placeholder="Major Depressive Disorder"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Next visit</Label>
              <Input
                type="datetime-local"
                value={form.nextVisitAt}
                onChange={(e) =>
                  setForm((f) => ({ ...f, nextVisitAt: e.target.value }))
                }
                required
              />
            </div>
            <div className="flex gap-2 sm:col-span-2">
              <Button type="submit">
                {editing ? "Save changes" : "Add patient"}
              </Button>
              <Button type="button" variant="secondary" onClick={closeForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="mt-8 space-y-2">
        {patients.map((patient) => (
          <div key={patient.id} className="group relative">
            <PatientRow
              patient={patient}
              hasCheckIn={patient.checkIns.length > 0}
            />
            <div className="absolute right-14 top-1/2 flex -translate-y-1/2 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={() => openEdit(patient)}
                className="rounded-lg bg-white p-2 shadow-sm ring-1 ring-slate-200 hover:text-pulse-700"
                title="Edit"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setConfirmRemove(patient.id)}
                className="rounded-lg bg-white p-2 shadow-sm ring-1 ring-slate-200 hover:text-rose-700"
                title="Remove"
              >
                <Trash2 className="h-4 w-4" />
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
    </div>
  );
}
