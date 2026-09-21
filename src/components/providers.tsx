'use client';

import type { ReactNode } from 'react';
import { MotionConfig } from 'motion/react';
import { LocaleProvider } from '@/contexts/locale-context';
import { ThemeProvider } from '@/contexts/theme-context';
import { VariantProvider } from '@/contexts/variant-context';

export function Providers({ children }: { children: ReactNode }) {
  return (
    // Visitors who ask their device for "reduce motion" get no movement from any motion animation
    // on the site (fades still play). Individual pieces, like the card flip, add their own fallback.
    <MotionConfig reducedMotion="user">
      <LocaleProvider>
        <ThemeProvider>
          <VariantProvider>{children}</VariantProvider>
        </ThemeProvider>
      </LocaleProvider>
    </MotionConfig>
  );
}
