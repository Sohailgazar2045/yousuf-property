"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "ypa:shortlist:v1";
const EMPTY: string[] = [];

let cache: string[] | null = null;
const listeners = new Set<() => void>();

function read(): string[] {
  if (cache) return cache;
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    cache = Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    // Private mode or blocked storage: the shortlist still works for this visit.
    cache = [];
  }
  return cache;
}

function write(ids: string[]) {
  cache = ids;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* storage unavailable, keep the in-memory copy */
  }
  listeners.forEach((notify) => notify());
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    cache = null;
    notify();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(notify);
    window.removeEventListener("storage", onStorage);
  };
}

const noopSubscribe = () => () => {};

/** Saved listing IDs, persisted per device and kept in sync across tabs. */
export function useShortlist() {
  const ids = useSyncExternalStore(subscribe, read, () => EMPTY);
  // False during server render and hydration, before localStorage can be read.
  const ready = useSyncExternalStore(noopSubscribe, () => true, () => false);

  const toggle = useCallback((id: string) => {
    const current = read();
    write(current.includes(id) ? current.filter((x) => x !== id) : [id, ...current]);
  }, []);

  const clear = useCallback(() => write([]), []);

  return { ids, ready, has: (id: string) => ids.includes(id), toggle, clear };
}
