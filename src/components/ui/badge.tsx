import { cn } from "@/lib/utils";

const tones = {
  pulse: "bg-pulse-100 text-pulse-800 ring-pulse-200/60",
  lavender: "bg-lavender-100 text-lavender-800 ring-lavender-200/60",
  rose: "bg-rose-100 text-rose-800 ring-rose-200/60",
  peach: "bg-peach-100 text-peach-800 ring-peach-200/60",
  slate: "bg-mist-100 text-slate-600 ring-slate-200/60",
};

export function Badge({
  children,
  tone = "pulse",
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
