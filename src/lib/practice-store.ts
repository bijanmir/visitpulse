import { toDayKey } from "@/lib/date-utils";
import type { MedEvent, Patient, RiskLevel } from "@/modules/clinical/types";

export type ClinicianProfile = {
  id: string;
  name: string;
  practice: string;
  specialty: string;
  email: string;
};

export type AuthState = {
  isAuthenticated: boolean;
  mfaEnabled: boolean;
  email: string;
};

export type NoteExportPrefs = {
  includeBrandPrefix: boolean;
  includeIdentifiers: boolean;
};

type PracticeData = {
  profile: ClinicianProfile;
  auth: AuthState;
  removedPatientIds: string[];
  customPatients: Patient[];
  customMedEvents: Record<string, MedEvent[]>;
  noteExport: NoteExportPrefs;
};

const STORAGE_KEY = "visitpulse-practice";
export const DEMO_MFA_CODE = "123456";
export const DEMO_PASSWORD = "demo1234";

export const DEFAULT_PROFILE: ClinicianProfile = {
  id: "clin-1",
  name: "Dr. Elena Vasquez",
  practice: "Harbor Psychiatry",
  specialty: "Adult Psychiatry",
  email: "elena@harborpsychiatry.demo",
};

export function defaultPatients(): Patient[] {
  const now = Date.now();
  const day = (n: number) => new Date(now - n * 24 * 60 * 60 * 1000).toISOString();
  return [
    {
      id: "pt-1",
      displayName: "Jordan M.",
      age: 34,
      diagnosis: "Major Depressive Disorder",
      nextVisitAt: new Date(now + 2 * 60 * 60 * 1000).toISOString(),
      riskLevel: "moderate",
      checkInToken: "demo-jordan",
      scales: [
        { type: "phq9", score: 11, maxScore: 27, recordedAt: day(2) },
        { type: "phq9", score: 15, maxScore: 27, recordedAt: day(16) },
        { type: "gad7", score: 8, maxScore: 21, recordedAt: day(2) },
        { type: "gad7", score: 12, maxScore: 21, recordedAt: day(16) },
      ],
      checkIns: [
        {
          id: "ci-1",
          patientId: "pt-1",
          recordedAt: day(1),
          sleepHours: 6.5,
          medicationAdherence: "partial",
          sideEffects: ["mild nausea"],
          safetyFlag: false,
          patientMessage: "Felt foggy in the mornings. Hard to focus at work.",
        },
        {
          id: "ci-1b",
          patientId: "pt-1",
          recordedAt: day(3),
          sleepHours: 7,
          medicationAdherence: "full",
          sideEffects: ["None"],
          safetyFlag: false,
          patientMessage: "Much better mid-week.",
        },
        {
          id: "ci-1c",
          patientId: "pt-1",
          recordedAt: day(7),
          sleepHours: 5.5,
          medicationAdherence: "partial",
          sideEffects: ["mild nausea"],
          safetyFlag: false,
        },
      ],
    },
    {
      id: "pt-2",
      displayName: "Alex R.",
      age: 41,
      diagnosis: "Bipolar II Disorder",
      nextVisitAt: new Date(now + 4 * 60 * 60 * 1000).toISOString(),
      riskLevel: "low",
      checkInToken: "demo-alex",
      scales: [
        { type: "phq9", score: 6, maxScore: 27, recordedAt: day(3) },
        { type: "gad7", score: 4, maxScore: 21, recordedAt: day(3) },
      ],
      checkIns: [
        {
          id: "ci-2",
          patientId: "pt-2",
          recordedAt: day(2),
          sleepHours: 7.5,
          medicationAdherence: "full",
          sideEffects: [],
          safetyFlag: false,
        },
        {
          id: "ci-2b",
          patientId: "pt-2",
          recordedAt: day(5),
          sleepHours: 8,
          medicationAdherence: "full",
          sideEffects: ["None"],
          safetyFlag: false,
          patientMessage: "Stable mood, no concerns.",
        },
      ],
    },
    {
      id: "pt-3",
      displayName: "Sam T.",
      age: 28,
      diagnosis: "Generalized Anxiety Disorder",
      nextVisitAt: new Date(now + 26 * 60 * 60 * 1000).toISOString(),
      riskLevel: "elevated",
      checkInToken: "demo-sam",
      scales: [
        { type: "phq9", score: 14, maxScore: 27, recordedAt: day(1) },
        { type: "phq9", score: 10, maxScore: 27, recordedAt: day(14) },
        { type: "gad7", score: 16, maxScore: 21, recordedAt: day(1) },
        { type: "gad7", score: 11, maxScore: 21, recordedAt: day(14) },
      ],
      checkIns: [
        {
          id: "ci-3",
          patientId: "pt-3",
          recordedAt: new Date(now - 12 * 60 * 60 * 1000).toISOString(),
          sleepHours: 4,
          medicationAdherence: "missed",
          sideEffects: ["restlessness"],
          safetyFlag: true,
          patientMessage:
            "Skipped lamotrigine twice this week. Anxiety has been worse — wanted you to know before our visit.",
        },
      ],
    },
    {
      id: "pt-4",
      displayName: "Morgan K.",
      age: 52,
      diagnosis: "MDD, recurrent",
      nextVisitAt: new Date(now + 48 * 60 * 60 * 1000).toISOString(),
      riskLevel: "low",
      checkInToken: "demo-morgan",
      scales: [
        { type: "phq9", score: 5, maxScore: 27, recordedAt: day(5) },
        { type: "gad7", score: 3, maxScore: 21, recordedAt: day(5) },
      ],
      checkIns: [],
    },
  ];
}

