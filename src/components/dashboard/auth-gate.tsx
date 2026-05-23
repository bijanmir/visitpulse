"use client";

import { useClientMounted } from "@/hooks/use-client-mounted";
import { useAuth } from "@/hooks/use-practice-store";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const mounted = useClientMounted();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (mounted && !auth.isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [mounted, auth.isAuthenticated, pathname, router]);

  // Auth state lives in localStorage and is unreadable during SSR / first
  // client render. Render a neutral shell until mounted so SSR and client
  // emit the same HTML — otherwise React throws a hydration mismatch.
  if (!mounted) {
    return <AuthShell />;
  }

  if (!auth.isAuthenticated) {
    return <AuthShell message="Redirecting to sign in…" />;
  }

  return <>{children}</>;
}

function AuthShell({ message }: { message?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ambient">
      {message && <p className="text-sm text-slate-500">{message}</p>}
    </div>
  );
}
