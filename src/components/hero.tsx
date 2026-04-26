"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useLocale } from "@/contexts/locale-context";
import { HwatuCardImage } from "@/components/hwatu-card-image";

const EASE = [0.32, 0.72, 0, 1] as const;

const STATS = [
  { num: "48", labelKo: "장의 화투 카드", labelEn: "cards in a deck" },
  { num: "12", labelKo: "달 × 4장", labelEn: "months × 4 cards" },
  { num: "4", labelKo: "종류 (광·띠·끗·피)", labelEn: "types (광·띠·끗·피)" },
  { num: "7", labelKo: "점에서 고/스톱", labelEn: "points to call go/stop" },
] as const;

// Cards used for the right-side fan sigil
const FAN_CARDS = [
  "/cards/cell-r5-c4.png", // 12월 비광
  "/cards/cell-r4-c4.png", // 11월 오동광
  "/cards/cell-r3-c4.png", // 10월 사슴
  "/cards/cell-r2-c0.png", // 3월 벚꽃광
  "/cards/cell-r1-c4.png", // 8월 공산광
  "/cards/cell-r0-c0.png", // 1월 송학광
  "/cards/cell-r0-c4.png", // 7월 멧돼지
] as const;

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
  const blurb = locale === "ko" ? blurbKo : blurbEn;
  // We re-key on locale to retrigger the stagger when language changes
  const animKey = `${locale}`;

  // Title parts (kept short — Mahjong style: "Learn *mahjong* / A visual guide")
  const eyebrowMain =
    locale === "ko" ? "한국식 화투 게임" : "Korean hwatu rules";
  const eyebrowAccent = "고스톱 · 화투";
  const learn = locale === "ko" ? "고스톱을 배워봐요" : "Learn";
  const accentWord = locale === "ko" ? "" : "go-stop";
  const subhead = locale === "ko" ? "비주얼 가이드" : "A visual guide";
  const sigil = "화 투";
  void titleKo;
  void titleEn;

  return (
    <section className="relative min-h-screen flex flex-col justify-center py-20 overflow-hidden">
      <FloatingShapes />

      <div className="lg:ml-72 relative z-10 w-full">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-16 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 lg:gap-16 items-center">
        {/* LEFT — title block */}
        <div className="max-w-2xl">
          <motion.div
            key={`eyebrow-${animKey}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="text-xs uppercase tracking-[0.2em] text-foreground/55 mb-6 flex items-center gap-2 flex-wrap"
          >
            <span
              className="live-dot size-1.5 rounded-full bg-rose-500/70 text-rose-500/70"
              aria-hidden
            />
            <span>{eyebrowMain}</span>
            <span className="text-foreground/30">·</span>
            <span className="font-[var(--font-accent)] not-italic text-sm tracking-normal text-foreground/70">
              {eyebrowAccent}
            </span>
          </motion.div>

          <motion.h1
            key={`title-${animKey}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.55, ease: EASE }}
            className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight leading-[1.05] mb-3"
          >
            {locale === "ko" ? (
              <>
                <span>고스톱을 </span>
                <span
                  className="italic font-normal text-rose-700 dark:text-rose-400"
                  style={{ fontFamily: "var(--font-accent)" }}
                >
                  배워봐요
                </span>
              </>
            ) : (
              <>
                <span>{learn} </span>
                <span
                  className="italic font-normal text-rose-700 dark:text-rose-400"
                  style={{ fontFamily: "var(--font-accent)" }}
                >
                  {accentWord}
                </span>
              </>
            )}
          </motion.h1>

          <motion.div
            key={`subhead-${animKey}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.55, ease: EASE }}
            className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight leading-[1.05] text-foreground/45 mb-7"
          >
            <span
              className="italic font-normal"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              {subhead}
            </span>
            <span className="ml-3 text-foreground/55 not-italic text-2xl sm:text-3xl md:text-4xl tracking-tight">
              {sigil}
            </span>
          </motion.div>

          <motion.p
            key={`blurb-${animKey}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.55, ease: EASE }}
            className="text-base md:text-lg text-foreground/70 max-w-xl leading-relaxed mb-10"
          >
            {blurb}
          </motion.p>

          <StatsRow locale={locale} />
        </div>

        {/* RIGHT — fan sigil */}
        <CardFan />
        </div>
      </div>
    </section>
  );
}

