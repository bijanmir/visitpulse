"use client";

import { CrisisDisclaimer } from "@/components/clinical/crisis-disclaimer";
import { SymptomScaleStep } from "@/components/clinical/symptom-scale-step";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useClientMounted } from "@/hooks/use-client-mounted";
import { demoSafetyFlagFromCheckIn } from "@/lib/check-in-safety";
import { saveCheckIn } from "@/lib/check-in-store";
import { newCheckInId } from "@/lib/ids";
import { getPatientByToken } from "@/lib/practice-store";
import { GAD7, PHQ9 } from "@/lib/symptom-scales";
import { clinicalGuard } from "@/modules/compliance/guard";
import { auditLogger } from "@/modules/compliance/audit";
import type { CheckIn, Patient, ScaleResponse } from "@/modules/clinical/types";
import { CheckCircle2, MessageSquare, Moon, Pill } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const TOTAL_STEPS = 6;
const sideEffectOptions = [
  "None",
  "Nausea",
  "Sedation",
  "Restlessness",
  "Headache",
];

type DraftState = {
  step: number;
  sleep: number;
  adherence: "full" | "partial" | "missed";
  sideEffects: string[];
  phq9: (number | null)[];
  phq9Skipped: boolean;
  gad7: (number | null)[];
  gad7Skipped: boolean;
  patientMessage: string;
};

const EMPTY_DRAFT: DraftState = {
  step: 0,
  sleep: 7,
  adherence: "full",
  sideEffects: [],
  phq9: Array(PHQ9.questions.length).fill(null),
  phq9Skipped: false,
  gad7: Array(GAD7.questions.length).fill(null),
  gad7Skipped: false,
  patientMessage: "",
};

function draftKey(token: string): string {
  return `visitpulse-checkin-draft:${token}`;
}

function loadDraft(token: string): DraftState {
  if (typeof window === "undefined") return EMPTY_DRAFT;
  try {
    const raw = localStorage.getItem(draftKey(token));
    if (!raw) return EMPTY_DRAFT;
    const parsed = JSON.parse(raw) as Partial<DraftState>;
    // Defensive sizing: a stored draft from before the scale questions
    // existed will be missing these fields; pad arrays to the right length.
    const phq9 = Array.isArray(parsed.phq9)
      ? padAnswers(parsed.phq9, PHQ9.questions.length)
      : EMPTY_DRAFT.phq9;
    const gad7 = Array.isArray(parsed.gad7)
      ? padAnswers(parsed.gad7, GAD7.questions.length)
      : EMPTY_DRAFT.gad7;
    return { ...EMPTY_DRAFT, ...parsed, phq9, gad7 };
  } catch {
    return EMPTY_DRAFT;
  }
}

function padAnswers(arr: unknown[], len: number): (number | null)[] {
  const out: (number | null)[] = Array(len).fill(null);
  for (let i = 0; i < Math.min(arr.length, len); i++) {
    const v = arr[i];
    out[i] = typeof v === "number" ? v : null;
  }
  return out;
}

function answersComplete(arr: (number | null)[]): arr is number[] {
  return arr.every((v) => typeof v === "number");
}

export default function CheckInPage() {
  const params = useParams();
  const token = params.token as string;
  const patient = getPatientByToken(token);
  const mounted = useClientMounted();

  if (!patient) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="max-w-md text-center">
          <p className="text-slate-600">This check-in link is not valid.</p>
        </Card>
      </div>
    );
  }

  if (!mounted) {
    return <CheckInScaffold patient={patient} />;
  }

  return <CheckInForm patient={patient} token={token} />;
}

function CheckInScaffold({ patient }: { patient: Patient }) {
  return (
    <div className="min-h-screen bg-ambient">
      <div className="mx-auto max-w-lg px-6 py-10">
        <div className="flex justify-center">
          <Logo />
        </div>
        <div className="mt-6">
          <CrisisDisclaimer />
        </div>
        <p className="mt-6 text-center text-sm text-slate-500">
          Pre-visit check-in · about 4 minutes
        </p>
        <h1 className="font-display mt-2 text-center text-2xl font-semibold text-slate-800">
          Hi {patient.displayName.split(" ")[0]}
        </h1>
      </div>
    </div>
  );
}

