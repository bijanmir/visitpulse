"use client";

import { Input } from "@/components/ui/input";
import { usePatients } from "@/hooks/use-practice-store";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import Link from "next/link";
import { useId, useMemo, useState } from "react";

export function PatientSearch({ className }: { className?: string }) {
  const patients = usePatients();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listboxId = useId();
  const optionId = (i: number) => `${listboxId}-opt-${i}`;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return patients
      .filter(
        (p) =>
          p.displayName.toLowerCase().includes(q) ||
          p.diagnosis.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [patients, query]);

  const showDropdown = focused && query.trim().length > 0;

  return (
    <div className={cn("relative w-full max-w-md", className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        aria-hidden
      />
      <Input
        type="search"
        placeholder="Search patients…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActiveIndex(-1);
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        onKeyDown={(e) => {
          if (!showDropdown || results.length === 0) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => (i + 1) % results.length);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) =>
              i <= 0 ? results.length - 1 : i - 1,
            );
          } else if (e.key === "Escape") {
            setQuery("");
            setActiveIndex(-1);
          }
        }}
        className="pl-10"
        aria-label="Search patients"
        role="combobox"
        aria-expanded={showDropdown}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={
          activeIndex >= 0 ? optionId(activeIndex) : undefined
        }
        autoComplete="off"
      />
      {showDropdown && (
        <ul
          id={listboxId}
          className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg shadow-slate-200/50"
          role="listbox"
          aria-label="Patient search results"
        >
          {results.length === 0 ? (
            <li className="px-4 py-3 text-sm text-slate-500">
              No patients found. Try a different name or diagnosis.
            </li>
          ) : (
            results.map((p, i) => {
              const active = i === activeIndex;
              return (
                <li
                  key={p.id}
                  id={optionId(i)}
                  role="option"
                  aria-selected={active}
                >
                  <Link
                    href={`/dashboard/patients/${p.id}`}
                    className={cn(
                      "block px-4 py-2.5",
                      active ? "bg-pulse-50" : "hover:bg-pulse-50",
                    )}
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => {
                      setQuery("");
                      setActiveIndex(-1);
                      setFocused(false);
                    }}
                  >
                    <span className="font-medium text-slate-800">
                      {p.displayName}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      {p.diagnosis}
                    </span>
                  </Link>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
