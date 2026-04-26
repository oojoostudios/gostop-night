"use client";

import { motion } from "motion/react";
import { useLocale } from "@/contexts/locale-context";

const EASE = [0.32, 0.72, 0, 1] as const;

function StaggeredWords({
  text,
  className,
  baseDelay = 0,
  wordDelay = 0.08,
}: {
  text: string;
  className?: string;
  baseDelay?: number;
  wordDelay?: number;
}) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          className="inline-block"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: baseDelay + i * wordDelay,
            duration: 0.55,
            ease: EASE,
          }}
        >
          {word}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </span>
  );
}

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
  const primaryTitle = locale === "ko" ? titleKo : titleEn;
  const secondaryTitle = locale === "ko" ? titleEn : titleKo;
  const blurb = locale === "ko" ? blurbKo : blurbEn;
  const eyebrow = locale === "ko" ? "비주얼 가이드" : "A visual guide";

  // re-key on locale to retrigger the stagger when language changes
  const animKey = `${locale}-${primaryTitle}`;

  return (
    <section className="relative min-h-screen flex flex-col justify-center py-24 overflow-hidden">
      {/* Floating ambient shapes */}
      <FloatingShapes />

      <motion.div
        key={`eyebrow-${animKey}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6 relative z-10 flex items-center gap-2"
      >
        <span
          className="live-dot size-1.5 rounded-full bg-rose-500/70 text-rose-500/70"
          aria-hidden
        />
        {eyebrow}
      </motion.div>

      <h1
        key={`title-${animKey}`}
        className="text-6xl md:text-7xl font-semibold tracking-tight leading-[1.05] mb-8 relative z-10"
      >
        <StaggeredWords text={primaryTitle} baseDelay={0.1} />
        <br />
        <StaggeredWords
          text={secondaryTitle}
          className="text-muted-foreground"
          baseDelay={0.1 + primaryTitle.split(" ").length * 0.08}
        />
      </h1>

      <motion.p
        key={`blurb-${animKey}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay:
            0.1 +
            (primaryTitle.split(" ").length +
              secondaryTitle.split(" ").length) *
              0.08,
          duration: 0.6,
          ease: EASE,
        }}
        className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed relative z-10"
      >
        {blurb}
      </motion.p>
    </section>
  );
}

function FloatingShapes() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <motion.div
        className="absolute -top-20 -right-20 size-[480px] rounded-full bg-amber-500/[0.05] blur-3xl"
        animate={{ y: [0, -24, 0], x: [0, 12, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 -left-32 size-[420px] rounded-full bg-rose-500/[0.04] blur-3xl"
        animate={{ y: [0, 20, 0], x: [0, -16, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute bottom-0 right-1/4 size-[360px] rounded-full bg-emerald-500/[0.03] blur-3xl"
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
    </div>
  );
}
