import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-pulse-300 focus:outline-none focus:ring-2 focus:ring-pulse-200",
          className,
        )}
        {...props}
      />
    );
  },
);

export const Label = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <label
    className={cn(
      "mb-1.5 block text-sm font-medium text-slate-700",
      className,
    )}
  >
    {children}
  </label>
);
