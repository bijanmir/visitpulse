"use client";

import { useAuth } from "@/hooks/use-practice-store";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!auth.isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [auth.isAuthenticated, pathname, router]);

  if (!auth.isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ambient">
        <p className="text-sm text-slate-500">Redirecting to sign in…</p>
      </div>
    );
  }

  return <>{children}</>;
}
