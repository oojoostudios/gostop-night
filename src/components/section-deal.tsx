"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ChevronRight, Layers, RotateCcw, Shuffle } from "lucide-react";
import { Button } from "@heroui/react";
import { useLocale } from "@/contexts/locale-context";
import { FadeInOnView } from "@/components/fade-in-on-view";
import { HWATU_DECK, type HwatuCard as HwatuCardData } from "@/lib/hwatu";

const cardById = (id: string): HwatuCardData | undefined =>
  HWATU_DECK.find((c) => c.id === id);

// A representative starting deal — handpicked for visual variety
// (the exact identity doesn't matter, since real deals are shuffled)
const STARTING_FLOOR = [
  "01-pi-1",
  "04-pi-1",
  "06-tti",
  "08-gwang",
  "09-kkeut",
  "10-kkeut",
  "11-pi-3",
  "12-pi",
] as const;

const YOUR_HAND = [
  "02-tti",
  "03-tti",
  "05-tti",
  "07-pi-1",
  "07-pi-2",
  "11-tti",
  "01-gwang",
] as const;

const REMAINING_COUNT = 48 - STARTING_FLOOR.length - YOUR_HAND.length * 3; // 19

type Step = 0 | 1 | 2 | 3;

const STEP_META: ReadonlyArray<{
  titleKo: string;
  titleEn: string;
  descKo: string;
  descEn: string;
}> = [
  {
    titleKo: "1. 카드를 섞어요",
    titleEn: "1. Shuffle the deck",
    descKo:
      "48장 화투 카드를 모두 뒤집어 섞어요. 누가 어떤 카드를 받을지 운에 맡기는 단계.",
    descEn:
      "Shuffle all 48 face-down cards. Who gets what is up to chance — that's the whole point.",
  },
  {
    titleKo: "2. 바닥에 8장 펼쳐요",
    titleEn: "2. Open the floor (8 cards)",
    descKo:
      "셔플한 더미에서 8장을 뽑아 바닥(공유 영역)에 펼쳐 놓아요. 모든 플레이어가 볼 수 있어요.",
    descEn:
      "Take 8 cards from the deck and lay them face-up on the floor — the shared area everyone can see.",
  },
  {
    titleKo: "3. 각자 7장씩 손패 분배",
    titleEn: "3. Deal 7 cards to each player",
    descKo:
      "3인 게임 기준 — 각 플레이어에게 7장씩 손패. 다른 사람 손패는 안 보여요. (2인이면 10장씩, 4인이면 5장씩)",
    descEn:
      "In a 3-player game, each player gets 7 cards in hand. Hidden from others. (2-player: 10 each, 4-player: 5 each.)",
  },
  {
    titleKo: "4. 더미에 19장 남음 — 시작!",
    titleEn: "4. 19 cards left in the deck — ready!",
    descKo:
      "남은 19장이 더미가 되어 라운드 동안 한 장씩 뒤집혀요. 첫 차례 플레이어부터 시작.",
    descEn:
      "The remaining 19 form the deck — flipped one at a time during play. First player starts.",
  },
];

