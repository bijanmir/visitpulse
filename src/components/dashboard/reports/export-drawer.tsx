"use client";

import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { collectAggregationInputs } from "@/lib/reports/aggregate";
import {
  checkInsDataset,
  downloadCsv,
  isoDateForFilename,
  medicationsDataset,
  patientsDataset,
  scalesDataset,
  serializeCsv,
  type DatasetDef,
} from "@/lib/reports/csv";
import type { MedEvent, Patient } from "@/modules/clinical/types";
import { AlertTriangle, Download, FileSpreadsheet } from "lucide-react";
import { useMemo, useState } from "react";

type DatasetKey = "patients" | "checkins" | "scales" | "medications";

type DatasetEntry =
  | { key: "patients"; dataset: DatasetDef<Patient> }
  | { key: "checkins"; dataset: DatasetDef<ReturnType<typeof checkInsDataset>["rows"][number]> }
  | { key: "scales"; dataset: DatasetDef<ReturnType<typeof scalesDataset>["rows"][number]> }
  | { key: "medications"; dataset: DatasetDef<ReturnType<typeof medicationsDataset>["rows"][number]> };

export function ExportDrawer({
  open,
  onClose,
  patients,
  medEventsByPatient,
}: {
  open: boolean;
  onClose: () => void;
  patients: Patient[];
  medEventsByPatient: Record<string, MedEvent[]>;
}) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Export practice data"
      description="Pick a dataset and the fields you want. CSVs download to your machine."
      icon={<FileSpreadsheet className="h-5 w-5" aria-hidden />}
      size="lg"
    >
      <Body
        patients={patients}
        medEventsByPatient={medEventsByPatient}
        onClose={onClose}
      />
    </Drawer>
  );
}

