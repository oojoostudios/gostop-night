'use client';

import { useCallback, useMemo, useState, useSyncExternalStore } from 'react';
import { EMPTY_STATE, buildDemoState, type TonightState } from '@/lib/tonight';

/**
 * Where Tonight keeps its data: in this browser's localStorage, on whichever phone is scoring.
 * Nothing is sent anywhere, and phones don't sync.
 *
 * Demo mode (`?demo=1`, used by /showcase) never reads or writes the saved data. It runs on a
 * built-in sample night that lives only in memory.
 */
const KEY = 'gostop:tonight';
const EVENT = 'gostop:tonight-change';

// If the browser won't let us save (private window), the night still holds until the page closes.
let inMemoryRaw: string | null = null;
let cache: { raw: string | null; state: TonightState } = { raw: null, state: EMPTY_STATE };

function isState(v: unknown): v is TonightState {
  if (!v || typeof v !== 'object') return false;
  const s = v as TonightState;
  const okEvent = (e: unknown) =>
    !!e &&
    typeof e === 'object' &&
    Array.isArray((e as { players?: unknown }).players) &&
    Array.isArray((e as { log?: unknown }).log);
  return (s.active === null || okEvent(s.active)) && Array.isArray(s.past) && s.past.every(okEvent);
}

function readRaw(): string | null {
  if (inMemoryRaw !== null) return inMemoryRaw;
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

/** The saved state. Returns the same object until the saved text changes (React needs that). */
function readSaved(): TonightState {
  const raw = readRaw();
  if (raw === cache.raw) return cache.state;
  let state = EMPTY_STATE;
  if (raw) {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (isState(parsed)) state = parsed;
    } catch {
      // damaged data: start clean rather than crash
    }
  }
  cache = { raw, state };
  return state;
}

function writeSaved(state: TonightState) {
  const raw = JSON.stringify(state);
  inMemoryRaw = raw;
  try {
    window.localStorage.setItem(KEY, raw);
  } catch {
    // ignore: the in-memory copy is enough for now
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

const readNothing = () => EMPTY_STATE;

/** True once the page is running in the browser (false while the server builds the page). */
export function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function readDemoFlag() {
  return new URLSearchParams(window.location.search).get('demo') === '1';
}

/**
 * Whether the address has `?demo=1`. It is `null` until the browser has taken over from the server,
 * so nothing is read from storage before we know which mode we are in.
 */
export function useDemoFlag(): boolean | null {
  return useSyncExternalStore<boolean | null>(
    () => () => {},
    readDemoFlag,
    () => null,
  );
}

export function useTonight(demo: boolean | null) {
  // Saved data is read only once we know this is NOT demo mode.
  const saved = useSyncExternalStore(
    subscribe,
    demo === false ? readSaved : readNothing,
    () => EMPTY_STATE,
  );
  const [demoState, setDemoState] = useState<TonightState | null>(null);
  const seed = useMemo(() => (demo === true ? buildDemoState() : EMPTY_STATE), [demo]);
  const state = demo === true ? (demoState ?? seed) : saved;

  const update = useCallback(
    (change: (s: TonightState) => TonightState) => {
      if (demo === true) setDemoState((prev) => change(prev ?? seed));
      else if (demo === false) writeSaved(change(readSaved()));
    },
    [demo, seed],
  );
  return { state, update };
}
