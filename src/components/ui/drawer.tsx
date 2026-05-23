"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  /** Desktop panel width. Mobile is always full-width. */
  size?: "sm" | "md" | "lg";
};

const sizeClasses: Record<NonNullable<DrawerProps["size"]>, string> = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
};

/**
 * Right-side slide-in panel. Focus-trapped, closes on Escape or backdrop
 * click, restores focus to the trigger on close. Unmounts the body when
 * closed so consumers can use lazy `useState` initialisers for form
 * defaults — opening the drawer again gets a fresh form.
 */
export function Drawer(props: DrawerProps) {
  if (!props.open) return null;
  return <DrawerBody {...props} />;
}

function DrawerBody({
  onClose,
  title,
  description,
  icon,
  children,
  size = "md",
}: DrawerProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<Element | null>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    triggerRef.current = document.activeElement;
    const node = panelRef.current;
    const first = node?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !node) return;
      const f = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (f.length === 0) return;
      const top = f[0];
      const bottom = f[f.length - 1];
      if (e.shiftKey && document.activeElement === top) {
        e.preventDefault();
        bottom.focus();
      } else if (!e.shiftKey && document.activeElement === bottom) {
        e.preventDefault();
        top.focus();
      }
    }
    document.addEventListener("keydown", handleKey);
    // Prevent background scroll while the drawer is open.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
      if (triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus();
      }
    };
  }, [onClose]);

  // Portal to document.body so the drawer escapes any ancestor that creates
  // a containing block for fixed positioning — `backdrop-filter` (used by
  // Card), `transform`, `filter`, etc. all anchor `position: fixed` to
  // themselves instead of the viewport.
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex">
      <button
        type="button"
        aria-label="Close panel"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className={`relative ml-auto flex h-full w-full flex-col bg-white shadow-xl ${sizeClasses[size]}`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200/60 px-6 py-5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-pulse-700">
              {icon}
              <h2
                id={titleId}
                className="font-display text-lg font-semibold text-slate-800"
              >
                {title}
              </h2>
            </div>
            {description && (
              <p id={descId} className="mt-1 text-sm text-slate-500">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-mist-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pulse-300"
            aria-label="Close"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
