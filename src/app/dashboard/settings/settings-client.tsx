"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { usePracticeStore } from "@/hooks/use-practice-store";
import {
  DEMO_MFA_CODE,
  logout,
  setMfaEnabled,
  updateNoteExportPrefs,
  updateProfile,
} from "@/lib/practice-store";
import { ClipboardCopy, KeyRound, Shield, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SettingsClient() {
  const { profile, auth, noteExport, refresh } = usePracticeStore();
  const router = useRouter();
  const [name, setName] = useState(profile.name);
  const [practice, setPractice] = useState(profile.practice);
  const [specialty, setSpecialty] = useState(profile.specialty);
  const [email, setEmail] = useState(profile.email);
  const [saved, setSaved] = useState(false);

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    updateProfile({ name, practice, specialty, email });
    refresh();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function toggleMfa() {
    setMfaEnabled(!auth.mfaEnabled);
    refresh();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-slate-800">
          Settings
        </h1>
        <p className="mt-1 text-slate-600">
          Your profile, practice, and security
        </p>
      </div>

      <Card>
        <div className="flex items-center gap-2 text-pulse-700">
          <User className="h-5 w-5" />
          <h2 className="font-display text-lg font-semibold text-slate-800">
            Clinician & practice
          </h2>
        </div>
        <form onSubmit={handleSaveProfile} className="mt-6 space-y-4">
          <div>
            <Label>Your name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label>Practice / business name</Label>
            <Input
              value={practice}
              onChange={(e) => setPractice(e.target.value)}
              required
            />
          </div>
          <div>
            <Label>Specialty</Label>
            <Input
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              required
            />
          </div>
          <div>
            <Label>Login email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit">
            {saved ? "Saved" : "Save profile"}
          </Button>
        </form>
      </Card>

      <Card>
        <div className="flex items-center gap-2 text-pulse-700">
          <KeyRound className="h-5 w-5" />
          <h2 className="font-display text-lg font-semibold text-slate-800">
            Multi-factor authentication
          </h2>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          When enabled, sign-in requires a second step after your password.
          Production will use a real authenticator app (TOTP).
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Badge tone={auth.mfaEnabled ? "pulse" : "slate"}>
            {auth.mfaEnabled ? "MFA enabled" : "MFA disabled"}
          </Badge>
          <Button variant="secondary" size="sm" onClick={toggleMfa}>
            {auth.mfaEnabled ? "Disable MFA" : "Enable MFA"}
          </Button>
        </div>
        {auth.mfaEnabled && (
          <p className="mt-3 rounded-lg bg-mist-50 px-3 py-2 text-xs text-slate-600">
            Demo authenticator code: <strong>{DEMO_MFA_CODE}</strong>
          </p>
        )}
      </Card>

      <Card>
        <div className="flex items-center gap-2 text-pulse-700">
          <ClipboardCopy className="h-5 w-5" />
          <h2 className="font-display text-lg font-semibold text-slate-800">
            Copy to note
          </h2>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          Defaults keep vendor branding and patient identifiers out of your
          clipboard. Enable only if you want them in pasted notes.
        </p>
        <div className="mt-4 space-y-3">
          <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={noteExport.includeIdentifiers}
              onChange={(e) => {
                updateNoteExportPrefs({
                  includeIdentifiers: e.target.checked,
                });
                refresh();
              }}
              className="h-4 w-4 rounded border-slate-300 text-pulse-600"
            />
            Include patient name, diagnosis, and age in export
          </label>
          <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={noteExport.includeBrandPrefix}
              onChange={(e) => {
                updateNoteExportPrefs({
                  includeBrandPrefix: e.target.checked,
                });
                refresh();
              }}
              className="h-4 w-4 rounded border-slate-300 text-pulse-600"
            />
            Include VisitPulse branding in export header
          </label>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 text-pulse-700">
          <Shield className="h-5 w-5" />
          <h2 className="font-display text-lg font-semibold text-slate-800">
            Safety & crisis workflow
          </h2>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          VisitPulse is not a crisis service. Read what we do and do not do
          before piloting with real patients.
        </p>
        <Link href="/safety" className="mt-4 inline-block">
          <Button variant="secondary" size="sm">
            View safety documentation
          </Button>
        </Link>
      </Card>

      <Button
        variant="secondary"
        onClick={() => {
          logout();
          router.push("/login");
        }}
      >
        Sign out
      </Button>
    </div>
  );
}