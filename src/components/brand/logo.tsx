import { cn } from "@/lib/utils";
import { HeartPulse } from "lucide-react";
import Link from "next/link";

export function Logo({
  className,
  showText = true,
}: {
  className?: string;
  showText?: boolean;
}) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5", className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-pulse-400 to-pulse-600 text-white shadow-sm shadow-pulse-500/25">
        <HeartPulse className="h-4.5 w-4.5" strokeWidth={2.5} />
      </span>
      {showText && (
        <span className="font-display text-xl font-semibold tracking-tight text-slate-800">
          VisitPulse
        </span>
      )}
    </Link>
  );
}
