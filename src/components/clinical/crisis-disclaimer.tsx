import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export function CrisisDisclaimer({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="text-center text-xs leading-relaxed text-slate-500">
        Not for emergencies. If you are in crisis, call{" "}
        <a href="tel:988" className="font-medium text-pulse-700">
          988
        </a>{" "}
        or{" "}
        <a href="tel:911" className="font-medium text-pulse-700">
          911
        </a>
        .
      </p>
    );
  }

  return (
    <div
      role="note"
      className="rounded-xl border border-rose-200/80 bg-rose-50/80 px-4 py-3 text-sm text-slate-700"
    >
      <div className="flex gap-3">
        <AlertTriangle
          className="mt-0.5 h-5 w-5 shrink-0 text-rose-600"
          aria-hidden
        />
        <div>
          <p className="font-medium text-slate-800">Not for emergencies</p>
          <p className="mt-1 leading-relaxed text-slate-600">
            This check-in is not monitored in real time. If you are in crisis
            or may hurt yourself or someone else, call{" "}
            <a href="tel:988" className="font-semibold text-pulse-700">
              988
            </a>{" "}
            (Suicide &amp; Crisis Lifeline) or{" "}
            <a href="tel:911" className="font-semibold text-pulse-700">
              911
            </a>{" "}
            now. Do not use this form instead of emergency care.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            <Link href="/safety" className="underline hover:text-pulse-700">
              How VisitPulse handles safety
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
