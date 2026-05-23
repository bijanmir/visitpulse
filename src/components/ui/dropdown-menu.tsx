"use client";

import { cn } from "@/lib/utils";
import {
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
} from "react";

type Ctx = { close: () => void; menuId: string };
const DropdownContext = createContext<Ctx | null>(null);

type TriggerProps = {
  onClick: (e: ReactMouseEvent<HTMLElement>) => void;
  "aria-haspopup": "menu";
  "aria-expanded": boolean;
  "aria-controls": string;
};

export function DropdownMenu({
  trigger,
  children,
  align = "right",
  label,
}: {
  /** Element rendered as the trigger; we inject onClick + aria. */
  trigger: ReactElement<Partial<TriggerProps>>;
  children: React.ReactNode;
  align?: "left" | "right";
  /** Accessible label for the menu region. */
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    function handlePointer(e: PointerEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleKey);
    // Focus the first menu item for keyboard users.
    const first = menuRef.current?.querySelector<HTMLElement>(
      '[role="menuitem"]',
    );
    first?.focus();
    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  if (!isValidElement(trigger)) {
    throw new Error("DropdownMenu requires a single ReactElement trigger");
  }

  const wired = cloneElement(trigger, {
    onClick: (e: ReactMouseEvent<HTMLElement>) => {
      e.preventDefault();
      setOpen((v) => !v);
    },
    "aria-haspopup": "menu",
    "aria-expanded": open,
    "aria-controls": menuId,
  } satisfies TriggerProps);

  return (
    <div ref={containerRef} className="relative inline-block">
      {wired}
      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label={label}
          className={cn(
            "absolute top-full z-40 mt-1 min-w-[200px] overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg shadow-slate-200/60",
            align === "right" ? "right-0" : "left-0",
          )}
          onKeyDown={(e) => {
            const items = Array.from(
              menuRef.current?.querySelectorAll<HTMLElement>(
                '[role="menuitem"]',
              ) ?? [],
            );
            const idx = items.indexOf(document.activeElement as HTMLElement);
            if (e.key === "ArrowDown") {
              e.preventDefault();
              items[(idx + 1) % items.length]?.focus();
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              items[idx <= 0 ? items.length - 1 : idx - 1]?.focus();
            }
          }}
        >
          <DropdownContext.Provider value={{ close: () => setOpen(false), menuId }}>
            {children}
          </DropdownContext.Provider>
        </div>
      )}
    </div>
  );
}

export function DropdownMenuItem({
  children,
  onSelect,
  icon: Icon,
  destructive = false,
}: {
  children: React.ReactNode;
  onSelect: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  destructive?: boolean;
}) {
  const ctx = useContext(DropdownContext);
  return (
    <button
      type="button"
      role="menuitem"
      onClick={() => {
        onSelect();
        ctx?.close();
      }}
      className={cn(
        "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors focus:outline-none",
        destructive
          ? "text-rose-700 hover:bg-rose-50 focus:bg-rose-50"
          : "text-slate-700 hover:bg-mist-50 focus:bg-mist-50",
      )}
    >
      {Icon && (
        <Icon
          className={cn(
            "h-4 w-4 shrink-0",
            destructive ? "text-rose-600" : "text-slate-400",
          )}
        />
      )}
      <span className="min-w-0 flex-1">{children}</span>
    </button>
  );
}

export function DropdownMenuSeparator() {
  return <div className="my-1 h-px bg-slate-100" role="separator" />;
}
