import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
  hover = false,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/80 bg-white/90 p-6 shadow-sm shadow-slate-200/50 backdrop-blur-sm",
        hover &&
          "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-pulse-200/30",
        className,
      )}
    >
      {children}
    </div>
  );
}
