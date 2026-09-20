'use client';

import { useLocale, type Locale } from '@/contexts/locale-context';
import { cardCaption, type HwatuCard } from '@/lib/hwatu';

/**
 * The 3-line caption shown wherever a card image is large enough to carry one.
 * All text comes from `cardCaption()` in hwatu.ts. Pass `locale` to force a
 * language (used by /cardcheck to show both); otherwise it follows the toggle.
 */
export function CardCaption({
  card,
  locale: forcedLocale,
  compact,
  className = '',
}: {
  card: HwatuCard;
  locale?: Locale;
  /** Smaller text for captions under small cards. */
  compact?: boolean;
  className?: string;
}) {
  const { locale: siteLocale } = useLocale();
  const { line1, line2, line3 } = cardCaption(card, forcedLocale ?? siteLocale);
  return (
    <div className={`leading-snug ${className}`}>
      <div
        className={`tabular-nums text-foreground/55 ${compact ? 'text-[10px] font-semibold' : 'text-xs'}`}
      >
        {line1}
      </div>
      <div className={`font-medium ${compact ? 'text-[10px]' : 'text-base'}`}>{line2}</div>
      <div className={`text-foreground/60 ${compact ? 'text-[10px]' : 'text-sm'}`}>{line3}</div>
    </div>
  );
}
