'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * "Which player at this table is this phone?" Asked once per table, per phone, then
 * remembered in localStorage — there's no login, so this is the only place that identity
 * lives. `mounted` is false until the browser has had a chance to read it, so the identify
 * screen doesn't flash before the saved choice loads.
 */
export function useLocalPlayer(tableCode: string) {
  const key = `gostop:live:whoami:${tableCode}`;
  const [playerId, setPlayerIdState] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      setPlayerIdState(window.localStorage.getItem(key));
    } catch {
      // localStorage unavailable (e.g. private browsing); ask again this session
    }
    setMounted(true);
  }, [key]);

  const setPlayerId = useCallback(
    (id: string) => {
      setPlayerIdState(id);
      try {
        window.localStorage.setItem(key, id);
      } catch {
        // ignore: the in-memory choice still works for this session
      }
    },
    [key],
  );

  return { playerId, setPlayerId, mounted };
}
