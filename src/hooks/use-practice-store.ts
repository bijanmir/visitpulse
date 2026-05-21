"use client";

import {
  subscribeStore,
  usePracticeStoreSnapshot,
  type AuthState,
  type ClinicianProfile,
} from "@/lib/practice-store";
import type { Patient } from "@/modules/clinical/types";
import { getPatients } from "@/lib/practice-store";
import { useCallback, useEffect, useState } from "react";

export function usePracticeStore() {
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => subscribeStore(refresh), [refresh]);

  void tick;
  const snapshot = usePracticeStoreSnapshot();

  return {
    profile: snapshot.profile,
    auth: snapshot.auth,
    noteExport: snapshot.noteExport ?? {
      includeBrandPrefix: false,
      includeIdentifiers: false,
    },
    patients: getPatients(),
    refresh,
  };
}

export function useProfile(): ClinicianProfile {
  return usePracticeStore().profile;
}

export function useAuth(): AuthState {
  return usePracticeStore().auth;
}

export function usePatients(): Patient[] {
  return usePracticeStore().patients;
}
