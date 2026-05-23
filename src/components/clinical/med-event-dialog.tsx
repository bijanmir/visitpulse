"use client";

import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { Input, Label } from "@/components/ui/input";
import {
  addMedEvent,
  removeMedEvent,
  updateMedEvent,
  type MedEventInput,
} from "@/lib/practice-store";
import type {
  MedEvent,
  MedEventType,
  MedResponse,
} from "@/modules/clinical/types";
import { Pill, Trash2 } from "lucide-react";
import { useState } from "react";

const TYPE_OPTIONS: { value: MedEventType; label: string }[] = [
  { value: "start", label: "Start" },
  { value: "dose_change", label: "Dose change" },
  { value: "stop", label: "Stop" },
];

const RESPONSE_OPTIONS: { value: MedResponse | ""; label: string }[] = [
  { value: "", label: "—" },
  { value: "excellent", label: "Excellent" },
  { value: "partial", label: "Partial" },
  { value: "none", label: "None" },
  { value: "worsened", label: "Worsened" },
];

function toDateInput(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function fromDateInput(value: string): string | undefined {
  if (!value) return undefined;
  // Local-midnight is fine here; timelines work on days, not minutes.
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

export function MedEventDialog({
  open,
  onClose,
  patientId,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  patientId: string;
  /** When set, the dialog is in edit mode for this event. */
  editing: MedEvent | null;
}) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={editing ? "Edit medication" : "Add medication"}
      description={
        editing
          ? "Change any field, or remove this entry."
          : "Log a new trial, dose change, or stop. Updates the visit brief."
      }
      icon={<Pill className="h-5 w-5" aria-hidden />}
      size="lg"
    >
      <Body
        key={editing?.id ?? "new"}
        onClose={onClose}
        patientId={patientId}
        editing={editing}
      />
    </Drawer>
  );
}

function Body({
  onClose,
  patientId,
  editing,
}: {
  onClose: () => void;
  patientId: string;
  editing: MedEvent | null;
}) {
  const [medication, setMedication] = useState(() => editing?.medication ?? "");
  const [type, setType] = useState<MedEventType>(() => editing?.type ?? "start");
  const [dose, setDose] = useState(() => editing?.dose ?? "");
  const [startedAt, setStartedAt] = useState(() =>
    toDateInput(editing?.startedAt) || toDateInput(new Date().toISOString()),
  );
  const [endedAt, setEndedAt] = useState(() => toDateInput(editing?.endedAt));
  const [response, setResponse] = useState<MedResponse | "">(
    () => editing?.response ?? "",
  );
  const [sideEffects, setSideEffects] = useState(() =>
    (editing?.sideEffects ?? []).join(", "),
  );
  const [reasonStopped, setReasonStopped] = useState(
    () => editing?.reasonStopped ?? "",
  );
  const [confirmRemove, setConfirmRemove] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const startedIso = fromDateInput(startedAt);
    if (!medication.trim() || !dose.trim() || !startedIso) return;

    const sideEffectList = sideEffects
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const input: MedEventInput = {
      medication: medication.trim(),
      type,
      dose: dose.trim(),
      startedAt: startedIso,
      endedAt: fromDateInput(endedAt),
      response: response || undefined,
      sideEffects: sideEffectList.length ? sideEffectList : undefined,
      reasonStopped: reasonStopped.trim() || undefined,
    };

    if (editing) {
      updateMedEvent(patientId, editing.id, input);
    } else {
      addMedEvent(patientId, input);
    }
    onClose();
  }

  function handleRemove() {
    if (!editing) return;
    removeMedEvent(patientId, editing.id);
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Medication</Label>
        <Input
          value={medication}
          onChange={(e) => setMedication(e.target.value)}
          placeholder="e.g. Sertraline"
          required
          autoFocus
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Event type</Label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as MedEventType)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 focus:border-pulse-300 focus:outline-none focus:ring-2 focus:ring-pulse-200"
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Dose</Label>
          <Input
            value={dose}
            onChange={(e) => setDose(e.target.value)}
            placeholder="e.g. 50mg"
            required
          />
        </div>
        <div>
          <Label>Started</Label>
          <Input
            type="date"
            value={startedAt}
            onChange={(e) => setStartedAt(e.target.value)}
            required
          />
        </div>
        <div>
          <Label>Ended (optional)</Label>
          <Input
            type="date"
            value={endedAt}
            onChange={(e) => setEndedAt(e.target.value)}
          />
        </div>
      </div>
      <div>
        <Label>Response</Label>
        <select
          value={response}
          onChange={(e) => setResponse(e.target.value as MedResponse | "")}
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 focus:border-pulse-300 focus:outline-none focus:ring-2 focus:ring-pulse-200"
        >
          {RESPONSE_OPTIONS.map((o) => (
            <option key={o.value || "none"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label>Side effects (optional)</Label>
        <Input
          value={sideEffects}
          onChange={(e) => setSideEffects(e.target.value)}
          placeholder="e.g. nausea, headache"
        />
      </div>
      <div>
        <Label>Reason stopped (optional)</Label>
        <Input
          value={reasonStopped}
          onChange={(e) => setReasonStopped(e.target.value)}
          placeholder="e.g. sexual side effects, insurance"
        />
      </div>

      <div className="flex gap-2 border-t border-slate-100 pt-4">
        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="flex-1 font-semibold"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button type="submit" size="lg" className="flex-[2] font-semibold">
          {editing ? "Save changes" : "Add medication"}
        </Button>
      </div>

      {editing && (
        <div className="border-t border-slate-200 pt-4">
          {confirmRemove ? (
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm text-slate-700">Remove this medication entry?</p>
              <Button
                type="button"
                size="sm"
                className="bg-rose-600 hover:bg-rose-700"
                onClick={handleRemove}
              >
                Remove
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => setConfirmRemove(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmRemove(true)}
              className="inline-flex items-center gap-1.5 text-sm text-rose-700 hover:text-rose-800"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
              Remove this entry
            </button>
          )}
        </div>
      )}
    </form>
  );
}
