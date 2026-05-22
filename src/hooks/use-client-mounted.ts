"use client";

import { useSyncExternalStore } from "react";

/**
 * Returns `false` during SSR + the first client render, `true` afterwards.
 * Lets components synchronously read browser-only state (localStorage,
 * window, etc.) without triggering hydration mismatches and without the
 * banned `useEffect(setState(true))` pattern.
 */
const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function useClientMounted(): boolean {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
