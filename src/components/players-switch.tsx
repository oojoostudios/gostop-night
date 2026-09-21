'use client';

import { useLocale } from '@/contexts/locale-context';
import { usePlayers } from '@/lib/use-players';
import type { Players } from '@/config/rules';

const OPTIONS: ReadonlyArray<{ players: Players; en: string; ko: string }> = [
  { players: 2, en: '2 players', ko: '2인' },
  { players: 3, en: '3 players', ko: '3인' },
];

/** The 2-player / 3-player switch. It sets the site-wide player count (see usePlayers). */
export function PlayersSwitch() {
  const { locale } = useLocale();
  const { players, setPlayers } = usePlayers();
  return (
    <div
      className="flex flex-wrap gap-2.5"
      role="group"
      aria-label={locale === 'ko' ? '테이블 인원' : 'Players at the table'}
    >
      {OPTIONS.map((o) => (
        <button
          key={o.players}
          type="button"
          className="club-chip"
          aria-pressed={players === o.players}
          onClick={() => setPlayers(o.players)}
        >
          {locale === 'ko' ? o.ko : o.en}
        </button>
      ))}
    </div>
  );
}
