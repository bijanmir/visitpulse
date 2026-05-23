"use client";

import { PatientChart } from "@/components/clinical/patient-chart";
import { MedTimelineView } from "@/components/clinical/med-timeline-view";
import { ScaleSparkline } from "@/components/clinical/scale-sparkline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { usePatients } from "@/hooks/use-practice-store";
import { getMedEvents } from "@/lib/practice-store";
import { sortByRecordedAtDesc } from "@/lib/sort";
import { CopyToNoteButton } from "@/components/clinical/copy-to-note-button";
import { ScheduleAppointmentDialog } from "@/components/dashboard/schedule-appointment-dialog";
import { auditLogger } from "@/modules/compliance/audit";
import { formatTime, initials } from "@/lib/utils";
import type { ScaleResponse } from "@/modules/clinical/types";
import { ArrowLeft, CalendarPlus, ClipboardCheck, Copy, ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";

export function PatientDetailClient({ id }: { id: string }) {
  const patients = usePatients();
  const patient = patients.find((p) => p.id === id);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const { copied, copy, error } = useCopyToClipboard();

  useEffect(() => {
    if (!patient) return;
    void auditLogger.log({
      action: "patient.view",
      actorId: "current-user",
      resourceType: "patient",
      resourceId: patient.id,
    });
  }, [patient]);

  if (!patient) notFound();

  const medEvents = getMedEvents(id);

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
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pulse-200 to-lavender-200 text-lg font-semibold text-pulse-800">
            {initials(patient.displayName)}
          </span>
          <div>
            <h1 className="font-display text-3xl font-semibold text-slate-800">
              {patient.displayName}
            </h1>
            <p className="text-slate-600">
              {patient.diagnosis} · {patient.age}y
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Next visit {formatTime(patient.nextVisitAt)}
            </p>
          </div>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap print:hidden">
          <Button
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => setScheduleOpen(true)}
          >
            <CalendarPlus className="h-4 w-4" aria-hidden />
            Schedule / reschedule
          </Button>
          <Link
            href={`/check-in/${patient.checkInToken}`}
            target="_blank"
            className="w-full sm:w-auto"
          >
            <Button variant="secondary" size="sm" className="w-full">
              <ExternalLink className="h-4 w-4" aria-hidden />
              Check-in link
            </Button>
          </Link>
          <CopyToNoteButton patient={patient} />
          <div className="flex flex-col items-stretch sm:items-start">
            <Button
              variant="secondary"
              size="sm"
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

      <div className="mt-10">
        <PatientChart patient={patient} medEvents={medEvents} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="font-display text-lg font-semibold text-slate-800">
            PHQ-9 trend
          </h3>
          <div className="mt-4">
            <ScaleSparkline
              scales={patient.scales}
              type="phq9"
              color="#4f79b8"
            />
          </div>
          <LatestScore scales={patient.scales} type="phq9" />
        </Card>
        <Card>
          <h3 className="font-display text-lg font-semibold text-slate-800">
            GAD-7 trend
          </h3>
          <div className="mt-4">
            <ScaleSparkline
              scales={patient.scales}
              type="gad7"
              color="#7b74a8"
            />
          </div>
          <LatestScore scales={patient.scales} type="gad7" />
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
  const latest = sortByRecordedAtDesc(scales.filter((s) => s.type === type))[0];
  if (!latest) return null;

  return (
    <p className="mt-2 text-sm text-slate-500">
      Latest score:{" "}
      <Badge tone="pulse">
        {latest.score}/{latest.maxScore}
      </Badge>
    </p>
  );
}