export const DEFAULT_MED_EVENTS: Record<string, MedEvent[]> = {
  "pt-1": [
    {
      id: "med-1",
      patientId: "pt-1",
      medication: "Sertraline",
      type: "start",
      dose: "50mg",
      startedAt: new Date(Date.now() - 120 * 86400000).toISOString(),
      endedAt: new Date(Date.now() - 90 * 86400000).toISOString(),
      response: "partial",
      reasonStopped: "sexual side effects",
    },
    {
      id: "med-2",
      patientId: "pt-1",
      medication: "Venlafaxine XR",
      type: "start",
      dose: "75mg",
      startedAt: new Date(Date.now() - 88 * 86400000).toISOString(),
      response: "partial",
    },
    {
      id: "med-3",
      patientId: "pt-1",
      medication: "Venlafaxine XR",
      type: "dose_change",
      dose: "150mg",
      startedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
      response: "partial",
      sideEffects: ["mild nausea"],
    },
  ],
  "pt-2": [
    {
      id: "med-4",
      patientId: "pt-2",
      medication: "Lamotrigine",
      type: "start",
      dose: "100mg",
      startedAt: new Date(Date.now() - 400 * 86400000).toISOString(),
      response: "excellent",
    },
    {
      id: "med-5",
      patientId: "pt-2",
      medication: "Lurasidone",
      type: "start",
      dose: "40mg",
      startedAt: new Date(Date.now() - 60 * 86400000).toISOString(),
      response: "partial",
    },
  ],
  "pt-3": [
    {
      id: "med-6",
      patientId: "pt-3",
      medication: "Escitalopram",
      type: "start",
      dose: "10mg",
      startedAt: new Date(Date.now() - 45 * 86400000).toISOString(),
      endedAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      response: "none",
      reasonStopped: "activation",
    },
    {
      id: "med-7",
      patientId: "pt-3",
      medication: "Buspirone",
      type: "start",
      dose: "15mg BID",
      startedAt: new Date(Date.now() - 18 * 86400000).toISOString(),
      response: "partial",
      sideEffects: ["restlessness"],
    },
  ],
  "pt-4": [
    {
      id: "med-8",
      patientId: "pt-4",
      medication: "Bupropion XL",
      type: "start",
      dose: "300mg",
      startedAt: new Date(Date.now() - 200 * 86400000).toISOString(),
      response: "excellent",
    },
  ],
};

function defaultData(): PracticeData {
  return {
    profile: DEFAULT_PROFILE,
    auth: {
      isAuthenticated: false,
      mfaEnabled: true,
      email: DEFAULT_PROFILE.email,
    },
    removedPatientIds: [],
    customPatients: [],
    customMedEvents: {},
    noteExport: {
      includeBrandPrefix: false,
      includeIdentifiers: false,
    },
  };
}

function read(): PracticeData {
  if (typeof window === "undefined") return defaultData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData();
    const parsed = JSON.parse(raw) as Partial<PracticeData>;
    return { ...defaultData(), ...parsed, noteExport: { ...defaultData().noteExport, ...parsed.noteExport } };
  } catch {
    return defaultData();
  }
}

function write(data: PracticeData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event("practice-store-update"));
}

export function subscribeStore(listener: () => void): () => void {
  const handler = () => listener();
  window.addEventListener("practice-store-update", handler);
  return () => window.removeEventListener("practice-store-update", handler);
}

export function usePracticeStoreSnapshot(): PracticeData {
  // For hook usage in components - they'll use useState+useEffect instead
  return read();
}

export function getProfile(): ClinicianProfile {
  return read().profile;
}

export function updateProfile(
  patch: Partial<Omit<ClinicianProfile, "id">>,
): ClinicianProfile {
  const data = read();
  data.profile = { ...data.profile, ...patch };
  write(data);
  return data.profile;
}

