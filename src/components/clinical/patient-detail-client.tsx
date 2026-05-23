"use client";

import { PatientChart } from "@/components/clinical/patient-chart";
import { MedTimelineView } from "@/components/clinical/med-timeline-view";
import { ScaleSparkline } from "@/components/clinical/scale-sparkline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useClientMounted } from "@/hooks/use-client-mounted";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { usePatients } from "@/hooks/use-practice-store";
import { getMedEvents, removePatient } from "@/lib/practice-store";
import { mergePatientScales } from "@/lib/scales";
import { sortByRecordedAtDesc } from "@/lib/sort";
import { severity } from "@/lib/symptom-scales";
import { CopyToNoteButton } from "@/components/clinical/copy-to-note-button";
import { PatientFormDrawer } from "@/components/dashboard/patient-form-drawer";
import { ScheduleAppointmentDialog } from "@/components/dashboard/schedule-appointment-dialog";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { auditLogger } from "@/modules/compliance/audit";
import { formatTime, initials } from "@/lib/utils";
import type { ScaleResponse } from "@/modules/clinical/types";
import {
  ArrowLeft,
  CalendarPlus,
  ClipboardCheck,
  Copy,
  ExternalLink,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function PatientDetailClient({ id }: { id: string }) {
  const patients = usePatients();
  const patient = patients.find((p) => p.id === id);
  const router = useRouter();
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const { copied, copy, error } = useCopyToClipboard();

  function handleRemove() {
    if (!patient) return;
    removePatient(patient.id);
    router.push("/dashboard/patients");
  }

  useEffect(() => {
    if (!patient) return;
    void auditLogger.log({
      action: "patient.view",
      actorId: "current-user",
      resourceType: "patient",
      resourceId: patient.id,
    });
  }, [patient]);

  const mounted = useClientMounted();

  if (!patient) notFound();

  const medEvents = getMedEvents(id);
  const scales = mounted ? mergePatientScales(patient) : patient.scales;

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-pulse-700 print:hidden"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to schedule
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pulse-200 to-lavender-200 text-lg font-semibold text-pulse-800">
            {initials(patient.displayName)}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-3xl font-semibold leading-tight text-slate-800">
              {patient.displayName}
            </h1>
            <p className="mt-0.5 text-sm text-slate-600">
              {patient.age}y · Next visit {formatTime(patient.nextVisitAt)}
            </p>
          </div>
        </div>
        <div className="grid w-full grid-cols-[1fr_1fr_auto] gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center print:hidden">
          <Button
            size="sm"
            className="col-span-2 w-full sm:col-auto sm:w-auto"
            onClick={() => setScheduleOpen(true)}
          >
            <CalendarPlus className="h-4 w-4" aria-hidden />
            Schedule / reschedule
          </Button>
          <DropdownMenu
            label="More patient actions"
            trigger={
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-600 ring-1 ring-slate-200/80 transition-colors hover:bg-mist-50 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pulse-300 sm:order-last"
                aria-label="More actions"
              >
                <MoreVertical className="h-4 w-4" aria-hidden />
              </button>
            }
          >
            <DropdownMenuItem
              icon={ExternalLink}
              onSelect={() => {
                window.open(`/check-in/${patient.checkInToken}`, "_blank");
              }}
            >
              Preview as patient
            </DropdownMenuItem>
            <DropdownMenuItem icon={Pencil} onSelect={() => setEditOpen(true)}>
              Edit patient
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              icon={Trash2}
              destructive
              onSelect={() => setConfirmRemove(true)}
            >
              Remove patient
            </DropdownMenuItem>
          </DropdownMenu>
          <CopyToNoteButton patient={patient} />
          <div className="flex flex-col items-stretch sm:items-start">
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={() => {
                const url = `${window.location.origin}/check-in/${patient.checkInToken}`;
                void copy(url);
              }}
            >
              {copied ? (
                <>
                  <ClipboardCheck className="h-4 w-4" aria-hidden />
                  Link copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" aria-hidden />
                  Copy link
                </>
              )}
              <span className="sr-only" role="status" aria-live="polite">
                {copied ? "Check-in link copied to clipboard" : ""}
              </span>
            </Button>
            {error && (
              <p className="mt-1 text-xs text-rose-700" role="alert">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>

      {patient.diagnoses.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {patient.diagnoses.map((d, i) => (
            <li
              key={`${d.code}-${i}`}
              className={`inline-flex max-w-full items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs ${
                i === 0
                  ? "bg-pulse-100 text-pulse-800 ring-1 ring-pulse-200"
                  : "bg-mist-100 text-slate-700 ring-1 ring-slate-200"
              }`}
            >
              <span className="min-w-0 truncate font-medium">
                {d.description}
              </span>
              {d.code && (
                <span className="shrink-0 rounded bg-white/70 px-1 py-px font-mono text-[10px] text-slate-600">
                  {d.code}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      {confirmRemove && (
        <div
          className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50/60 px-4 py-3 print:hidden"
          role="alertdialog"
          aria-labelledby="remove-confirm-label"
        >
          <p id="remove-confirm-label" className="text-sm text-slate-700">
            Remove <span className="font-medium">{patient.displayName}</span>?
            This clears their data from this browser.
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setConfirmRemove(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-rose-600 hover:bg-rose-700"
              onClick={handleRemove}
            >
              Remove
            </Button>
          </div>
        </div>
      )}

      <div className="mt-10">
        <PatientChart patient={patient} medEvents={medEvents} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="font-display text-lg font-semibold text-slate-800">
            PHQ-9 trend
          </h3>
          <div className="mt-4">
            <ScaleSparkline scales={scales} type="phq9" color="#4f79b8" />
          </div>
          <LatestScore scales={scales} type="phq9" />
        </Card>
        <Card>
          <h3 className="font-display text-lg font-semibold text-slate-800">
            GAD-7 trend
          </h3>
          <div className="mt-4">
            <ScaleSparkline scales={scales} type="gad7" color="#7b74a8" />
          </div>
          <LatestScore scales={scales} type="gad7" />
        </Card>
      </div>

      <div className="mt-8">
        <MedTimelineView events={medEvents} patientId={patient.id} />
      </div>

      <ScheduleAppointmentDialog
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        patientId={patient.id}
      />

      <PatientFormDrawer
        open={editOpen}
        onClose={() => setEditOpen(false)}
        editing={patient}
      />
    </div>
  );
}

function LatestScore({
  scales,
  type,
}: {
  scales: ScaleResponse[];
  type: ScaleResponse["type"];
}) {
  const filtered = sortByRecordedAtDesc(scales.filter((s) => s.type === type));
  const latest = filtered[0];
  if (!latest) return null;
  const prev = filtered[1];
  const delta = prev ? latest.score - prev.score : null;
  const deltaTone =
    delta === null ? "slate" : delta < -2 ? "pulse" : delta > 2 ? "rose" : "lavender";

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-500">
      <Badge tone="pulse">
        {latest.score}/{latest.maxScore}
      </Badge>
      <span className="text-slate-700">{severity(type, latest.score)}</span>
      {delta !== null && (
        <Badge tone={deltaTone}>
          {delta > 0 ? "+" : ""}
          {delta} since last
        </Badge>
      )}
    </div>
  );
}
