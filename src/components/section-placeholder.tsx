'use client';

import { useLocale } from '@/contexts/locale-context';
import type { Section } from '@/lib/sections';

export function SectionPlaceholder({ section }: { section: Section }) {
  const { locale } = useLocale();
  return (
    <section
      id={section.id}
      className="relative min-h-screen flex flex-col justify-center py-24 border-t border-hairline"
    >
      <div className="lg:ml-72">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-16">
          <div className="text-xs tabular-nums text-ink-soft mb-4">{section.num}</div>
          <h2 className="font-display text-4xl md:text-5xl mb-6">
            {locale === 'ko' ? section.labelKo : section.label}
          </h2>
          <p className="text-lg text-ink-soft max-w-[65ch] leading-relaxed">
            {locale === 'ko' ? section.blurbKo : section.blurb}
          </p>
          <div className="club-card mt-12 p-8 text-sm text-ink-soft">
            {locale === 'ko'
              ? '여기에 인터랙티브 콘텐츠가 들어갈 자리예요.'
              : 'Interactive content will live here.'}
          </div>
        </div>
      </div>
    </section>
  );
}
