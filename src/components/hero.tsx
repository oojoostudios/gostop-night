"use client";

import { useLocale } from "@/contexts/locale-context";

export function Hero({
  titleKo,
  titleEn,
  blurbKo,
  blurbEn,
}: {
  titleKo: string;
  titleEn: string;
  blurbKo: string;
  blurbEn: string;
}) {
  const { locale } = useLocale();
  return (
    <section className="min-h-screen flex flex-col justify-center py-24">
      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6">
        {locale === "ko" ? "비주얼 가이드" : "A visual guide"}
      </div>
      <h1 className="text-6xl md:text-7xl font-semibold tracking-tight leading-[1.05] mb-8">
        {locale === "ko" ? (
          <>
            {titleKo}
            <br />
            <span className="text-muted-foreground">{titleEn}</span>
          </>
        ) : (
          <>
            {titleEn}
            <br />
            <span className="text-muted-foreground">{titleKo}</span>
          </>
        )}
      </h1>
      <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
        {locale === "ko" ? blurbKo : blurbEn}
      </p>
    </section>
  );
}
