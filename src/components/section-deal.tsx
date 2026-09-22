'use client';

import { useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from 'motion/react';
import { ChevronRight, RotateCcw, Shuffle } from 'lucide-react';
import { Button } from '@heroui/react';
import { useLocale } from '@/contexts/locale-context';
import { FadeInOnView } from '@/components/fade-in-on-view';
import { SectionTitle } from '@/components/section-title';
import { HwatuCardImage } from '@/components/hwatu-card-image';
import { HwatuCardBack } from '@/components/hwatu-card-back';
import { GOSTOP_SECTIONS } from '@/lib/sections';
import { HWATU_DECK, type HwatuCard as HwatuCardData } from '@/lib/hwatu';
import { MonthCaption } from '@/components/turn-stage';

const SECTION = GOSTOP_SECTIONS.find((s) => s.id === 'section-deal')!;

const cardById = (id: string): HwatuCardData | undefined => HWATU_DECK.find((c) => c.id === id);

// A representative starting deal — handpicked for visual variety
// (the exact identity doesn't matter, since real deals are shuffled)
// 3 players: 6 cards on the floor (see CLAUDE.md's resolved floor-count decision).
const STARTING_FLOOR = ['01-pi-1', '04-pi-1', '06-tti', '08-gwang', '09-kkeut', '11-pi-3'] as const;

const YOUR_HAND = [
  '02-tti',
  '03-tti',
  '05-tti',
  '07-pi-1',
  '07-pi-2',
  '11-pi-1',
  '01-gwang',
] as const;

const REMAINING_COUNT = 48 - STARTING_FLOOR.length - YOUR_HAND.length * 3; // 21

// Deal animation timing (CLAUDE.md, micro-interactions): ~0.3s per card, 60ms stagger,
// then the face-up cards turn over (the same ~0.45s low-bounce spring as the card flip).
const SLIDE_SECONDS = 0.3;
const STAGGER_SECONDS = 0.06;
const FLIP_PAUSE_SECONDS = 0.1; // a beat between the last card landing and the first one turning
const PLAYERS_AT_TABLE = 3; // the demo deals to three hands, one card at a time in turn
const landedAt = (order: number) => order * STAGGER_SECONDS + SLIDE_SECONDS;
/** When the floor cards start turning over: once all eight have landed. */
const FLOOR_FLIP_START = landedAt(STARTING_FLOOR.length - 1) + FLIP_PAUSE_SECONDS;
/** When your own cards start turning over: once every hand has been dealt. */
const HAND_FLIP_START = landedAt(YOUR_HAND.length * PLAYERS_AT_TABLE - 1) + FLIP_PAUSE_SECONDS;

type Step = 0 | 1 | 2 | 3;

const STEP_META: ReadonlyArray<{
  titleKo: string;
  titleEn: string;
  descKo: string;
  descEn: string;
}> = [
  {
    titleKo: '1. 카드를 섞어요',
    titleEn: '1. Shuffle the deck',
    descKo: '48장 카드를 모두 뒤집어서 섞어요.',
    descEn: 'Shuffle all 48 cards face down.',
  },
  {
    titleKo: '2. 바닥에 6장을 펼쳐요',
    titleEn: '2. Open the floor (6 cards)',
    descKo:
      '가운데에 6장을 펼쳐 놓아요. 이게 바닥이에요 — 모두가 보고, 이 카드들과 맞출 수 있어요.',
    descEn:
      'Lay 6 cards face up in the middle. This is the floor: everyone can see it and match against it.',
  },
  {
    titleKo: '3. 각자 7장씩 나눠줘요',
    titleEn: '3. Deal 7 cards to each player',
    descKo: '각자의 손패는 비공개예요. 2인전이면 각자 10장씩 받고 바닥엔 8장을 펼쳐요.',
    descEn: "Each player's hand is private. With 2 players, deal 10 each and open 8 on the floor.",
  },
  {
    titleKo: '4. 더미에 21장 남음 — 시작!',
    titleEn: '4. 21 cards left in the deck — start!',
    descKo: '나머지는 뒤집힌 채로 더미가 돼요. 매 턴마다 한 장씩 뒤집어요. 딜러부터 시작해요.',
    descEn:
      'The rest stay face down as the deck. You flip one from it every turn. The dealer plays first.',
  },
];

export function SectionDeal() {
  const { locale } = useLocale();
  const [step, setStep] = useState<Step>(0);
  const next = () => setStep((s) => Math.min(3, s + 1) as Step);
  const reset = () => setStep(0);

  const meta = STEP_META[step];

  return (
    <section id="section-deal" className="relative py-24 border-t border-hairline section-flow-bg">
      <div className="lg:ml-72">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-16">
          <SectionTitle section={SECTION} />
          <FadeInOnView
            as="p"
            delay={0.12}
            className="text-body text-ink-soft max-w-[65ch] leading-relaxed mb-10"
          >
            {locale === 'ko'
              ? "카드를 어떻게 나누고 어디에 두는지 — 4단계로 따라가 보세요. '다음' 버튼을 눌러 진행할 수 있어요."
              : "Where cards go and how they get there — follow along in four steps. Click 'Next' to advance the deal."}
          </FadeInOnView>

          <DealStage step={step} />

          {/* description + nav */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-start">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
              >
                <h3 className="font-display text-sub mb-2">
                  {locale === 'ko' ? meta.titleKo : meta.titleEn}
                </h3>
                <p className="text-body text-ink-soft leading-relaxed max-w-[65ch]">
                  {locale === 'ko' ? meta.descKo : meta.descEn}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onPress={reset} isDisabled={step === 0}>
                <RotateCcw className="size-4" />
                {locale === 'ko' ? '처음' : 'Reset'}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onPress={next}
                isDisabled={step === 3}
                className="min-w-[120px]"
              >
                {step === 0 ? (
                  <>
                    <Shuffle className="size-4" />
                    {locale === 'ko' ? '셔플' : 'Shuffle'}
                  </>
                ) : (
                  <>
                    {locale === 'ko' ? '다음' : 'Next'}
                    <ChevronRight className="size-4" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* step dots */}
          <div className="mt-6 flex items-center gap-2">
            {STEP_META.map((meta, i) => (
              <motion.button
                key={meta.titleEn}
                type="button"
                onClick={() => setStep(i as Step)}
                whileTap={{ scale: 0.85 }}
                aria-label={locale === 'ko' ? `${i + 1}단계로 이동` : `Go to step ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? 'w-8 bg-plum' : i < step ? 'w-4 bg-plum' : 'w-4 bg-ink/20'
                }`}
              />
            ))}
            <span className="ml-3 text-label tabular-nums text-ink-soft">
              {step + 1} / {STEP_META.length}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Stage                                                                       */
/* -------------------------------------------------------------------------- */

function DealStage({ step }: { step: Step }) {
  const { locale } = useLocale();
  // The dealt cards slide out of the deck pile, so they need to know where it is.
  const deckRef = useRef<HTMLDivElement>(null);

  // Visual state per step
  const showFloor = step >= 1;
  const showHands = step >= 2;
  // Deck count drops as we deal
  let deckCount = 48;
  if (step >= 1) deckCount -= STARTING_FLOOR.length; // -8
  if (step >= 2) deckCount -= YOUR_HAND.length * 3; // -21
  // Final: 48 - 8 - 21 = 19

  return (
    <div className="club-card p-6 md:p-8 space-y-7">
      {/* Floor zone */}
      <Zone
        labelKo="바닥 (공유)"
        labelEn="Floor (shared)"
        helpKo="모두에게 공개된 매치 후보"
        helpEn="Face-up cards everyone can match against"
      >
        <div className="flex flex-wrap gap-x-1.5 gap-y-7 min-h-[6rem]">
          <AnimatePresence>
            {showFloor &&
              STARTING_FLOOR.map((id, i) => (
                <DealtCard
                  key={`floor-${id}`}
                  card={cardById(id)}
                  order={i}
                  flipAt={FLOOR_FLIP_START + i * STAGGER_SECONDS}
                  deckRef={deckRef}
                />
              ))}
          </AnimatePresence>
          {!showFloor && (
            <div className="text-label text-ink-soft self-center">
              {locale === 'ko'
                ? '다음 단계: 8장이 여기에 펼쳐져요'
                : 'Next: 8 cards land here face-up'}
            </div>
          )}
        </div>
      </Zone>

      {/* Deck + 3 hands grid */}
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 items-start">
        <DeckPile count={deckCount} pileRef={deckRef} />

        <div className="space-y-5">
          <PlayerHand
            who={locale === 'ko' ? '내 손패' : 'Your hand'}
            help={locale === 'ko' ? '다른 사람에겐 안 보여요' : 'Hidden from others'}
            visibleHand={showHands ? YOUR_HAND : undefined}
            faceUp
            seat={0}
            deckRef={deckRef}
          />
          <PlayerHand
            who={locale === 'ko' ? '상대 1' : 'Opponent 1'}
            help={locale === 'ko' ? '카드 뒷면만 보여요' : 'Face-down (concealed)'}
            visibleHand={showHands ? Array.from({ length: 7 }, () => '') : undefined}
            faceUp={false}
            seat={1}
            deckRef={deckRef}
          />
          <PlayerHand
            who={locale === 'ko' ? '상대 2' : 'Opponent 2'}
            help={locale === 'ko' ? '카드 뒷면만 보여요' : 'Face-down (concealed)'}
            visibleHand={showHands ? Array.from({ length: 7 }, () => '') : undefined}
            faceUp={false}
            seat={2}
            deckRef={deckRef}
          />
        </div>
      </div>
    </div>
  );
}

function Zone({
  labelKo,
  labelEn,
  helpKo,
  helpEn,
  children,
}: {
  labelKo: string;
  labelEn: string;
  helpKo: string;
  helpEn: string;
  children: React.ReactNode;
}) {
  const { locale } = useLocale();
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <div className="text-label uppercase tracking-[0.18em] font-semibold text-ink-soft">
          {locale === 'ko' ? labelKo : labelEn}
        </div>
        <div className="text-label text-ink-soft">{locale === 'ko' ? helpKo : helpEn}</div>
      </div>
      {children}
    </div>
  );
}

/**
 * One dealt card. It starts face down on the deck pile, slides to its spot, and (if it has a face
 * to show) turns over. `order` is its place in the dealing, so cards leave the deck one after another.
 * With reduced motion: no sliding, no turning, no stagger. The card fades in and the two sides cross-fade.
 */
function DealtCard({
  card,
  order,
  flipAt,
  deckRef,
}: {
  /** Leave out for a hand you can't see: it stays face down. */
  card?: HwatuCardData;
  order: number;
  /** Seconds from when the card appears until it starts turning face up. */
  flipAt?: number;
  deckRef: RefObject<HTMLDivElement | null>;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Before the first paint: put the card on the deck pile, then slide it home.
  // (Stopping in the cleanup keeps this correct when React runs effects twice in development.)
  useLayoutEffect(() => {
    const el = ref.current;
    const deck = deckRef.current;
    if (reduce || !el || !deck) return;
    const to = el.getBoundingClientRect();
    const from = deck.getBoundingClientRect();
    const dx = from.left + from.width / 2 - (to.left + to.width / 2);
    const dy = from.top + from.height / 2 - (to.top + to.height / 2);
    x.set(dx);
    y.set(dy);
    const timing = {
      duration: SLIDE_SECONDS,
      delay: order * STAGGER_SECONDS,
      ease: 'easeOut',
    } as const;
    const slideX = animate(x, [dx, 0], timing);
    const slideY = animate(y, [dy, 0], timing);
    return () => {
      slideX.stop();
      slideY.stop();
    };
  }, [deckRef, order, reduce, x, y]);

  const back = (
    <div className="absolute inset-0 overflow-hidden rounded-md" aria-hidden>
      <HwatuCardBack className="absolute inset-0 h-full w-full" />
    </div>
  );

  let faces: React.ReactNode = back;
  if (card && flipAt !== undefined) {
    const front = <HwatuCardImage card={card} className="absolute inset-0 h-full w-full" />;
    faces = reduce ? (
      // Less motion: the back fades out while the front fades in.
      <>
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.2, delay: 0.25 }}
        >
          {back}
        </motion.div>
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.25 }}
        >
          {front}
        </motion.div>
      </>
    ) : (
      // Turns on the vertical axis with a slight scale-up; each side hides when it faces away.
      <motion.div
        className="absolute inset-0"
        style={{ perspective: 1200 }}
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 0.45, ease: 'easeInOut', delay: flipAt }}
      >
        <motion.div
          className="relative h-full w-full"
          style={{ transformStyle: 'preserve-3d' }}
          initial={{ rotateY: 0 }}
          animate={{ rotateY: 180 }}
          transition={{ type: 'spring', duration: 0.45, bounce: 0.12, delay: flipAt }}
        >
          <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
            {back}
          </div>
          <div
            className="absolute inset-0"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            {front}
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      initial={{ opacity: reduce ? 0 : 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.7 }}
      transition={{ duration: 0.2 }}
      // Above the deck pile, so a card is never hidden behind it while it slides out.
      className="relative z-[5] aspect-[2/3] w-14 sm:w-16"
      aria-hidden={!card}
    >
      {faces}
      {card && (
        <div className="absolute inset-x-0 -bottom-8">
          <MonthCaption card={card} />
        </div>
      )}
    </motion.div>
  );
}

