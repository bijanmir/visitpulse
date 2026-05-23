import { toDayKey } from "@/lib/date-utils";
import { normalizeDiagnoses } from "@/lib/diagnosis";
import { newCheckInToken, newMedEventId, newPatientId } from "@/lib/ids";
import { initials } from "@/lib/utils";
import type {
  Diagnosis,
  MedEvent,
  Patient,
  RiskLevel,
} from "@/modules/clinical/types";

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
  name: "Dr. Sebastian Mirvan",
  practice: "Sebi Psychiatry",
  specialty: "Adult Psychiatry",
  email: "sebastian@sdpsychiatry.demo",
};

/**
 * Every prior shipped value of `DEFAULT_PROFILE`. When `read()` finds a
 * stored profile that EXACTLY matches one of these, it treats the profile
 * as "never edited by the user" and replaces it with the current
 * DEFAULT_PROFILE. Without this, anyone who logged in on an older build
 * gets stuck with the stale email/practice forever (the localStorage
 * snapshot would override the new default).
 *
 * Maintenance contract: any time you change DEFAULT_PROFILE, append the
 * old value to this array. User-edited profiles (which won't exactly
 * match any entry) are untouched.
 */
const PRIOR_DEFAULT_PROFILES: readonly ClinicianProfile[] = [
  {
    id: "clin-1",
    name: "Dr. Elena Vasquez",
    practice: "Harbor Psychiatry",
    specialty: "Adult Psychiatry",
    email: "elena@harborpsychiatry.demo",
  },
];

function isPriorDefaultProfile(p: unknown): boolean {
  if (!p || typeof p !== "object") return false;
  return PRIOR_DEFAULT_PROFILES.some(
    (prior) =>
      (p as ClinicianProfile).id === prior.id &&
      (p as ClinicianProfile).name === prior.name &&
      (p as ClinicianProfile).practice === prior.practice &&
      (p as ClinicianProfile).specialty === prior.specialty &&
      (p as ClinicianProfile).email === prior.email,
  );
}

