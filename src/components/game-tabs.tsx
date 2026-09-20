'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { VISIBLE_GAMES, getActiveGame } from '@/lib/games';
import { useLocale } from '@/contexts/locale-context';

export function GameTabs() {
  const pathname = usePathname();
  const active = getActiveGame(pathname);
  const { locale } = useLocale();

  return (
    <div
      role="tablist"
      aria-label={locale === 'ko' ? '게임 선택' : 'Pick a game'}
      className="grid grid-cols-2 rounded-full p-0.5 bg-surface"
    >
      {VISIBLE_GAMES.map((game) => {
        const isActive = active === game.id;
        return (
          <Link
            key={game.id}
            href={game.path}
            role="tab"
            aria-selected={isActive}
            className={`flex flex-col items-center justify-center text-center py-2 rounded-full transition-colors ${
              isActive ? 'bg-plum text-surface' : 'text-ink-soft hover:text-ink'
            }`}
          >
            <span className="text-sm font-bold leading-tight">
              {locale === 'ko' ? game.labelKo : game.labelEn}
            </span>
            <span className="text-xs leading-tight mt-0.5">
              {locale === 'ko' ? game.labelEn : game.labelKo}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