export function SectionDeal() {
  const { locale } = useLocale();
  const [step, setStep] = useState<Step>(0);
  const next = () => setStep((s) => (Math.min(3, s + 1) as Step));
  const reset = () => setStep(0);

  const meta = STEP_META[step];

  return (
    <section
      id="section-deal"
      className="relative py-24 border-t border-foreground/10 section-flow-bg"
    >
      <div className="lg:ml-72">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-16">
      <FadeInOnView className="text-xs tabular-nums text-foreground/50 mb-4">
        SECTION 02
      </FadeInOnView>
      <FadeInOnView
        as="h2"
        delay={0.05}
        className="text-4xl md:text-5xl font-semibold tracking-tight mb-6"
      >
        {locale === "ko" ? "한 판이 시작될 때" : "How a round begins"}
      </FadeInOnView>
      <FadeInOnView
        as="p"
        delay={0.12}
        className="text-lg text-foreground/60 max-w-2xl leading-relaxed mb-10"
      >
        {locale === "ko"
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
            <h3 className="text-xl font-semibold tracking-tight mb-2">
              {locale === "ko" ? meta.titleKo : meta.titleEn}
            </h3>
            <p className="text-sm text-foreground/70 leading-relaxed max-w-2xl">
              {locale === "ko" ? meta.descKo : meta.descEn}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onPress={reset}
            isDisabled={step === 0}
          >
            <RotateCcw className="size-4" />
            {locale === "ko" ? "처음" : "Reset"}
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
                {locale === "ko" ? "셔플" : "Shuffle"}
              </>
            ) : (
              <>
                {locale === "ko" ? "다음" : "Next"}
                <ChevronRight className="size-4" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* step pips */}
      <div className="mt-6 flex items-center gap-2">
        {STEP_META.map((_, i) => (
          <motion.button
            key={i}
            type="button"
            onClick={() => setStep(i as Step)}
            whileTap={{ scale: 0.85 }}
            aria-label={`Go to step ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              i === step
                ? "w-8 bg-foreground"
                : i < step
                  ? "w-4 bg-foreground/40"
                  : "w-4 bg-foreground/15 hover:bg-foreground/30"
            }`}
          />
        ))}
        <span className="ml-3 text-xs tabular-nums text-foreground/50">
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

  // Visual state per step
  const showFloor = step >= 1;
  const showHands = step >= 2;
  // Deck count drops as we deal
  let deckCount = 48;
  if (step >= 1) deckCount -= STARTING_FLOOR.length; // -8
  if (step >= 2) deckCount -= YOUR_HAND.length * 3; // -21
  // Final: 48 - 8 - 21 = 19

  return (
    <div className="rounded-xl border border-foreground/10 bg-foreground/[0.03] p-6 md:p-8 space-y-7">
      {/* Floor zone */}
      <Zone
        labelKo="바닥 (공유)"
        labelEn="Floor (shared)"
        helpKo="모두에게 공개된 매치 후보"
        helpEn="Face-up cards everyone can match against"
      >
        <div className="flex flex-wrap gap-1.5 min-h-[6rem]">
          <AnimatePresence>
            {showFloor &&
              STARTING_FLOOR.map((id, i) => (
                <FaceUpCard
                  key={`floor-${id}`}
                  id={id}
                  delay={i * 0.05}
                  layoutId={`deal-floor-${id}`}
                />
              ))}
          </AnimatePresence>
          {!showFloor && (
            <div className="text-xs text-foreground/40 italic self-center">
              {locale === "ko"
                ? "다음 단계: 8장이 여기에 펼쳐져요"
                : "Next: 8 cards land here face-up"}
            </div>
          )}
        </div>
      </Zone>

      {/* Deck + 3 hands grid */}
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 items-start">
        <DeckPile count={deckCount} />

        <div className="space-y-5">
          <PlayerHand
            who={locale === "ko" ? "내 손패" : "Your hand"}
            help={
              locale === "ko" ? "다른 사람에겐 안 보여요" : "Hidden from others"
            }
            visibleHand={showHands ? YOUR_HAND : undefined}
            faceUp
          />
          <PlayerHand
            who={locale === "ko" ? "상대 1" : "Opponent 1"}
            help={
              locale === "ko" ? "카드 뒷면만 보여요" : "Face-down (concealed)"
            }
            visibleHand={showHands ? Array(7).fill("") : undefined}
            faceUp={false}
          />
          <PlayerHand
            who={locale === "ko" ? "상대 2" : "Opponent 2"}
            help={
              locale === "ko" ? "카드 뒷면만 보여요" : "Face-down (concealed)"
            }
            visibleHand={showHands ? Array(7).fill("") : undefined}
            faceUp={false}
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
        <div className="text-[11px] uppercase tracking-[0.18em] font-semibold text-foreground/70">
          {locale === "ko" ? labelKo : labelEn}
        </div>
        <div className="text-[11px] text-foreground/45">
          {locale === "ko" ? helpKo : helpEn}
        </div>
      </div>
      {children}
    </div>
  );
}

function FaceUpCard({
  id,
  delay = 0,
  layoutId,
}: {
  id: string;
  delay?: number;
  layoutId?: string;
}) {
  const card = cardById(id);
  if (!card) return null;
  return (
    <motion.div
      layout
      layoutId={layoutId}
      initial={{ opacity: 0, scale: 0.7, y: -30, rotateY: 180 }}
      animate={{ opacity: 1, scale: 1, y: 0, rotateY: 0 }}
      exit={{ opacity: 0, scale: 0.7 }}
      transition={{
        type: "spring",
        stiffness: 280,
        damping: 22,
        delay,
      }}
      className="relative aspect-[2/3] w-14 sm:w-16 rounded-md overflow-hidden ring-1 ring-black/10 bg-white"
    >
      <Image
        src={card.image}
        alt={card.nameKo}
        fill
        sizes="80px"
        className="object-cover"
      />
    </motion.div>
  );
}

function FaceDownCard({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 280,
        damping: 22,
        delay,
      }}
      className="relative aspect-[2/3] w-14 sm:w-16 rounded-md ring-1 ring-black/20 bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center"
      aria-hidden
    >
      <span className="text-zinc-400 text-[10px] tracking-widest font-medium">
        花鬪
      </span>
    </motion.div>
  );
}

