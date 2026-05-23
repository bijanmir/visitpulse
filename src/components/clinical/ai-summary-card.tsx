"use client";

import { useClientMounted } from "@/hooks/use-client-mounted";
import { buildPatientSummaryContext } from "@/lib/ai-summary-context";
import type {
  CheckIn,
  MedEvent,
  Patient,
  ScaleResponse,
} from "@/modules/clinical/types";
import { RefreshCw, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type CachedSummary = {
  cacheVersion: string;
  summary: string;
  generatedAt: string;
};

function cacheKey(patientId: string): string {
  return `visitpulse-ai-summary:${patientId}`;
}

function loadCached(patientId: string): CachedSummary | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(cacheKey(patientId));
    return raw ? (JSON.parse(raw) as CachedSummary) : null;
  } catch {
    return null;
  }
}

function saveCached(patientId: string, value: CachedSummary): void {
  try {
    localStorage.setItem(cacheKey(patientId), JSON.stringify(value));
  } catch {
    // localStorage may be unavailable (private mode); silently no-op.
  }
}

type Status = "idle" | "loading" | "ready" | "error" | "disabled";

type Props = {
  patient: Patient;
  medEvents: MedEvent[];
  scales: ScaleResponse[];
  checkIns: CheckIn[];
};

export function AiSummaryCard(props: Props) {
  const mounted = useClientMounted();
  if (!mounted) return null;
  // Remount on patient change so the inner component's lazy state init re-reads
  // the right cache entry for the new patient.
  return <AiSummaryCardBody key={props.patient.id} {...props} />;
}

function AiSummaryCardBody({ patient, medEvents, scales, checkIns }: Props) {
  const context = useMemo(
    () => buildPatientSummaryContext(patient, medEvents, scales, checkIns),
    [patient, medEvents, scales, checkIns],
  );

  // Lazy init: read cache once at first render of this patient.
  const [initial] = useState(() => {
    const cached = loadCached(patient.id);
    if (cached && cached.cacheVersion === context.cacheVersion) {
      return {
        summary: cached.summary,
        generatedAt: cached.generatedAt,
        version: context.cacheVersion,
      };
    }
    return { summary: null, generatedAt: null, version: null };
  });

  const [summary, setSummary] = useState<string | null>(initial.summary);
  const [generatedAt, setGeneratedAt] = useState<string | null>(initial.generatedAt);
  const [status, setStatus] = useState<Status>(initial.summary ? "ready" : "idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  /**
   * The cacheVersion that our current summary corresponds to. Compared against
   * `context.cacheVersion` to decide whether we need to refetch — handles both
   * the first-render-no-cache case and the cache-version-changed-after-mount
   * case (e.g., a new check-in submitted while the page is open).
   */
  const [readyForVersion, setReadyForVersion] = useState<string | null>(initial.version);

  const fetchSummary = useCallback(
    async (signal?: AbortSignal) => {
      setStatus("loading");
      setErrorMessage(null);
      try {
        const resp = await fetch("/api/patient-summary", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ promptText: context.promptText }),
          signal,
        });
        if (resp.status === 503) {
          // Feature disabled or ANTHROPIC_API_KEY unset — hide silently.
          setStatus("disabled");
          return;
        }
        const data = (await resp.json()) as
          | { summary: string }
          | { error: string };
        if (!resp.ok || "error" in data) {
          const msg = "error" in data ? data.error : `Request failed (${resp.status})`;
          setStatus("error");
          setErrorMessage(msg);
          return;
        }
        const now = new Date().toISOString();
        setSummary(data.summary);
        setGeneratedAt(now);
        setReadyForVersion(context.cacheVersion);
        setStatus("ready");
        saveCached(patient.id, {
          cacheVersion: context.cacheVersion,
          summary: data.summary,
          generatedAt: now,
        });
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setStatus("error");
        setErrorMessage(
          err instanceof Error ? err.message : "Couldn't reach the summary service.",
        );
      }
    },
    [context.cacheVersion, context.promptText, patient.id],
  );

  useEffect(() => {
    // Skip fetching if we already have a summary for this exact cacheVersion
    // (cache hit on first render, or successful fetch finished). Otherwise
    // fire — this also covers the case where cacheVersion changes mid-session
    // because a new check-in arrived.
    if (readyForVersion === context.cacheVersion) return;
    if (status === "disabled") return;
    const controller = new AbortController();
    // Defer so the synchronous setStatus("loading") inside fetchSummary lands
    // in a microtask rather than the effect body (React 19 lint rule:
    // react-hooks/set-state-in-effect — synchronous setState in an effect
    // body is what triggers cascading renders the rule is meant to prevent).
    queueMicrotask(() => {
      if (!controller.signal.aborted) void fetchSummary(controller.signal);
    });
    return () => controller.abort();
  }, [context.cacheVersion, readyForVersion, status, fetchSummary]);

  if (status === "disabled") return null;

  return (
    <div className="rounded-2xl border border-pulse-200/70 bg-gradient-to-br from-pulse-50/80 via-white to-lavender-50/40 px-5 py-5 shadow-sm shadow-pulse-100/40">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-pulse-700">
          <Sparkles className="h-4 w-4" aria-hidden />
          <span className="text-xs font-semibold uppercase tracking-wider">
            AI pre-visit summary
          </span>
        </div>
        <button
          type="button"
          onClick={() => fetchSummary()}
          disabled={status === "loading"}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:bg-pulse-100/60 hover:text-pulse-800 disabled:opacity-50"
          aria-label="Regenerate summary"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${status === "loading" ? "animate-spin" : ""}`}
            aria-hidden
          />
          {status === "loading" ? "Generating…" : "Regenerate"}
        </button>
      </div>

      <div className="mt-3 min-h-[3.5rem]">
        {status === "loading" && summary === null && <SkeletonLines />}
        {status === "error" && (
          <p className="text-sm text-rose-700" role="alert">
            {errorMessage ?? "Couldn't generate the summary."}
          </p>
        )}
        {summary && (
          <p className="text-base leading-relaxed text-slate-800">{summary}</p>
        )}
      </div>

      <p className="mt-3 text-[11px] text-slate-400">
        AI-generated from the data above. Not a clinical recommendation.
        {generatedAt && status !== "loading" && (
          <> · Generated {formatRelative(generatedAt)}.</>
        )}
      </p>
    </div>
  );
}

function SkeletonLines() {
  return (
    <div className="space-y-2" aria-label="Generating summary">
      <div className="h-3 w-11/12 animate-pulse rounded bg-slate-200/70" />
      <div className="h-3 w-10/12 animate-pulse rounded bg-slate-200/70" />
      <div className="h-3 w-6/12 animate-pulse rounded bg-slate-200/70" />
    </div>
  );
}

function formatRelative(iso: string): string {
  const diffSec = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (diffSec < 60) return "just now";
  if (diffSec < 3600) return `${Math.round(diffSec / 60)} min ago`;
  if (diffSec < 86_400) return `${Math.round(diffSec / 3600)}h ago`;
  return `${Math.round(diffSec / 86_400)}d ago`;
}
