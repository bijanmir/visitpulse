"use client";

import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { usePracticeStore } from "@/hooks/use-practice-store";
import { mergeCheckIns } from "@/lib/check-in-store";
import { getMedEvents } from "@/lib/practice-store";
import { auditLogger } from "@/modules/compliance/audit";
import type { Patient } from "@/modules/clinical/types";
import { buildPrepCard } from "@/modules/visit-prep/prep-card";
import { formatPrepForNote } from "@/modules/visit-prep/note-export";
import { ClipboardCheck, Copy } from "lucide-react";
import { useMemo } from "react";

export function CopyToNoteButton({
  patient,
  size = "sm",
}: {
  patient: Patient;
  size?: "sm" | "md";
}) {
  const { noteExport } = usePracticeStore();
  const { copied, copy, error } = useCopyToClipboard();

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
    const ok = await copy(text);
    if (ok) {
      void auditLogger.log({
        action: "prep.view",
        actorId: "current-user",
        resourceType: "patient",
        resourceId: patient.id,
        metadata: { action: "copy-to-note" },
      });
    }
  }

  return (
    <>
      <Button variant="soft" size={size} onClick={handleCopy}>
        {copied ? (
          <>
            <ClipboardCheck className="h-4 w-4" aria-hidden />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" aria-hidden />
            Copy to note
          </>
        )}
        <span className="sr-only" role="status" aria-live="polite">
          {copied ? "Brief copied to clipboard" : ""}
        </span>
      </Button>
      {error && (
        <p className="text-xs text-rose-700" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
