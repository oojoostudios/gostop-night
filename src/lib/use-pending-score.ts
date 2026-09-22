'use client';

import { useSyncExternalStore } from 'react';

/**
 * Carries the Section 04 calculator's total into Section 07's hand-entry form
 * (CLAUDE.md: "Use this score in Game Time"). A tiny module-level store rather than
 * React context, since the two sections are siblings on the same page with no shared
 * ancestor worth wiring a provider into.
 */
let pending: number | null = null;
const listeners = new Set<() => void>();

export function setPendingScore(points: number) {
  pending = points;
  listeners.forEach((l) => l());
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

export function usePendingScore() {
  const points = useSyncExternalStore(
    subscribe,
    () => pending,
    () => null,
  );
  const clear = () => {
    pending = null;
    listeners.forEach((l) => l());
  };
  return { points, clear };
}
