'use client';

import { useCallback, useSyncExternalStore } from 'react';
import type { Players } from '@/config/rules';

/**
 * How many people are at the table: 2 or 3. One choice for the whole site, kept on this phone.
 * The Go-or-Stop switch sets it and the score calculator follows it.
 * Starts at 3, because the deal and turn sections teach the 3-player game.
 */
const KEY = 'gostop:players';
const EVENT = 'gostop:players-change';
const DEFAULT: Players = 3;

// If the browser won't let us save (private window), the choice still holds until the page closes.
let inMemory: Players | null = null;

function read(): Players {
  if (inMemory) return inMemory;
  try {
    return window.localStorage.getItem(KEY) === '2' ? 2 : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

export function usePlayers() {
  // The server (and the first paint) use the default, so the page never mismatches.
  const players = useSyncExternalStore(subscribe, read, () => DEFAULT);
  const setPlayers = useCallback((next: Players) => {
    inMemory = next;
    try {
      window.localStorage.setItem(KEY, String(next));
    } catch {
      // ignore: the in-memory choice is enough
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);
  return { players, setPlayers };
}
