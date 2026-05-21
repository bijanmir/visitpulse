"use client";

import { Input } from "@/components/ui/input";
import { usePatients } from "@/hooks/use-practice-store";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

export function PatientSearch({ className }: { className?: string }) {
  const patients = usePatients();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

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
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input
        type="search"
        placeholder="Search patients…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        className="pl-10"
        aria-label="Search patients"
        aria-expanded={showDropdown}
        autoComplete="off"
      />
      {showDropdown && (
        <ul
          className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg shadow-slate-200/50"
          role="listbox"
        >
          {results.length === 0 ? (
            <li className="px-4 py-3 text-sm text-slate-500">No matches</li>
          ) : (
            results.map((p) => (
              <li key={p.id} role="option">
                <Link
                  href={`/dashboard/patients/${p.id}`}
                  className="block px-4 py-2.5 hover:bg-pulse-50"
                  onClick={() => {
                    setQuery("");
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
            ))
          )}
        </ul>
      )}
    </div>
  );
}
