"use client";

import { useLocale } from "@/contexts/locale-context";
import type { Section } from "@/lib/sections";

export function SectionPlaceholder({ section }: { section: Section }) {
  const { locale } = useLocale();
  return (
    <section
      id={section.id}
      className="min-h-screen flex flex-col justify-center py-24 border-t border-border"
    >
      <div className="text-xs tabular-nums text-muted-foreground mb-4">
        {section.num}
      </div>
      <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6">
        {locale === "ko" ? section.labelKo : section.label}
      </h2>
      <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
        {locale === "ko" ? section.blurbKo : section.blurb}
      </p>
      <div className="mt-12 p-8 rounded-lg border border-dashed border-border text-sm text-muted-foreground italic">
        {locale === "ko"
          ? "여기에 인터랙티브 콘텐츠가 들어갈 자리예요."
          : "Interactive content will live here."}
      </div>
    </section>
  );
}
