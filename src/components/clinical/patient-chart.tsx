"use client";

import { PrepCardView } from "@/components/clinical/prep-card-view";
import { CheckInsPanel } from "@/components/clinical/check-ins-panel";
import { useClientMounted } from "@/hooks/use-client-mounted";
import { mergeCheckIns } from "@/lib/check-in-store";
import { mergePatientScales } from "@/lib/scales";
import type { MedEvent, Patient } from "@/modules/clinical/types";
import { buildPrepCard } from "@/modules/visit-prep/prep-card";
import { useMemo } from "react";

export function PatientChart({
  patient,
  medEvents,
}: {
  patient: Patient;
  medEvents: MedEvent[];
}) {
  const mounted = useClientMounted();

  const checkIns = useMemo(
    () => (mounted ? mergeCheckIns(patient.checkIns, patient.id) : patient.checkIns),
    [mounted, patient.checkIns, patient.id],
  );

  const scales = useMemo(
    () => (mounted ? mergePatientScales(patient) : patient.scales),
    [mounted, patient],
  );

  const prep = useMemo(
    () => buildPrepCard({ ...patient, checkIns }, medEvents, scales),
    [patient, checkIns, medEvents, scales],
  );

  return (
    <>
      <PrepCardView prep={prep} />
      <div className="mt-8">
        <CheckInsPanel
          patientId={patient.id}
          initialCheckIns={patient.checkIns}
        />
      </div>
    </>
  );
}
