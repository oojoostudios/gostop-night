/**
 * The card back: the real back image at /cards/back.webp, filling its
 * container the same way HwatuCardImage does. The caller controls size and
 * motion through the wrapper.
 */

'use client';

import { useLocale } from '@/contexts/locale-context';

type Props = {
  className?: string;
  ariaLabel?: string;
};

export function HwatuCardBack({ className, ariaLabel }: Props) {
  const { locale } = useLocale();
  const label = ariaLabel ?? (locale === 'ko' ? '카드 뒷면' : 'Card back');
  return (
    <img
      src="/cards/back.webp"
      alt={label}
      className={`${className ?? ''} object-cover`.trim()}
      loading="lazy"
      decoding="async"
      draggable={false}
    />
  );
}
