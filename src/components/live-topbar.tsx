'use client';

import { Moon, Sun } from 'lucide-react';
import { useLocale } from '@/contexts/locale-context';
import { useTheme } from '@/contexts/theme-context';
import { BrandBlock } from '@/components/brand-block';

/**
 * The top bar for Stage 2's standalone screens (`/host/...`, `/t/...`). These aren't part
 * of the guide, so they skip the sidebar and section nav — just the brand mark plus the
 * language and dark-mode toggles every page needs.
 */
export function LiveTopbar() {
  const { locale, setLocale } = useLocale();
  const { theme, toggleTheme } = useTheme();
  const ko = locale === 'ko';

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-hairline bg-paper px-5 py-3">
      <BrandBlock className="w-24" />
      <div className="flex items-center gap-2">
        <div className="flex gap-1.5" role="group" aria-label={ko ? '언어' : 'Language'}>
          {(['en', 'ko'] as const).map((l) => (
            <button
              key={l}
              type="button"
              className="club-chip"
              aria-pressed={locale === l}
              onClick={() => setLocale(l)}
            >
              {l === 'en' ? 'EN' : '한글'}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="club-chip"
          onClick={toggleTheme}
          aria-label={
            ko
              ? theme === 'dark'
                ? '밝게'
                : '어둡게'
              : theme === 'dark'
                ? 'Light mode'
                : 'Dark mode'
          }
        >
          {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
      </div>
    </header>
  );
}