function StatsRow({ locale }: { locale: "ko" | "en" }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.08, delayChildren: 0.45 } },
      }}
      className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4 max-w-xl"
    >
      {STATS.map((s) => (
        <motion.div
          key={s.num}
          variants={{
            hidden: { opacity: 0, y: 8 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.4, ease: EASE }}
          className="border-l-2 border-foreground/15 pl-3"
        >
          <div className="text-3xl md:text-4xl font-semibold tabular-nums tracking-tight leading-none">
            {s.num}
          </div>
          <div className="text-[11px] sm:text-xs text-foreground/55 mt-1.5 leading-snug">
            {locale === "ko" ? s.labelKo : s.labelEn}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

function CardFan() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const total = FAN_CARDS.length;
  const middle = (total - 1) / 2;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, rotate: -6 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ delay: 0.25, duration: 0.7, ease: EASE }}
      className="relative hidden lg:block w-[420px] h-[420px] shrink-0"
      aria-hidden
    >
      {/* Concentric ambient rings — decorative, must not block card hover */}
      <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-amber-500/[0.06] via-rose-500/[0.04] to-transparent blur-2xl" />

      {/* Slow rotation halo — rendered UNDER cards, pointer-events-none */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="pointer-events-none absolute inset-8 rounded-full border border-dashed border-foreground/10"
      />

      {FAN_CARDS.map((src, i) => {
        // Fan geometry — each card rotated around its bottom anchor
        const angle = (i - middle) * 14; // degrees
        const distance = 120; // px from center
        const rad = (angle * Math.PI) / 180;
        const x = Math.sin(rad) * distance;
        const y = -Math.cos(rad) * distance + 40;
        // Middle cards visually on top of edges, like a real hand
        const baseZ = 10 + Math.round(10 - Math.abs(i - middle) * 2);

        const isHovered = hoveredIdx === i;
        // Adjacent cards yield gently — like fingers parting cards in a real fan.
        // Tiny x nudge only; no rotation change (looks unnatural on a fan).
        const isAdjacent =
          hoveredIdx !== null && Math.abs(hoveredIdx - i) === 1;
        const adjacentNudge = isAdjacent
          ? Math.sign(i - (hoveredIdx as number)) * 7
          : 0;

        return (
          <motion.div
            key={src}
            onHoverStart={() => setHoveredIdx(i)}
            onHoverEnd={() => setHoveredIdx(null)}
            initial={{ opacity: 0, y: 20, rotate: 0 }}
            animate={{
              opacity: 1,
              x: x + adjacentNudge,
              y: isHovered ? y - 22 : y,
              // Keep rotation EXACTLY the same on hover — natural cards don't
              // straighten when peeked at, they just lift in place.
              rotate: angle,
              scale: isHovered ? 1.04 : 1,
            }}
            transition={{
              type: "spring",
              // One consistent feel — gently weighted, no jarring spring swap.
              stiffness: 280,
              damping: 28,
              mass: 0.7,
              delay: hoveredIdx === null ? 0.4 + i * 0.06 : 0,
            }}
            whileTap={{ y: y - 14, scale: 1.02 }}
            className="absolute left-1/2 top-1/2 w-32 h-48 -ml-16 -mt-24 rounded-md overflow-hidden bg-white cursor-pointer ring-1 ring-black/15"
            style={{
              transformOrigin: "center bottom",
              zIndex: isHovered ? 50 : baseZ,
              boxShadow: isHovered
                ? "0 18px 30px -12px rgba(0,0,0,0.28), 0 6px 12px -6px rgba(0,0,0,0.14)"
                : "0 8px 18px -8px rgba(0,0,0,0.16), 0 3px 6px -3px rgba(0,0,0,0.08)",
              transition:
                "box-shadow 320ms cubic-bezier(0.32, 0.72, 0, 1)",
            }}
          >
            <HwatuCardImage
              path={src}
              className="absolute inset-0 w-full h-full pointer-events-none"
            />
          </motion.div>
        );
      })}
    </motion.div>
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
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
      <motion.div
        className="absolute bottom-0 right-1/4 size-[360px] rounded-full bg-emerald-500/[0.03] blur-3xl"
        animate={{ y: [0, -14, 0] }}
        transition={{
          duration: 13,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
    </div>
  );
}
