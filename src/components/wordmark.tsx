'use client';

import { useLocale } from '@/contexts/locale-context';

const NAME_EN = 'Club Go Stop';
const NAME_KO = '클럽 고스톱';

/**
 * The "Club Go Stop / 클럽 고스톱" wordmark. The current language goes first, in plum
 * and the display font; the other language sits under it, smaller and softer.
 *   size="lg"  hero
 *   size="sm"  header and sidebar
 */
export function Wordmark({
  size = 'sm',
  className = '',
}: {
  size?: 'lg' | 'sm';
  className?: string;
}) {
  const { locale } = useLocale();
  const [main, other] = locale === 'ko' ? [NAME_KO, NAME_EN] : [NAME_EN, NAME_KO];
  return (
    <span className={`block min-w-0 ${className}`}>
      <span
        className={`block font-display text-plum ${
          size === 'lg' ? 'text-4xl leading-none sm:text-5xl md:text-6xl' : 'text-2xl leading-tight'
        }`}
      >
        {main}
      </span>
      <span className={`block text-ink-soft ${size === 'lg' ? 'mt-3 text-lg' : 'mt-1 text-xs'}`}>
        {other}
      </span>
    </span>
  );
}
