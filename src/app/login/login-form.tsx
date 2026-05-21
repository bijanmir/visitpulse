"use client";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import {
  DEMO_MFA_CODE,
  DEMO_PASSWORD,
  DEFAULT_PROFILE,
  login,
  verifyMfa,
} from "@/lib/practice-store";
import { Shield } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";

  const [step, setStep] = useState<"credentials" | "mfa">("credentials");
  const [email, setEmail] = useState(DEFAULT_PROFILE.email);
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [error, setError] = useState("");

  function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const result = login(email, password);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (result.needsMfa) {
      setStep("mfa");
      return;
    }
    router.push(next);
  }

  function handleMfa(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!verifyMfa(mfaCode)) {
      setError(`Invalid code. Demo MFA code: ${DEMO_MFA_CODE}`);
      return;
    }
    router.push(next);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ambient px-6 py-12">
      <Logo className="mb-8" />
      <Card className="w-full max-w-md">
        {step === "credentials" ? (
          <>
            <h1 className="font-display text-2xl font-semibold text-slate-800">
              Sign in
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Clinician access for {DEFAULT_PROFILE.practice}
            </p>
            <form onSubmit={handleCredentials} className="mt-6 space-y-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
              {error && (
                <p className="text-sm text-rose-700" role="alert">
                  {error}
                </p>
              )}
              <Button type="submit" className="w-full">
                Continue
              </Button>
            </form>
            <p className="mt-4 rounded-lg bg-mist-50 px-3 py-2 text-xs text-slate-500">
              Demo: password <strong>{DEMO_PASSWORD}</strong>
              {` · MFA code ${DEMO_MFA_CODE} when enabled`}
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 text-pulse-700">
              <Shield className="h-5 w-5" />
              <h1 className="font-display text-2xl font-semibold text-slate-800">
                Verify MFA
              </h1>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Enter the 6-digit code from your authenticator app.
            </p>
            <form onSubmit={handleMfa} className="mt-6 space-y-4">
              <div>
                <Label>Authentication code</Label>
                <Input
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="000000"
                  className="text-center text-lg tracking-widest"
                  required
                />
              </div>
              {error && (
                <p className="text-sm text-rose-700" role="alert">
                  {error}
                </p>
              )}
              <Button type="submit" className="w-full">
                Verify & sign in
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep("credentials")}
              >
                Back
              </Button>
            </form>
          </>
        )}
      </Card>
      <Link
        href="/"
        className="mt-6 text-sm text-slate-500 hover:text-pulse-700"
      >
        ← Back to home
      </Link>
    </div>
  );
}
