import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatTime } from "@/lib/utils";
import type { PrepCard } from "@/modules/visit-prep/prep-card";
import {
  AlertTriangle,
  ClipboardList,
  MessageCircle,
  MessageSquareQuote,
  Pill,
  Sparkles,
} from "lucide-react";

export function PrepCardView({ prep }: { prep: PrepCard }) {
  const message = prep.latestCheckIn?.patientMessage?.trim();

  return (
    <Card className="border-pulse-100/80 bg-gradient-to-br from-white to-pulse-50/40">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-pulse-700">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Visit brief
            </span>
          </div>
          <p className="mt-2 font-display text-2xl font-semibold text-slate-800">
            {prep.summary}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Visit at {formatTime(prep.visitAt)} · Generated just now
          </p>
        </div>
        {prep.safetyAlert && (
          <Badge tone="rose" className="shrink-0 gap-1">
            <AlertTriangle className="h-3 w-3" />
            Review safety
          </Badge>
        )}
      </div>

      {message && (
        <div className="mt-6 rounded-xl bg-lavender-100/60 px-5 py-4 ring-1 ring-lavender-200/70">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-lavender-800">
            <MessageSquareQuote className="h-4 w-4" />
            Patient message
          </div>
          <p className="mt-2 text-base leading-relaxed text-slate-700">
            &ldquo;{message}&rdquo;
          </p>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {prep.phq9Trend && (
          <TrendPill
            label="PHQ-9"
            trend={prep.phq9Trend.label}
            delta={prep.phq9Trend.delta}
          />
        )}
        {prep.gad7Trend && (
          <TrendPill
            label="GAD-7"
            trend={prep.gad7Trend.label}
            delta={prep.gad7Trend.delta}
          />
        )}
      </div>

      <div className="mt-6 space-y-4">
        <Section icon={Pill} title="Medication context">
          <ul className="space-y-1.5 text-sm text-slate-600">
            {prep.medHighlights.map((line) => (
              <li key={line} className="flex gap-2">
                <span className="text-pulse-400">·</span>
                {line}
              </li>
            ))}
          </ul>
        </Section>

        {prep.talkingPoints.length > 0 && (
          <Section icon={MessageCircle} title="Suggested focus">
            <ul className="space-y-1.5 text-sm text-slate-600">
              {prep.talkingPoints.map((point) => (
                <li key={point} className="flex gap-2">
                  <span className="text-lavender-400">→</span>
                  {point}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {prep.latestCheckIn && (
          <Section icon={ClipboardList} title="Latest check-in details">
            <p className="text-sm text-slate-600">
              Sleep {prep.latestCheckIn.sleepHours}h · Adherence{" "}
              {prep.latestCheckIn.medicationAdherence}
              {prep.latestCheckIn.sideEffects.filter((s) => s !== "None")
                .length > 0 && (
                <>
                  {" "}
                  · Side effects:{" "}
                  {prep.latestCheckIn.sideEffects
                    .filter((s) => s !== "None")
                    .join(", ")}
                </>
              )}
            </p>
            <p className="mt-2 text-xs text-pulse-600">
              See full check-in history below for all submissions.
            </p>
          </Section>
        )}
      </div>
    </Card>
  );
}

function TrendPill({
  label,
  trend,
  delta,
}: {
  label: string;
  trend: string;
  delta: number;
}) {
  const tone =
    delta < -2 ? "pulse" : delta > 2 ? "rose" : ("lavender" as const);
  return (
    <div className="rounded-xl bg-white/80 px-4 py-3 ring-1 ring-slate-100">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        <Badge tone={tone}>{trend}</Badge>
        <span className="text-sm text-slate-500">
          {delta > 0 ? "+" : ""}
          {delta} pts
        </span>
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <Icon className="h-4 w-4 text-pulse-500" />
        {title}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}
