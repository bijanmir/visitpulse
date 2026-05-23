"use client";

import { ExportDrawer } from "@/components/dashboard/reports/export-drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useClientMounted } from "@/hooks/use-client-mounted";
import { usePatients } from "@/hooks/use-practice-store";
import { formatDate, formatTime } from "@/lib/utils";
import { getMedEvents } from "@/lib/practice-store";
import {
  buildPracticeSnapshot,
  collectAggregationInputs,
  type PracticeSnapshot,
  type SeverityBucket,
} from "@/lib/reports/aggregate";
import type { MedEvent } from "@/modules/clinical/types";
import {
  AlertTriangle,
  BarChart3,
  Download,
  Printer,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const SEVERITY_ORDER: SeverityBucket[] = [
  "Minimal",
  "Mild",
  "Moderate",
  "Moderately severe",
  "Severe",
];

const SEVERITY_COLOR: Record<SeverityBucket, string> = {
  Minimal: "#8faddf",
  Mild: "#6b92cf",
  Moderate: "#a59ad0",
  "Moderately severe": "#d9a685",
  Severe: "#c47a8b",
};

export function ReportsClient() {
  const mounted = useClientMounted();
  const patients = usePatients();
  const [exportOpen, setExportOpen] = useState(false);

  const medEventsByPatient = useMemo<Record<string, MedEvent[]>>(() => {
    const out: Record<string, MedEvent[]> = {};
    for (const p of patients) out[p.id] = getMedEvents(p.id);
    return out;
  }, [patients]);

  const snapshot = useMemo<PracticeSnapshot | null>(() => {
    if (!mounted) return null;
    const inputs = collectAggregationInputs(patients);
    return buildPracticeSnapshot({
      patients,
      checkInsByPatient: inputs.checkInsByPatient,
      scalesByPatient: inputs.scalesByPatient,
    });
  }, [mounted, patients]);

  if (!mounted || !snapshot) {
    return <ReportsSkeleton />;
  }

  function handlePrint() {
    if (typeof window !== "undefined") window.print();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 print:hidden">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-pulse-600" aria-hidden />
          <div>
            <h1 className="font-display text-3xl font-semibold text-slate-800">
              Reports
            </h1>
            <p className="mt-1 text-slate-600">
              Practice metrics and exportable data
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4" aria-hidden />
            Export PDF
          </Button>
          <Button size="sm" onClick={() => setExportOpen(true)}>
            <Download className="h-4 w-4" aria-hidden />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Print-only header */}
      <div className="hidden print:block">
        <h1 className="font-display text-3xl font-semibold text-slate-800">
          Practice report
        </h1>
        <p className="text-sm text-slate-500">
          Generated {formatDate(snapshot.generatedAt)} at{" "}
          {formatTime(snapshot.generatedAt)}
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={Users}
          label="Active patients"
          value={String(snapshot.metrics.totalPatients)}
          sublabel={`${snapshot.metrics.flaggedActivePatients} with latest check-in flagged`}
          tone="pulse"
        />
        <MetricCard
          icon={Sparkles}
          label="Check-ins · 7 days"
          value={String(snapshot.metrics.checkInsLast7Days)}
          sublabel={`${snapshot.metrics.checkInsLast30Days} over the last 30 days`}
          tone="lavender"
        />
        <MetricCard
          icon={AlertTriangle}
          label="Flagged · 7 days"
          value={String(snapshot.metrics.flaggedLast7Days)}
          sublabel="Safety-flagged submissions"
          tone={snapshot.metrics.flaggedLast7Days > 0 ? "rose" : "slate"}
        />
        <MetricCard
          icon={TrendingUp}
          label="Avg latest PHQ-9"
          value={
            snapshot.metrics.averageLatestPhq9 === null
              ? "—"
              : snapshot.metrics.averageLatestPhq9.toFixed(1)
          }
          sublabel={
            snapshot.metrics.averageLatestGad7 === null
              ? "No GAD-7 data"
              : `Avg latest GAD-7: ${snapshot.metrics.averageLatestGad7.toFixed(1)}`
          }
          tone="peach"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-display text-lg font-semibold text-slate-800">
            Check-in volume · last 90 days
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Daily submissions; flagged check-ins shown in rose.
          </p>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={snapshot.checkInVolume}
                margin={{ top: 4, right: 8, bottom: 4, left: -16 }}
              >
                <CartesianGrid stroke="#eef1f7" vertical={false} />
                <XAxis
                  dataKey="dayKey"
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  tickFormatter={(d: string) => d.slice(5)}
                  interval="preserveStartEnd"
                  minTickGap={28}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 10, fill: "#64748b" }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="total" fill="#6b92cf" radius={[2, 2, 0, 0]} />
                <Bar dataKey="flagged" fill="#c47a8b" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-lg font-semibold text-slate-800">
            Severity distribution · latest measurements
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Patients bucketed by latest PHQ-9 and GAD-7.
          </p>
          <SeverityTable
            title="PHQ-9"
            buckets={snapshot.phq9Distribution}
            total={
              snapshot.metrics.averageLatestPhq9 === null
                ? 0
                : sumValues(snapshot.phq9Distribution)
            }
          />
          <SeverityTable
            title="GAD-7"
            buckets={snapshot.gad7Distribution}
            total={
              snapshot.metrics.averageLatestGad7 === null
                ? 0
                : sumValues(snapshot.gad7Distribution)
            }
            // GAD-7 has no "Moderately severe" bucket — collapse it visually.
            hiddenBuckets={["Moderately severe"]}
          />
        </Card>
      </section>

      <section>
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-lg font-semibold text-slate-800">
              Recent flagged check-ins
            </h2>
            <Badge tone="rose">{snapshot.recentFlagged.length} total</Badge>
          </div>
          {snapshot.recentFlagged.length === 0 ? (
            <p className="mt-4 rounded-xl bg-mist-50 px-4 py-8 text-center text-sm text-slate-500">
              No safety-flagged check-ins on file. Quiet is good.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100">
              {snapshot.recentFlagged.map((row) => (
                <li
                  key={row.checkInId}
                  className="flex flex-wrap items-start justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800">
                      {row.patientName}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {formatDate(row.recordedAt)} at {formatTime(row.recordedAt)}
                      {" · "}
                      Sleep {row.sleepHours}h · Adherence {row.adherence}
                    </p>
                    {row.message && (
                      <p className="mt-1 line-clamp-2 text-sm italic text-slate-700">
                        “{row.message}”
                      </p>
                    )}
                  </div>
                  <Badge tone="rose" className="shrink-0">
                    Safety flag
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      <p className="text-xs text-slate-400 print:hidden">
        Metrics derived from in-browser data. Not for clinical reporting until a
        server-side data store is in place.
      </p>

      <ExportDrawer
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        patients={patients}
        medEventsByPatient={medEventsByPatient}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function MetricCard({
  icon: Icon,
  label,
  value,
  sublabel,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sublabel: string;
  tone: "pulse" | "lavender" | "rose" | "peach" | "slate";
}) {
  const toneClasses: Record<typeof tone, string> = {
    pulse: "bg-pulse-100 text-pulse-700",
    lavender: "bg-lavender-100 text-lavender-800",
    rose: "bg-rose-100 text-rose-800",
    peach: "bg-peach-100 text-peach-800",
    slate: "bg-mist-100 text-slate-600",
  };
  return (
    <Card>
      <div className="flex items-center gap-3">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${toneClasses[tone]}`}
        >
          <Icon className="h-4 w-4" />
        </span>
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
          {label}
        </p>
      </div>
      <p className="mt-3 font-display text-3xl font-semibold text-slate-800">
        {value}
      </p>
      <p className="mt-1 text-xs text-slate-500">{sublabel}</p>
    </Card>
  );
}

function SeverityTable({
  title,
  buckets,
  total,
  hiddenBuckets = [],
}: {
  title: string;
  buckets: Record<SeverityBucket, number>;
  total: number;
  hiddenBuckets?: SeverityBucket[];
}) {
  const visible = SEVERITY_ORDER.filter((b) => !hiddenBuckets.includes(b));
  const max = Math.max(...visible.map((b) => buckets[b]), 1);
  return (
    <div className="mt-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </p>
      {total === 0 ? (
        <p className="mt-2 text-sm text-slate-500">No measurements on file.</p>
      ) : (
        <ul className="mt-2 space-y-1.5">
          {visible.map((bucket) => {
            const count = buckets[bucket];
            const widthPct = (count / max) * 100;
            return (
              <li
                key={bucket}
                className="flex items-center gap-3 text-xs"
              >
                <span className="w-32 shrink-0 text-slate-700">{bucket}</span>
                <div className="relative h-3 flex-1 overflow-hidden rounded bg-mist-100">
                  <div
                    className="absolute inset-y-0 left-0 rounded"
                    style={{
                      width: `${widthPct}%`,
                      background: SEVERITY_COLOR[bucket],
                    }}
                    aria-hidden
                  />
                </div>
                <span className="w-8 shrink-0 text-right text-slate-600">
                  {count}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function sumValues(rec: Record<string, number>): number {
  return Object.values(rec).reduce((a, b) => a + b, 0);
}

function ReportsSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="h-10 w-48 animate-pulse rounded bg-slate-200/70" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-white/70" />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-2xl bg-white/70" />
    </div>
  );
}
