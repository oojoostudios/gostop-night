'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { useLocale } from '@/contexts/locale-context';
import { HwatuCardImage } from '@/components/hwatu-card-image';
import { Mascot } from '@/components/mascot';
import { Wordmark } from '@/components/wordmark';

const EASE = [0.32, 0.72, 0, 1] as const;

const STATS = [
  { num: '48', labelKo: '장의 화투 카드', labelEn: 'cards in a deck' },
  { num: '12', labelKo: '달 × 4장', labelEn: 'months × 4 cards' },
  {
    num: '4',
    labelKo: '종류 (광·띠·열·피)',
    labelEn: 'types (brights · ribbons · animals · junk)',
  },
  { num: '7', labelKo: '점에서 고/스톱', labelEn: 'points to call go/stop' },
] as const;

// Cards used for the right-side fan sigil
const FAN_CARDS = [
  '/cards/m12-bright.webp', // 12월 비광
  '/cards/m11-bright.webp', // 11월 오동광
  '/cards/m10-animal.webp', // 10월 사슴
  '/cards/m03-bright.webp', // 3월 벚꽃광
  '/cards/m08-bright.webp', // 8월 공산광
  '/cards/m01-bright.webp', // 1월 송학광
  '/cards/m07-animal.webp', // 7월 멧돼지
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
  const blurb = locale === 'ko' ? blurbKo : blurbEn;
  // We re-key on locale to retrigger the stagger when language changes
  const animKey = `${locale}`;

  // Title parts (kept short — Mahjong style: "Learn *mahjong* / A visual guide")
  // 화투 = the cards (assets), 고스톱 = the rules (game). Eyebrow names the
  // RULES because that's what this site teaches.
  const eyebrowMain = locale === 'ko' ? '한국식 고스톱 규칙' : 'Korean go-stop rules';
  const eyebrowAccent = '고스톱 · 화투';
  const learn = locale === 'ko' ? '고스톱을 배워봐요' : 'Learn';
  const accentWord = locale === 'ko' ? '' : 'go-stop';
  const subhead = locale === 'ko' ? '비주얼 가이드' : 'A visual guide';
  // Tagline that EXPLICITLY names the relationship: go-stop is the GAME,
  // played with hwatu (花鬪) cards. Mahjong-guide can show "麻將" alone
  // because mahjong = the tile set itself, but for us the two are distinct,
  // so we spell out the connection on its own line.
  const deckLine =
    locale === 'ko' ? '화투(花鬪)로 치는 게임' : 'the card game played with 花鬪 (hwatu)';
  void titleKo;
  void titleEn;

  return (
    <section className="relative min-h-screen flex flex-col justify-center py-20 overflow-hidden">
      <div className="lg:ml-72 relative z-10 w-full">
        <div className="mx-auto max-w-5xl xl:max-w-6xl 2xl:max-w-7xl px-6 sm:px-8 grid grid-cols-1 xl:grid-cols-[auto_auto] gap-10 xl:gap-2 items-center">
          {/* LEFT — title block */}
          <div className="max-w-lg">
            {/* Mascot large, next to the wordmark */}
            <motion.div
              key={`brand-${animKey}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="flex items-center gap-5 sm:gap-7 mb-12"
            >
              <Mascot className="w-28 sm:w-36 md:w-40" />
              <Wordmark size="lg" />
            </motion.div>

            <motion.div
              key={`eyebrow-${animKey}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="text-xs uppercase tracking-[0.2em] text-ink-soft mb-6 flex items-center gap-2 flex-wrap"
            >
              <span className="live-dot size-1.5 rounded-full bg-plum text-plum" aria-hidden />
              <span>{eyebrowMain}</span>
              <span className="text-ink-soft">·</span>
              <span className="text-sm tracking-normal text-ink-soft">{eyebrowAccent}</span>
            </motion.div>

            <motion.h1
              key={`title-${animKey}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.55, ease: EASE }}
              className="font-display text-5xl sm:text-6xl md:text-7xl leading-[1.05] mb-3"
            >
              {locale === 'ko' ? (
                <>
                  <span>고스톱을 </span>
                  <span className="text-plum">배워봐요</span>
                </>
              ) : (
                <>
                  <span>{learn} </span>
                  <span className="text-plum">{accentWord}</span>
                </>
              )}
            </motion.h1>

            <motion.div
              key={`subhead-${animKey}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.55, ease: EASE }}
              className="font-display text-3xl sm:text-4xl md:text-5xl leading-[1.05] text-ink-soft mb-3"
            >
              <span>{subhead}</span>
            </motion.div>

            {/* Explicit deck-relationship tagline — clarifies that go-stop
             * is the GAME played with the 화투 (花鬪) deck, not synonymous. */}
            <motion.div
              key={`deck-${animKey}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.55, ease: EASE }}
              className="text-base sm:text-lg text-ink-soft mb-7"
            >
              {deckLine}
            </motion.div>

            <motion.p
              key={`blurb-${animKey}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.55, ease: EASE }}
              className="text-base md:text-lg text-ink-soft max-w-xl leading-relaxed mb-10"
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

function StatsRow({ locale }: { locale: 'ko' | 'en' }) {
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
          className="border-l border-hairline pl-3"
        >
          <div className="text-3xl md:text-4xl font-bold tabular-nums text-ink leading-none">
            {s.num}
          </div>
          <div className="text-sm text-ink-soft mt-1.5 leading-snug">
            {locale === 'ko' ? s.labelKo : s.labelEn}
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
      className="relative hidden md:block w-[260px] h-[260px] xl:w-[400px] xl:h-[400px] shrink-0"
      aria-hidden
    >
      {/*
       * Inner box is always 400×400 (the geometry the fan was authored for).
       * On md viewports we scale the whole thing down to 0.65 so the hard-coded
       * card distances and sizes still line up. On lg+ it renders at full size.
       */}
      <div className="absolute left-1/2 top-1/2 w-[400px] h-[400px] -ml-[200px] -mt-[200px] origin-center scale-[0.65] xl:scale-100">
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
          const isAdjacent = hoveredIdx !== null && Math.abs(hoveredIdx - i) === 1;
          const adjacentNudge = isAdjacent ? Math.sign(i - (hoveredIdx as number)) * 7 : 0;

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
                type: 'spring',
                // One consistent feel — gently weighted, no jarring spring swap.
                stiffness: 280,
                damping: 28,
                mass: 0.7,
                delay: hoveredIdx === null ? 0.4 + i * 0.06 : 0,
              }}
              whileTap={{ y: y - 14, scale: 1.02 }}
              className="absolute left-1/2 top-1/2 w-32 h-48 -ml-16 -mt-24 cursor-pointer"
              style={{
                transformOrigin: 'center bottom',
                zIndex: isHovered ? 50 : baseZ,
              }}
            >
              <HwatuCardImage
                path={src}
                className="absolute inset-0 w-full h-full pointer-events-none"
              />
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
