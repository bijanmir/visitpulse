"use client";

import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { PatientSearch } from "@/components/dashboard/patient-search";
import { useProfile } from "@/hooks/use-practice-store";
import { getProfileInitials } from "@/lib/practice-store";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const profile = useProfile();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen md:h-screen md:overflow-hidden">
      {mobileNavOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/40 md:hidden"
          aria-label="Close menu"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <DashboardSidebar
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col md:pl-64">
        <header className="sticky top-0 z-30 shrink-0 border-b border-slate-200/60 bg-white/90 px-4 py-3 backdrop-blur-md sm:px-6 md:px-8">
          {/* Mobile-only top row: hamburger + practice + profile chip */}
          <div className="flex items-center justify-between gap-3 md:hidden">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-mist-100"
              aria-label="Open menu"
              onClick={() => setMobileNavOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800">
                {profile.practice}
              </p>
            </div>
            <ProfileChip
              name={profile.name}
              specialty={profile.specialty}
              showText={false}
            />
          </div>

          {/* Search row — also carries the profile chip on desktop */}
          <div className="mt-3 flex items-center gap-3 md:mt-0 md:justify-between">
            <PatientSearch className="w-full md:max-w-sm md:flex-1" />
            <div className="hidden md:block">
              <ProfileChip
                name={profile.name}
                specialty={profile.specialty}
                showText
              />
            </div>
          </div>
        </header>

        <main
          className={cn(
            "flex-1 overflow-y-auto px-4 py-6 pb-8 sm:px-6 md:px-8 md:py-8",
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

function ProfileChip({
  name,
  specialty,
  showText,
}: {
  name: string;
  specialty: string;
  showText: boolean;
}) {
  return (
    <Link
      href="/dashboard/settings"
      className="flex shrink-0 items-center gap-2 rounded-xl px-2 py-1 transition-colors hover:bg-mist-100 sm:gap-3"
    >
      {showText && (
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-slate-800">{name}</p>
          <p className="text-xs text-slate-500">{specialty}</p>
        </div>
      )}
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-pulse-100 text-sm font-semibold text-pulse-700">
        {getProfileInitials(name)}
      </span>
    </Link>
  );
}