function CheckInForm({ patient, token }: { patient: Patient; token: string }) {
  const initial = loadDraft(token);
  const [step, setStep] = useState(initial.step);
  const [sleep, setSleep] = useState(initial.sleep);
  const [adherence, setAdherence] = useState<DraftState["adherence"]>(
    initial.adherence,
  );
  const [sideEffects, setSideEffects] = useState<string[]>(initial.sideEffects);
  const [phq9, setPhq9] = useState<(number | null)[]>(initial.phq9);
  const [phq9Skipped, setPhq9Skipped] = useState(initial.phq9Skipped);
  const [gad7, setGad7] = useState<(number | null)[]>(initial.gad7);
  const [gad7Skipped, setGad7Skipped] = useState(initial.gad7Skipped);
  const [patientMessage, setPatientMessage] = useState(initial.patientMessage);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (submitted) return;
    const draft: DraftState = {
      step,
      sleep,
      adherence,
      sideEffects,
      phq9,
      phq9Skipped,
      gad7,
      gad7Skipped,
      patientMessage,
    };
    try {
      localStorage.setItem(draftKey(token), JSON.stringify(draft));
    } catch {
      // ignore
    }
  }, [
    submitted,
    token,
    step,
    sleep,
    adherence,
    sideEffects,
    phq9,
    phq9Skipped,
    gad7,
    gad7Skipped,
    patientMessage,
  ]);

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ambient p-6">
        <Card className="w-full max-w-md text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-pulse-500" />
          <h1 className="font-display mt-4 text-2xl font-semibold text-slate-800">
            Thank you
          </h1>
          <p className="mt-2 text-slate-600">
            Your responses were sent to your clinician and will appear on their
            dashboard before your visit.
          </p>
          <p className="mt-4 text-sm text-slate-500">
            You can close this page now.
          </p>
        </Card>
      </div>
    );
  }

  function handleSubmit() {
    setSubmitError(null);
    const recordedAt = new Date().toISOString();

    const scales: ScaleResponse[] = [];
    if (!phq9Skipped && answersComplete(phq9)) {
      scales.push({
        type: "phq9",
        score: phq9.reduce((sum, v) => sum + v, 0),
        maxScore: PHQ9.maxScore,
        recordedAt,
        items: phq9,
      });
    }
    if (!gad7Skipped && answersComplete(gad7)) {
      scales.push({
        type: "gad7",
        score: gad7.reduce((sum, v) => sum + v, 0),
        maxScore: GAD7.maxScore,
        recordedAt,
        items: gad7,
      });
    }
    const phq9Items =
      !phq9Skipped && answersComplete(phq9) ? phq9 : undefined;

    const checkIn: CheckIn = {
      id: newCheckInId(),
      patientId: patient.id,
      recordedAt,
      sleepHours: sleep,
      medicationAdherence: adherence,
      sideEffects: sideEffects.length ? sideEffects : ["None"],
      safetyFlag: demoSafetyFlagFromCheckIn({
        medicationAdherence: adherence,
        patientMessage,
        phq9Items,
      }),
      patientMessage: patientMessage.trim() || undefined,
      scales: scales.length ? scales : undefined,
    };

    try {
      clinicalGuard.assertCanPersistPhi();
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Check-in is unavailable in this configuration. Please contact your clinician.",
      );
      return;
    }

    saveCheckIn(checkIn);
    void auditLogger.log({
      action: "checkin.submit",
      actorId: patient.id,
      resourceType: "checkin",
      resourceId: checkIn.id,
    });
    try {
      localStorage.removeItem(draftKey(token));
    } catch {
      // ignore
    }
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-ambient">
      <div className="mx-auto max-w-lg px-6 py-10">
        <div className="flex justify-center">
          <Logo />
        </div>

        {/* Crisis disclaimer above the greeting on purpose:
            a patient in distress should see 988/911 before anything else. */}
        <div className="mt-6">
          <CrisisDisclaimer />
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Pre-visit check-in · about 4 minutes
        </p>
        <h1 className="font-display mt-2 text-center text-2xl font-semibold text-slate-800">
          Hi {patient.displayName.split(" ")[0]}
        </h1>

        <Card className="mt-6">
          {step === 0 && (
            <div>
              <div className="flex items-center gap-2 text-pulse-700">
                <Moon className="h-5 w-5" aria-hidden />
                <h2 id="sleep-label" className="font-medium text-slate-800">
                  How did you sleep last night?
                </h2>
              </div>
              <input
                type="range"
                min={0}
                max={12}
                step={0.5}
                value={sleep}
                onChange={(e) => setSleep(Number(e.target.value))}
                aria-labelledby="sleep-label"
                aria-valuemin={0}
                aria-valuemax={12}
                aria-valuenow={sleep}
                aria-valuetext={`${sleep} hours`}
                className="mt-6 w-full accent-pulse-500"
              />
              <p
                className="mt-2 text-center text-2xl font-semibold text-slate-800"
                aria-live="polite"
              >
                {sleep} hours
              </p>
            </div>
          )}

          {step === 1 && (
            <div>
              <div className="flex items-center gap-2 text-pulse-700">
                <Pill className="h-5 w-5" aria-hidden />
                <h2 className="font-medium text-slate-800">
                  Medication adherence this week
                </h2>
              </div>
              <div
                className="mt-6 grid gap-2"
                role="radiogroup"
                aria-label="Medication adherence this week"
              >
                {(
                  [
                    ["full", "Took all doses"],
                    ["partial", "Missed 1–2 doses"],
                    ["missed", "Missed several doses"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={adherence === value}
                    onClick={() => setAdherence(value)}
                    className={`rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors ${
                      adherence === value
                        ? "bg-pulse-100 text-pulse-800 ring-2 ring-pulse-300"
                        : "bg-mist-50 text-slate-600 ring-1 ring-slate-200 hover:bg-mist-100"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="font-medium text-slate-800">
                Any side effects recently?
              </h2>
              <div
                className="mt-4 flex flex-wrap gap-2"
                role="group"
                aria-label="Side effects"
              >
                {sideEffectOptions.map((opt) => {
                  const selected = sideEffects.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => {
                        if (opt === "None") {
                          setSideEffects(["None"]);
                          return;
                        }
                        setSideEffects((prev) => {
                          const next = prev.filter((s) => s !== "None");
                          return selected
                            ? next.filter((s) => s !== opt)
                            : [...next, opt];
                        });
                      }}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                        selected
                          ? "bg-pulse-100 text-pulse-800 ring-2 ring-pulse-300"
                          : "bg-mist-50 text-slate-600 ring-1 ring-slate-200"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <SymptomScaleStep
              scale={PHQ9}
              answers={phq9}
              onChange={(next) => {
                setPhq9(next);
                if (phq9Skipped) setPhq9Skipped(false);
              }}
              skipped={phq9Skipped}
              onSkip={() => setPhq9Skipped((s) => !s)}
            />
          )}

          {step === 4 && (
            <SymptomScaleStep
              scale={GAD7}
              answers={gad7}
              onChange={(next) => {
                setGad7(next);
                if (gad7Skipped) setGad7Skipped(false);
              }}
              skipped={gad7Skipped}
              onSkip={() => setGad7Skipped((s) => !s)}
            />
          )}

          {step === 5 && (
            <div>
              <div className="flex items-center gap-2 text-pulse-700">
                <MessageSquare className="h-5 w-5" aria-hidden />
                <h2 id="message-label" className="font-medium text-slate-800">
                  Anything for your clinician?
                </h2>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                Optional — share what&apos;s been on your mind, symptoms, or
                questions before your visit.
              </p>
              <textarea
                value={patientMessage}
                onChange={(e) => setPatientMessage(e.target.value)}
                placeholder="e.g. I've been more anxious this week and want to talk about adjusting my medication..."
                rows={5}
                aria-labelledby="message-label"
                className="mt-4 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-pulse-300 focus:outline-none focus:ring-2 focus:ring-pulse-200"
              />
              <p className="mt-2 text-xs text-slate-400">
                {patientMessage.length > 0
                  ? `${patientMessage.length} characters — your clinician will read this before your visit`
                  : "You can leave this blank if you prefer"}
              </p>
            </div>
          )}

          <div className="mt-8 flex gap-3">
            {step > 0 && (
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setStep((s) => s - 1)}
              >
                Back
              </Button>
            )}
            {step < TOTAL_STEPS - 1 ? (
              <Button className="flex-1" onClick={() => setStep((s) => s + 1)}>
                Continue
              </Button>
            ) : (
              <Button className="flex-1" onClick={handleSubmit}>
                Submit check-in
              </Button>
            )}
          </div>
          {submitError && (
            <p className="mt-4 text-sm text-rose-700" role="alert">
              {submitError}
            </p>
          )}

          <div
            className="mt-4 flex justify-center gap-1.5"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={TOTAL_STEPS}
            aria-valuenow={step + 1}
            aria-label={`Step ${step + 1} of ${TOTAL_STEPS}`}
          >
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-8 rounded-full transition-colors ${
                  i === step ? "bg-pulse-500" : "bg-slate-200"
                }`}
              />
            ))}
          </div>
        </Card>

        <div className="mt-6">
          <CrisisDisclaimer compact />
        </div>
      </div>
    </div>
  );
}
