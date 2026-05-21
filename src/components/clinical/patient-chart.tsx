"use client";

import { PrepCardView } from "@/components/clinical/prep-card-view";
import { CheckInsPanel } from "@/components/clinical/check-ins-panel";
import { mergeCheckIns } from "@/lib/check-in-store";
import type { MedEvent, Patient } from "@/modules/clinical/types";
import { buildPrepCard } from "@/modules/visit-prep/prep-card";
import { useEffect, useMemo, useState } from "react";

export function PatientChart({
  patient,
  medEvents,
}: {
  patient: Patient;
  medEvents: MedEvent[];
}) {
  const [checkIns, setCheckIns] = useState(patient.checkIns);

  useEffect(() => {
    setCheckIns(mergeCheckIns(patient.checkIns, patient.id));
  }, [patient.checkIns, patient.id]);

  const patientWithCheckIns = useMemo(
    () => ({ ...patient, checkIns }),
    [patient, checkIns],
  );

  const prep = useMemo(
    () => buildPrepCard(patientWithCheckIns, medEvents),
    [patientWithCheckIns, medEvents],
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