export function getAuth(): AuthState {
  return read().auth;
}

export function login(
  email: string,
  password: string,
): { ok: true; needsMfa: boolean } | { ok: false; error: string } {
  const data = read();
  const normalized = email.trim().toLowerCase();
  if (normalized !== data.profile.email.toLowerCase()) {
    return { ok: false, error: "Unknown email for this demo practice." };
  }
  if (password !== DEMO_PASSWORD) {
    return { ok: false, error: "Incorrect password. Demo password: demo1234" };
  }
  data.auth.email = normalized;
  if (data.auth.mfaEnabled) {
    write(data);
    return { ok: true, needsMfa: true };
  }
  data.auth.isAuthenticated = true;
  write(data);
  return { ok: true, needsMfa: false };
}

export function verifyMfa(code: string): boolean {
  const data = read();
  if (code.trim() !== DEMO_MFA_CODE) return false;
  data.auth.isAuthenticated = true;
  write(data);
  return true;
}

export function logout(): void {
  const data = read();
  data.auth.isAuthenticated = false;
  write(data);
}

export function getNoteExportPrefs(): NoteExportPrefs {
  return read().noteExport ?? defaultData().noteExport;
}

export function updateNoteExportPrefs(
  patch: Partial<NoteExportPrefs>,
): NoteExportPrefs {
  const data = read();
  data.noteExport = { ...data.noteExport, ...patch };
  write(data);
  return data.noteExport;
}

export function setMfaEnabled(enabled: boolean): void {
  const data = read();
  data.auth.mfaEnabled = enabled;
  if (!enabled) data.auth.isAuthenticated = data.auth.isAuthenticated;
  write(data);
}

export function getPatients(): Patient[] {
  const data = read();
  const defaults = defaultPatients().filter(
    (p) => !data.removedPatientIds.includes(p.id),
  );
  const custom = data.customPatients.filter(
    (p) => !data.removedPatientIds.includes(p.id),
  );
  const byId = new Map<string, Patient>();
  for (const p of defaults) byId.set(p.id, p);
  for (const p of custom) byId.set(p.id, p);
  return Array.from(byId.values());
}

export function getPatient(id: string): Patient | undefined {
  return getPatients().find((p) => p.id === id);
}

export function getPatientByToken(token: string): Patient | undefined {
  return getPatients().find((p) => p.checkInToken === token);
}

export function getMedEvents(patientId: string): MedEvent[] {
  const data = read();
  return (
    data.customMedEvents[patientId] ??
    DEFAULT_MED_EVENTS[patientId] ??
    []
  );
}

export function getPatientsForDay(dayKey: string): Patient[] {
  return getPatients()
    .filter((p) => toDayKey(p.nextVisitAt) === dayKey)
    .sort(
      (a, b) =>
        new Date(a.nextVisitAt).getTime() - new Date(b.nextVisitAt).getTime(),
    );
}

export type NewPatientInput = {
  displayName: string;
  age: number;
  diagnosis: string;
  riskLevel: RiskLevel;
  nextVisitAt: string;
};

export function addPatient(input: NewPatientInput): Patient {
  const data = read();
  const slug = input.displayName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 20);
  const patient: Patient = {
    id: `pt-${Date.now()}`,
    displayName: input.displayName,
    age: input.age,
    diagnosis: input.diagnosis,
    nextVisitAt: input.nextVisitAt,
    riskLevel: input.riskLevel,
    checkInToken: `checkin-${slug}-${Math.random().toString(36).slice(2, 7)}`,
    scales: [],
    checkIns: [],
  };
  data.customPatients.push(patient);
  data.customMedEvents[patient.id] = [];
  write(data);
  return patient;
}

export function updatePatient(
  id: string,
  patch: Partial<NewPatientInput>,
): Patient | undefined {
  const data = read();
  const list = getPatients();
  const existing = list.find((p) => p.id === id);
  if (!existing) return undefined;

  const updated = { ...existing, ...patch };
  if (data.customPatients.some((p) => p.id === id)) {
    data.customPatients = data.customPatients.map((p) =>
      p.id === id ? updated : p,
    );
  } else {
    data.removedPatientIds.push(id);
    data.customPatients.push(updated);
  }
  write(data);
  return updated;
}

export function removePatient(id: string): void {
  const data = read();
  if (!data.removedPatientIds.includes(id)) {
    data.removedPatientIds.push(id);
  }
  data.customPatients = data.customPatients.filter((p) => p.id !== id);
  write(data);
}

export function getProfileInitials(name: string): string {
  return name
    .replace(/^Dr\.\s*/i, "")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