export function defaultPatients(): Patient[] {
  const now = Date.now();
  const day = (n: number) => new Date(now - n * 24 * 60 * 60 * 1000).toISOString();
  return [
    {
      id: "pt-1",
      displayName: "Jordan M.",
      age: 34,
      diagnoses: [
        { code: "F33.1", description: "Major depressive disorder, recurrent, moderate" },
      ],
      nextVisitAt: new Date(now + 2 * 60 * 60 * 1000).toISOString(),
      riskLevel: "moderate",
      checkInToken: "demo-jordan",
      // Story: real improvement on Venlafaxine over 5 months.
      scales: [
        { type: "phq9", score: 18, maxScore: 27, recordedAt: day(150) },
        { type: "phq9", score: 17, maxScore: 27, recordedAt: day(120) },
        { type: "phq9", score: 16, maxScore: 27, recordedAt: day(90) },
        { type: "phq9", score: 14, maxScore: 27, recordedAt: day(60) },
        { type: "phq9", score: 13, maxScore: 27, recordedAt: day(30) },
        { type: "phq9", score: 11, maxScore: 27, recordedAt: day(14) },
        { type: "phq9", score: 11, maxScore: 27, recordedAt: day(2) },
        { type: "gad7", score: 13, maxScore: 21, recordedAt: day(150) },
        { type: "gad7", score: 12, maxScore: 21, recordedAt: day(120) },
        { type: "gad7", score: 11, maxScore: 21, recordedAt: day(90) },
        { type: "gad7", score: 10, maxScore: 21, recordedAt: day(60) },
        { type: "gad7", score: 10, maxScore: 21, recordedAt: day(30) },
        { type: "gad7", score: 8, maxScore: 21, recordedAt: day(14) },
        { type: "gad7", score: 8, maxScore: 21, recordedAt: day(2) },
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
      diagnoses: [
        { code: "F31.81", description: "Bipolar II disorder" },
        { code: "F41.1", description: "Generalized anxiety disorder" },
      ],
      nextVisitAt: new Date(now + 4 * 60 * 60 * 1000).toISOString(),
      riskLevel: "low",
      checkInToken: "demo-alex",
      // Story: stable mild range, well-controlled on Lamotrigine + Lurasidone.
      scales: [
        { type: "phq9", score: 8, maxScore: 27, recordedAt: day(140) },
        { type: "phq9", score: 7, maxScore: 27, recordedAt: day(110) },
        { type: "phq9", score: 6, maxScore: 27, recordedAt: day(80) },
        { type: "phq9", score: 6, maxScore: 27, recordedAt: day(50) },
        { type: "phq9", score: 5, maxScore: 27, recordedAt: day(20) },
        { type: "phq9", score: 6, maxScore: 27, recordedAt: day(3) },
        { type: "gad7", score: 6, maxScore: 21, recordedAt: day(140) },
        { type: "gad7", score: 5, maxScore: 21, recordedAt: day(110) },
        { type: "gad7", score: 5, maxScore: 21, recordedAt: day(80) },
        { type: "gad7", score: 4, maxScore: 21, recordedAt: day(50) },
        { type: "gad7", score: 4, maxScore: 21, recordedAt: day(20) },
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
      diagnoses: [
        { code: "F41.1", description: "Generalized anxiety disorder" },
        { code: "F43.10", description: "Post-traumatic stress disorder, unspecified" },
      ],
      nextVisitAt: new Date(now + 26 * 60 * 60 * 1000).toISOString(),
      riskLevel: "elevated",
      checkInToken: "demo-sam",
      // Story: worsening trend in the last ~3 weeks — coincides with
      // Escitalopram stop and Buspirone start (see DEFAULT_MED_EVENTS).
      scales: [
        { type: "phq9", score: 9, maxScore: 27, recordedAt: day(130) },
        { type: "phq9", score: 10, maxScore: 27, recordedAt: day(100) },
        { type: "phq9", score: 9, maxScore: 27, recordedAt: day(70) },
        { type: "phq9", score: 11, maxScore: 27, recordedAt: day(45) },
        { type: "phq9", score: 13, maxScore: 27, recordedAt: day(20) },
        { type: "phq9", score: 14, maxScore: 27, recordedAt: day(1) },
        { type: "gad7", score: 12, maxScore: 21, recordedAt: day(130) },
        { type: "gad7", score: 13, maxScore: 21, recordedAt: day(100) },
        { type: "gad7", score: 12, maxScore: 21, recordedAt: day(70) },
        { type: "gad7", score: 14, maxScore: 21, recordedAt: day(45) },
        { type: "gad7", score: 15, maxScore: 21, recordedAt: day(20) },
        { type: "gad7", score: 16, maxScore: 21, recordedAt: day(1) },
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
      diagnoses: [
        { code: "F33.41", description: "Major depressive disorder, recurrent, in partial remission" },
      ],
      nextVisitAt: new Date(now + 48 * 60 * 60 * 1000).toISOString(),
      riskLevel: "low",
      checkInToken: "demo-morgan",
      // Story: long-term partial remission on Bupropion XL, scores stable in minimal range.
      scales: [
        { type: "phq9", score: 8, maxScore: 27, recordedAt: day(140) },
        { type: "phq9", score: 6, maxScore: 27, recordedAt: day(110) },
        { type: "phq9", score: 6, maxScore: 27, recordedAt: day(80) },
        { type: "phq9", score: 5, maxScore: 27, recordedAt: day(50) },
        { type: "phq9", score: 5, maxScore: 27, recordedAt: day(20) },
        { type: "phq9", score: 5, maxScore: 27, recordedAt: day(5) },
        { type: "gad7", score: 4, maxScore: 21, recordedAt: day(140) },
        { type: "gad7", score: 3, maxScore: 21, recordedAt: day(110) },
        { type: "gad7", score: 3, maxScore: 21, recordedAt: day(80) },
        { type: "gad7", score: 3, maxScore: 21, recordedAt: day(50) },
        { type: "gad7", score: 3, maxScore: 21, recordedAt: day(20) },
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

function normalizePatient(p: unknown): Patient | null {
  if (!p || typeof p !== "object") return null;
  const r = p as Record<string, unknown> & { diagnosis?: unknown };
  if (typeof r.id !== "string" || typeof r.displayName !== "string") return null;
  // `diagnoses` is the current shape; `diagnosis` (string) is legacy.
  const diagnoses = normalizeDiagnoses(r.diagnoses ?? r.diagnosis);
  return {
    id: r.id,
    displayName: r.displayName,
    age: typeof r.age === "number" ? r.age : 0,
    diagnoses,
    nextVisitAt: typeof r.nextVisitAt === "string" ? r.nextVisitAt : new Date().toISOString(),
    riskLevel: (r.riskLevel as Patient["riskLevel"]) ?? "low",
    checkInToken: typeof r.checkInToken === "string" ? r.checkInToken : "",
    scales: Array.isArray(r.scales) ? (r.scales as Patient["scales"]) : [],
    checkIns: Array.isArray(r.checkIns) ? (r.checkIns as Patient["checkIns"]) : [],
  };
}

function read(): PracticeData {
  if (typeof window === "undefined") return defaultData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData();
    const parsed = JSON.parse(raw) as Partial<PracticeData> & {
      customPatients?: unknown[];
    };
    const customPatients = Array.isArray(parsed.customPatients)
      ? parsed.customPatients
          .map(normalizePatient)
          .filter((p): p is Patient => p !== null)
      : [];
    // If the stored profile exactly matches a previously-shipped default,
    // the user never edited it — drop their stored profile so the current
    // DEFAULT_PROFILE wins. Also reset the auth.email so the login form
    // pre-fill matches what login() will compare against.
    const profileWasStaleDefault = isPriorDefaultProfile(parsed.profile);
    const profile = profileWasStaleDefault ? DEFAULT_PROFILE : parsed.profile;
    const auth = profileWasStaleDefault
      ? { ...defaultData().auth, ...parsed.auth, email: DEFAULT_PROFILE.email }
      : parsed.auth;
    return {
      ...defaultData(),
      ...parsed,
      ...(profile ? { profile } : {}),
      ...(auth ? { auth } : {}),
      customPatients,
      noteExport: { ...defaultData().noteExport, ...parsed.noteExport },
    };
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
  // Clear PHI from the browser. Profile + auth shell are kept so the user can
  // sign back in, but custom patients, custom med events, and check-in
  // submissions stored in the browser are wiped.
  const data = read();
  data.auth.isAuthenticated = false;
  data.customPatients = [];
  data.customMedEvents = {};
  write(data);
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("visitpulse-check-ins");
      // Also clear any in-progress patient check-in drafts.
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith("visitpulse-checkin-draft:")) {
          localStorage.removeItem(key);
        }
      }
    } catch {
      // ignore
    }
  }
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
  write(data);
}

export function getPatients(): Patient[] {
  const data = read();
  // `removedPatientIds` hides seed patients the user has deleted. It must NOT
  // filter `customPatients` — when a seed is edited we push the new version
  // into custom and rely on the map merge below to make it win.
  const defaults = defaultPatients().filter(
    (p) => !data.removedPatientIds.includes(p.id),
  );
  const byId = new Map<string, Patient>();
  for (const p of defaults) byId.set(p.id, p);
  for (const p of data.customPatients) byId.set(p.id, p);
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

export type MedEventInput = Omit<MedEvent, "id" | "patientId">;

/**
 * Returns the editable working copy of a patient's med events. The first
 * edit to a seed patient's timeline copies the seed list into
 * `customMedEvents` so subsequent reads via `getMedEvents` see the override.
 */
function ensureEditableMedEvents(
  data: PracticeData,
  patientId: string,
): MedEvent[] {
  if (!data.customMedEvents[patientId]) {
    data.customMedEvents[patientId] = (DEFAULT_MED_EVENTS[patientId] ?? []).map(
      (e) => ({ ...e }),
    );
  }
  return data.customMedEvents[patientId];
}

export function addMedEvent(
  patientId: string,
  input: MedEventInput,
): MedEvent {
  const data = read();
  const list = ensureEditableMedEvents(data, patientId);
  const event: MedEvent = { ...input, id: newMedEventId(), patientId };
  list.push(event);
  write(data);
  return event;
}

export function updateMedEvent(
  patientId: string,
  eventId: string,
  patch: Partial<MedEventInput>,
): MedEvent | undefined {
  const data = read();
  const list = ensureEditableMedEvents(data, patientId);
  const idx = list.findIndex((e) => e.id === eventId);
  if (idx === -1) return undefined;
  const updated: MedEvent = { ...list[idx], ...patch };
  list[idx] = updated;
  write(data);
  return updated;
}

export function removeMedEvent(patientId: string, eventId: string): void {
  const data = read();
  const list = ensureEditableMedEvents(data, patientId);
  data.customMedEvents[patientId] = list.filter((e) => e.id !== eventId);
  write(data);
}

export function getPatientsForDay(
  dayKey: string,
  patients?: Patient[],
): Patient[] {
  return (patients ?? getPatients())
    .filter((p) => toDayKey(p.nextVisitAt) === dayKey)
    .sort(
      (a, b) =>
        new Date(a.nextVisitAt).getTime() - new Date(b.nextVisitAt).getTime(),
    );
}

export type NewPatientInput = {
  displayName: string;
  age: number;
  diagnoses: Diagnosis[];
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
    id: newPatientId(),
    displayName: input.displayName,
    age: input.age,
    diagnoses: input.diagnoses,
    nextVisitAt: input.nextVisitAt,
    riskLevel: input.riskLevel,
    checkInToken: newCheckInToken(slug),
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
    // First edit to a seed patient — push override into custom. The merge in
    // getPatients() lets custom win over the seed with the same id.
    data.customPatients.push(updated);
  }
  // If a previously-removed patient is being re-saved, clear the tombstone.
  data.removedPatientIds = data.removedPatientIds.filter((rid) => rid !== id);
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
  return initials(name.replace(/^Dr\.\s*/i, ""));
}