function Body({
  patients,
  medEventsByPatient,
  onClose,
}: {
  patients: Patient[];
  medEventsByPatient: Record<string, MedEvent[]>;
  onClose: () => void;
}) {
  const datasets = useMemo(() => {
    const inputs = collectAggregationInputs(patients);
    return {
      patients: patientsDataset(patients),
      checkins: checkInsDataset(patients, inputs.checkInsByPatient),
      scales: scalesDataset(patients, inputs.scalesByPatient),
      medications: medicationsDataset(patients, medEventsByPatient),
    };
  }, [patients, medEventsByPatient]);

  const [activeKey, setActiveKey] = useState<DatasetKey>("checkins");
  const [enabledByDataset, setEnabledByDataset] = useState<
    Record<DatasetKey, Record<string, boolean>>
  >(() => {
    const out: Record<DatasetKey, Record<string, boolean>> = {
      patients: {},
      checkins: {},
      scales: {},
      medications: {},
    };
    (["patients", "checkins", "scales", "medications"] as const).forEach((k) => {
      for (const f of datasets[k].fields) out[k][f.key] = f.defaultOn;
    });
    return out;
  });

  const entry: DatasetEntry = useMemo(() => {
    switch (activeKey) {
      case "patients":
        return { key: "patients", dataset: datasets.patients };
      case "checkins":
        return { key: "checkins", dataset: datasets.checkins };
      case "scales":
        return { key: "scales", dataset: datasets.scales };
      case "medications":
        return { key: "medications", dataset: datasets.medications };
    }
  }, [activeKey, datasets]);

  const enabled = enabledByDataset[activeKey];
  const selectedFields = entry.dataset.fields.filter((f) => enabled[f.key]);
  const includesPhi = selectedFields.some((f) => f.identifierLevel === "high");
  const selectedCount = selectedFields.length;
  const rowCount = entry.dataset.rows.length;

  function toggle(fieldKey: string) {
    setEnabledByDataset((prev) => ({
      ...prev,
      [activeKey]: { ...prev[activeKey], [fieldKey]: !prev[activeKey][fieldKey] },
    }));
  }

  function setAll(value: boolean) {
    setEnabledByDataset((prev) => {
      const next = { ...prev[activeKey] };
      for (const f of entry.dataset.fields) next[f.key] = value;
      return { ...prev, [activeKey]: next };
    });
  }

  function resetDefaults() {
    setEnabledByDataset((prev) => {
      const next = { ...prev[activeKey] };
      for (const f of entry.dataset.fields) next[f.key] = f.defaultOn;
      return { ...prev, [activeKey]: next };
    });
  }

  function handleDownload() {
    if (selectedFields.length === 0) return;
    // Cast required because the discriminated union narrows differently for each branch;
    // serializeCsv is generic and the fields/rows always match by construction.
    const csv = serializeCsv(
      selectedFields as never,
      entry.dataset.rows as never,
    );
    const filename = `visitpulse-${entry.dataset.id}-${isoDateForFilename()}.csv`;
    downloadCsv(filename, csv);
  }

  return (
    <div className="space-y-5">
      {/* Dataset switcher */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Dataset
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(["patients", "checkins", "scales", "medications"] as const).map(
            (k) => (
              <button
                key={k}
                type="button"
                onClick={() => setActiveKey(k)}
                className={`rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                  activeKey === k
                    ? "border-pulse-300 bg-pulse-50 text-pulse-800 ring-2 ring-pulse-200"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-mist-50"
                }`}
              >
                <span className="block font-medium">{datasets[k].label}</span>
                <span className="block text-xs text-slate-500">
                  {datasets[k].rows.length} rows
                </span>
              </button>
            ),
          )}
        </div>
        <p className="mt-2 text-xs text-slate-500">{entry.dataset.description}</p>
      </div>

      {/* Field picker */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Fields ({selectedCount} of {entry.dataset.fields.length})
          </p>
          <div className="flex gap-3 text-xs">
            <button
              type="button"
              onClick={() => setAll(true)}
              className="text-pulse-700 hover:text-pulse-800"
            >
              Select all
            </button>
            <button
              type="button"
              onClick={() => setAll(false)}
              className="text-slate-500 hover:text-slate-700"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={resetDefaults}
              className="text-slate-500 hover:text-slate-700"
            >
              Reset to default
            </button>
          </div>
        </div>
        <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
          {entry.dataset.fields.map((f) => {
            const isOn = enabled[f.key];
            return (
              <li key={f.key}>
                <label
                  className={`flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors ${
                    isOn
                      ? "bg-pulse-50 text-slate-800"
                      : "text-slate-700 hover:bg-mist-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isOn}
                    onChange={() => toggle(f.key)}
                    className="h-4 w-4 rounded border-slate-300 text-pulse-600 focus:ring-pulse-300"
                  />
                  <span className="flex-1 font-mono text-xs">{f.header}</span>
                  {f.identifierLevel === "high" && (
                    <span
                      className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-rose-700"
                      title="Reveals patient identifiers or free-text PHI"
                    >
                      PHI
                    </span>
                  )}
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      {includesPhi && (
        <div
          role="note"
          className="flex items-start gap-2 rounded-xl border border-rose-200/80 bg-rose-50/60 px-3 py-2.5 text-xs text-slate-700"
        >
          <AlertTriangle
            className="mt-0.5 h-4 w-4 shrink-0 text-rose-600"
            aria-hidden
          />
          <p>
            One or more selected fields expose patient identifiers (PHI). The
            CSV will write that data unencrypted to disk. Per SAFETY.md, this
            tool is not HIPAA-ready — handle the file accordingly.
          </p>
        </div>
      )}

      <div className="rounded-xl bg-mist-50 px-3 py-2 text-xs text-slate-600">
        Preview: <strong>{rowCount}</strong> rows ×{" "}
        <strong>{selectedCount}</strong> columns will be written to{" "}
        <span className="font-mono">
          visitpulse-{entry.dataset.id}-{isoDateForFilename()}.csv
        </span>
        .
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
        <Button
          type="button"
          size="lg"
          className="flex-[2] font-semibold"
          onClick={handleDownload}
          disabled={selectedCount === 0 || rowCount === 0}
        >
          <Download className="h-4 w-4" aria-hidden />
          Download CSV
        </Button>
      </div>
    </div>
  );
}
