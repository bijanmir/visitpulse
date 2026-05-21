"use client";

import { Logo } from "@/components/brand/logo";
import { usePatients, useProfile } from "@/hooks/use-practice-store";
import { toDayKey } from "@/lib/date-utils";
import { getPatientsForDay } from "@/lib/practice-store";
import { cn } from "@/lib/utils";
import { mergeCheckIns } from "@/lib/check-in-store";
import {
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import { logout } from "@/lib/practice-store";

const links = [
  { href: "/dashboard", label: "Schedule", icon: LayoutDashboard },
  { href: "/dashboard/patients", label: "Patients", icon: Users },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar({
  mobileOpen = false,
  onMobileClose,
}: {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const profile = useProfile();
  const patients = usePatients();
  const todayKey = toDayKey(new Date());

  const todayVisits = useMemo(
    () => getPatientsForDay(todayKey),
    [patients, todayKey],
  );

  const briefsReady = useMemo(() => {
    return todayVisits.filter((p) => {
      const merged = mergeCheckIns(p.checkIns, p.id);
      return merged.some((c) => toDayKey(c.recordedAt) === todayKey);
    }).length;
  }, [todayVisits, todayKey]);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex h-screen w-64 max-w-[85vw] flex-col border-r border-slate-200/60 bg-white/95 px-4 py-6 backdrop-blur-md transition-transform duration-200 md:z-40 md:max-w-none md:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
      )}
    >
      <div className="flex items-center justify-between">
        <Logo />
        <button
          type="button"
          className="rounded-lg p-1 text-slate-400 hover:bg-mist-100 md:hidden"
          aria-label="Close menu"
          onClick={onMobileClose}
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <p className="mt-1 truncate px-1 text-xs text-slate-500">
        {profile.practice}
      </p>

      <nav className="mt-8 flex flex-1 flex-col gap-1 overflow-y-auto">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onMobileClose}
              className={cn(
                "flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-pulse-100 text-pulse-800"
                  : "text-slate-600 hover:bg-mist-100 hover:text-slate-800",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 space-y-3">
        <div className="rounded-xl bg-gradient-to-br from-pulse-50 to-lavender-100/40 p-4 ring-1 ring-pulse-100">
          <div className="flex items-center gap-2 text-pulse-700">
            <CalendarDays className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Today
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-slate-800">
            {todayVisits.length} visit{todayVisits.length === 1 ? "" : "s"}
          </p>
          <p className="text-xs text-slate-500">
            {briefsReady} check-in{briefsReady === 1 ? "" : "s"} today
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-mist-100 hover:text-slate-700"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
