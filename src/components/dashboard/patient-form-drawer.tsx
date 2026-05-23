"use client";

import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { Input, Label } from "@/components/ui/input";
import { localDatetimeValue } from "@/lib/date-utils";
import {
  addPatient,
  updatePatient,
  type NewPatientInput,
} from "@/lib/practice-store";
import type { Patient, RiskLevel } from "@/modules/clinical/types";
import { UserPlus } from "lucide-react";
import { useState } from "react";

const emptyForm = (): NewPatientInput => ({
  displayName: "",
  age: 30,
  diagnosis: "",
  riskLevel: "low",
  nextVisitAt: localDatetimeValue(new Date(Date.now() + 24 * 60 * 60 * 1000)),
});

function formFromPatient(patient: Patient): NewPatientInput {
  return {
    displayName: patient.displayName,
    age: patient.age,
    diagnosis: patient.diagnosis,
    riskLevel: patient.riskLevel,
    nextVisitAt: localDatetimeValue(new Date(patient.nextVisitAt)),
  };
}

export function PatientFormDrawer({
  open,
  onClose,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  /** When set, the drawer edits this patient; otherwise it adds a new one. */
  editing: Patient | null;
}) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={editing ? "Edit patient" : "Add patient"}
      description={
        editing
          ? "Update name, diagnosis, next visit, or risk level."
          : "Patient data stays in this browser until a backend is wired up."
      }
      icon={<UserPlus className="h-5 w-5" aria-hidden />}
    >
      <Body
        key={editing?.id ?? "new"}
        onClose={onClose}
        editing={editing}
      />
    </Drawer>
  );
}

function Body({
  onClose,
  editing,
}: {
  onClose: () => void;
  editing: Patient | null;
}) {
  const [form, setForm] = useState<NewPatientInput>(() =>
    editing ? formFromPatient(editing) : emptyForm(),
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: NewPatientInput = {
      ...form,
      nextVisitAt: new Date(form.nextVisitAt).toISOString(),
    };
    if (editing) {
      updatePatient(editing.id, payload);
    } else {
      addPatient(payload);
    }
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Display name</Label>
        <Input
          value={form.displayName}
          onChange={(e) =>
            setForm((f) => ({ ...f, displayName: e.target.value }))
          }
          placeholder="Jordan M."
          required
          autoFocus
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
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
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 focus:border-pulse-300 focus:outline-none focus:ring-2 focus:ring-pulse-200"
          >
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="elevated">Elevated</option>
          </select>
        </div>
      </div>
      <div>
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
      <div>
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

      <div className="flex flex-col gap-2 pt-2 sm:flex-row">
        <Button type="submit" className="flex-1">
          {editing ? "Save changes" : "Add patient"}
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
