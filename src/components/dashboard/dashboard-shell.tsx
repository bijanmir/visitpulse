"use client";

import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { useProfile } from "@/hooks/use-practice-store";
import { getProfileInitials } from "@/lib/practice-store";
import Link from "next/link";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const profile = useProfile();

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col pl-64">
        <header className="z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/60 bg-white/80 px-8 backdrop-blur-md">
          <div />
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 rounded-xl px-2 py-1 transition-colors hover:bg-mist-100"
          >
            <div className="text-right">
              <p className="text-sm font-medium text-slate-800">
                {profile.name}
              </p>
              <p className="text-xs text-slate-500">{profile.specialty}</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-pulse-100 font-semibold text-pulse-700">
              {getProfileInitials(profile.name)}
            </span>
          </Link>
        </header>
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
