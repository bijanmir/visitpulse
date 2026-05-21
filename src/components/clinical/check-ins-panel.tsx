"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DayNavigator } from "@/components/ui/day-navigator";
import { mergeCheckIns } from "@/lib/check-in-store";
import { toDayKey } from "@/lib/date-utils";
import { formatDate, formatTime } from "@/lib/utils";
import type { CheckIn } from "@/modules/clinical/types";
import { ClipboardList, MessageSquareQuote } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const adherenceLabel = {
  full: "Full adherence",
  partial: "Partial adherence",
  missed: "Missed doses",
};

export function CheckInsPanel({
  patientId,
  initialCheckIns,
}: {
  patientId: string;
  initialCheckIns: CheckIn[];
}) {
  const [checkIns, setCheckIns] = useState<CheckIn[]>(initialCheckIns);
  const [dayKey, setDayKey] = useState(() => toDayKey(new Date()));

  useEffect(() => {
    setCheckIns(mergeCheckIns(initialCheckIns, patientId));
  }, [initialCheckIns, patientId]);

  const dayKeysWithData = useMemo(
    () =>
      [...new Set(checkIns.map((c) => toDayKey(c.recordedAt)))].sort().reverse(),
    [checkIns],
  );

  const filtered = useMemo(
    () => checkIns.filter((c) => toDayKey(c.recordedAt) === dayKey),
    [checkIns, dayKey],
  );

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-2 text-pulse-700">
          <ClipboardList className="h-5 w-5" />
          <h3 className="font-display text-lg font-semibold text-slate-800">
            Patient check-ins
          </h3>
        </div>
        <Badge tone="pulse">{checkIns.length} total</Badge>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Browse by day — sleep, adherence, side effects, and messages in their
        own words.
      </p>

      <div className="mt-6">
        <DayNavigator
          dayKey={dayKey}
          onDayChange={setDayKey}
          dayKeysWithData={dayKeysWithData}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="mt-6 rounded-xl bg-mist-50 px-4 py-8 text-center text-sm text-slate-500">
          No check-in on this day.
          {dayKeysWithData.length > 0
            ? " Pick another date above, or share the patient link."
            : " Share the patient link so they can complete one before the visit."}
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {filtered.map((checkIn) => (
            <li
              key={checkIn.id}
              className="rounded-xl border border-pulse-100/80 bg-gradient-to-br from-white to-pulse-50/30 p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium text-slate-800">
                  {formatDate(checkIn.recordedAt)} at{" "}
                  {formatTime(checkIn.recordedAt)}
                </span>
                {checkIn.safetyFlag && (
                  <Badge tone="rose">Safety flag</Badge>
                )}
              </div>

              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Sleep
                  </dt>
                  <dd className="mt-0.5 text-slate-700">
                    {checkIn.sleepHours} hours
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Medications
                  </dt>
                  <dd className="mt-0.5 text-slate-700">
                    {adherenceLabel[checkIn.medicationAdherence]}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Side effects
                  </dt>
                  <dd className="mt-0.5 text-slate-700">
                    {checkIn.sideEffects.length
                      ? checkIn.sideEffects.join(", ")
                      : "None reported"}
                  </dd>
                </div>
              </dl>

              {checkIn.patientMessage ? (
                <div className="mt-4 rounded-xl bg-lavender-100/50 px-4 py-3 ring-1 ring-lavender-200/60">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-lavender-800">
                    <MessageSquareQuote className="h-3.5 w-3.5" />
                    In their own words
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">
                    &ldquo;{checkIn.patientMessage}&rdquo;
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-xs text-slate-400">
                  No written message with this check-in.
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
