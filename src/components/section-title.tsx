'use client';

import { useLocale } from '@/contexts/locale-context';
import { FadeInOnView } from '@/components/fade-in-on-view';
import type { Section } from '@/lib/sections';

/**
 * Every section's title: the number in `plum`, the current language's label, and the
 * other language's label as a line underneath (sub-heading size). Reads from `sections.ts`
 * so this can never say something different from the sidebar link to the same section.
 */
export function SectionTitle({ section, delay = 0.05 }: { section: Section; delay?: number }) {
  const { locale } = useLocale();
  const [main, sub] =
    locale === 'ko' ? [section.labelKo, section.label] : [section.label, section.labelKo];
  return (
    <FadeInOnView as="h2" delay={delay} className="mb-6 font-display text-title leading-tight">
      <span className="text-plum">{section.num}</span>
      <span className="ml-4">{main}</span>
      <span className="mt-1 block text-sub text-ink-soft">{sub}</span>
    </FadeInOnView>
  );
}
