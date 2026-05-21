"use client";

import { Button } from "@/components/ui/button";
import { mergeCheckIns } from "@/lib/check-in-store";
import { usePracticeStore } from "@/hooks/use-practice-store";
import { getMedEvents } from "@/lib/practice-store";
import type { Patient } from "@/modules/clinical/types";
import { buildPrepCard } from "@/modules/visit-prep/prep-card";
import { formatPrepForNote } from "@/modules/visit-prep/note-export";
import { ClipboardCheck, Copy } from "lucide-react";
import { useMemo, useState } from "react";

export function CopyToNoteButton({
  patient,
  size = "sm",
}: {
  patient: Patient;
  size?: "sm" | "md";
}) {
  const [copied, setCopied] = useState(false);
  const { noteExport } = usePracticeStore();

  const text = useMemo(() => {
    const checkIns = mergeCheckIns(patient.checkIns, patient.id);
    const withCheckIns = { ...patient, checkIns };
    const prep = buildPrepCard(withCheckIns, getMedEvents(patient.id));
    return formatPrepForNote(withCheckIns, prep, {
      includeBrandPrefix: noteExport.includeBrandPrefix,
      includeIdentifiers: noteExport.includeIdentifiers,
    });
  }, [patient, noteExport]);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button variant="soft" size={size} onClick={handleCopy}>
      {copied ? (
        <>
          <ClipboardCheck className="h-4 w-4" />
          Copied
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          Copy to note
        </>
      )}
    </Button>
  );
}
