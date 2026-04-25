"use client";

import { useLocale } from "@/contexts/locale-context";

export function Hero() {
  const { locale } = useLocale();
  return (
    <section className="min-h-screen flex flex-col justify-center py-24">
      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6">
        {locale === "ko" ? "비주얼 가이드" : "A visual guide"}
      </div>
      <h1 className="text-6xl md:text-7xl font-semibold tracking-tight leading-[1.05] mb-8">
        {locale === "ko" ? (
          <>
            고스톱
            <br />
            <span className="text-muted-foreground">Go-Stop</span>
          </>
        ) : (
          <>
            Go-Stop
            <br />
            <span className="text-muted-foreground">고스톱</span>
          </>
        )}
      </h1>
      <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
        {locale === "ko"
          ? "한국 사람들이 명절마다 둘러앉아 치는 화투 게임. 5분만에 룰을 익혀보세요."
          : "The Korean card game families gather around during holidays. Learn the rules in five minutes."}
      </p>
    </section>
  );
}