function DeckPile({ count }: { count: number }) {
  const { locale } = useLocale();
  return (
    <div className="flex flex-col items-start gap-2">
      <div className="text-[11px] uppercase tracking-[0.18em] font-semibold text-foreground/70">
        {locale === "ko" ? "더미" : "Deck"}
      </div>
      <div className="relative h-24 w-16 sm:w-[72px]">
        {/* Stacked card backs (depth illusion) */}
        {[2, 1, 0].map((offset) => (
          <div
            key={offset}
            className="absolute rounded-md bg-gradient-to-br from-zinc-700 to-zinc-900 ring-1 ring-black/30 flex items-center justify-center text-zinc-300"
            style={{
              top: -offset * 2,
              left: -offset * 1.5,
              right: offset * 1.5,
              bottom: offset * 2,
              opacity: count > offset * 5 ? 1 : 0.3,
            }}
            aria-hidden
          >
            {offset === 0 && <Layers className="size-5" />}
          </div>
        ))}
      </div>
      <div className="text-[10px] tabular-nums text-foreground/55 mt-1">
        <AnimatePresence mode="sync" initial={false}>
          <motion.span
            key={count}
            initial={{ y: "60%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "-60%", opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
            className="inline-block"
          >
            ×{count} {locale === "ko" ? "장 남음" : "left"}
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
}: {
  who: string;
  help: string;
  visibleHand?: ReadonlyArray<string>;
  faceUp: boolean;
}) {
  const { locale } = useLocale();
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <div className="text-[11px] uppercase tracking-[0.18em] font-semibold text-foreground/70">
          {who}
        </div>
        <div className="text-[11px] text-foreground/45">{help}</div>
      </div>
      <div className="flex flex-wrap gap-1.5 min-h-[5rem]">
        <AnimatePresence>
          {visibleHand?.map((id, i) =>
            faceUp ? (
              <FaceUpCard key={`fu-${id}-${i}`} id={id} delay={i * 0.06} />
            ) : (
              <FaceDownCard key={`fd-${i}`} delay={i * 0.04} />
            ),
          )}
        </AnimatePresence>
        {!visibleHand && (
          <div className="text-xs text-foreground/35 italic self-center">
            {locale === "ko" ? "아직 손패 없음" : "No cards yet"}
          </div>
        )}
      </div>
    </div>
  );
}

void REMAINING_COUNT; // expose for future tests
