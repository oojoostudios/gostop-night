'use client';

import type { ReactNode } from 'react';
import { MotionConfig } from 'motion/react';
import { I18nProvider } from '@heroui/react';
import { LocaleProvider, useLocale } from '@/contexts/locale-context';
import { ThemeProvider } from '@/contexts/theme-context';
import { VariantProvider } from '@/contexts/variant-context';

/** Gives the UI library the site's language, so its built-in labels (Dismiss, Close...) match the toggle. */
function LibraryLocale({ children }: { children: ReactNode }) {
  const { locale } = useLocale();
  return <I18nProvider locale={locale === 'ko' ? 'ko-KR' : 'en-US'}>{children}</I18nProvider>;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    // Visitors who ask their device for "reduce motion" get no movement from any motion animation
    // on the site (fades still play). Individual pieces, like the card flip, add their own fallback.
    <MotionConfig reducedMotion="user">
      <LocaleProvider>
        <LibraryLocale>
          <ThemeProvider>
            <VariantProvider>{children}</VariantProvider>
          </ThemeProvider>
        </LibraryLocale>
      </LocaleProvider>
    </MotionConfig>
  );
}