function DeckPile({
  count,
  pileRef,
}: {
  count: number;
  pileRef: RefObject<HTMLDivElement | null>;
}) {
  const { locale } = useLocale();
  return (
    <div className="flex flex-col items-start gap-2">
      <div className="text-label uppercase tracking-[0.18em] font-semibold text-ink-soft">
        {locale === 'ko' ? '더미' : 'Deck'}
      </div>
      <div ref={pileRef} className="relative h-24 w-16 sm:w-[72px]">
        {/* Stacked card backs (depth illusion) */}
        {[2, 1, 0].map((offset) => (
          <div
            key={offset}
            className="absolute rounded-md overflow-hidden"
            style={{
              top: -offset * 2,
              left: -offset * 1.5,
              right: offset * 1.5,
              bottom: offset * 2,
              opacity: count > offset * 5 ? 1 : 0.3,
            }}
            aria-hidden
          >
            <HwatuCardBack className="absolute inset-0 w-full h-full" />
          </div>
        ))}
      </div>
      <div className="text-label tabular-nums text-ink-soft mt-1">
        <AnimatePresence mode="sync" initial={false}>
          <motion.span
            key={count}
            initial={{ y: '60%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            exit={{ y: '-60%', opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
            className="inline-block"
          >
            ×{count} {locale === 'ko' ? '장 남음' : 'left'}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}

function PlayerHand({
  who,
  help,
  visibleHand,
  faceUp,
  seat,
  deckRef,
}: {
  who: string;
  help: string;
  visibleHand?: ReadonlyArray<string>;
  faceUp: boolean;
  /** Where this player sits (0, 1, 2). Cards are dealt one at a time around the table. */
  seat: number;
  deckRef: RefObject<HTMLDivElement | null>;
}) {
  const { locale } = useLocale();
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <div className="text-label uppercase tracking-[0.18em] font-semibold text-ink-soft">
          {who}
        </div>
        <div className="text-label text-ink-soft">{help}</div>
      </div>
      <div className="flex flex-wrap gap-x-1.5 gap-y-7 min-h-[5rem]">
        <AnimatePresence>
          {visibleHand?.map((id, i) => {
            const card = faceUp ? cardById(id) : undefined;
            if (faceUp && !card) return null; // never show a face-up slot as a card back
            return (
              <DealtCard
                key={`${seat}-${id}-${i}`}
                card={card}
                order={i * PLAYERS_AT_TABLE + seat}
                flipAt={faceUp ? HAND_FLIP_START + i * STAGGER_SECONDS : undefined}
                deckRef={deckRef}
              />
            );
          })}
        </AnimatePresence>
        {!visibleHand && (
          <div className="text-label text-ink-soft self-center">
            {locale === 'ko' ? '아직 손패 없음' : 'No cards yet'}
          </div>
        )}
      </div>
    </div>
  );
}

void REMAINING_COUNT; // expose for future tests
