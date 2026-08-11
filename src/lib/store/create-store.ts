"use client";

import { useSyncExternalStore } from "react";

/**
 * Generischer reaktiver Container nach dem in dieser App etablierten Muster
 * (Modul-Zustand + Listener-Set + useSyncExternalStore). Ersetzt das bisher
 * in jeder Store-Datei erneut abgeschriebene Boilerplate — Domänenlogik
 * (Mutatoren wie `addRezept`, `updateStatus` …) bleibt weiterhin in der
 * jeweiligen Feature-/Store-Datei, nur der reaktive Kern ist geteilt.
 *
 * Ein Store hält genau einen Wert (Array, Map, Set, Objekt, …). Braucht eine
 * Datei mehrere unabhängige Zustände (z. B. Tickets + Ereignisse), werden
 * mehrere `createStore`-Instanzen nebeneinander verwendet.
 */
export function createStore<T>(initial: T) {
  let state = initial;
  const listeners = new Set<() => void>();

  function emit() {
    listeners.forEach((listener) => listener());
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function get(): T {
    return state;
  }

  function set(next: T | ((prev: T) => T)) {
    state = typeof next === "function" ? (next as (prev: T) => T)(state) : next;
    emit();
  }

  function useValue(): T {
    return useSyncExternalStore(subscribe, get, get);
  }

  return { get, set, subscribe, useValue };
}
