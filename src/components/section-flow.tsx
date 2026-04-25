"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Layers } from "lucide-react";
import { Button } from "@heroui/react";
import { useLocale } from "@/contexts/locale-context";
import { HWATU_DECK, type HwatuCard as HwatuCardData } from "@/lib/hwatu";

const cardById = (id: string): HwatuCardData => {
  const c = HWATU_DECK.find((x) => x.id === id);
  if (!c) throw new Error(`Unknown card id: ${id}`);
  return c;
};

type Zone = "hand" | "floor" | "taken";

type StageState = {
  hand: string[];
  floor: string[];
  taken: string[];
  /** Top deck card, only present when face-up mid-turn. */
  flipped?: string;
  deckCount: number;
  highlight?: { hand?: string; floor?: string; taken?: string[] };
};

const HAND = ["01-gwang", "03-tti", "07-pi-1", "09-kkeut"];
const FLOOR = ["01-pi-1", "04-pi-1", "08-gwang", "11-pi-3"];

type Step = {
  id: string;
  title: string;
  titleKo: string;
  desc: string;
  descKo: string;
  state: StageState;
};

const STEPS: ReadonlyArray<Step> = [
  {
    id: "setup",
    title: "Deal the cards",
    titleKo: "패를 분배해요",
    desc:
      "In a 3-player game, each player gets 7 cards in hand. 8 cards lie face-up on the floor (바닥). The remaining 19 form the deck.",
    descKo:
      "3인 고스톱 기준 — 각자 7장씩 손패를 받고, 바닥(공유 영역)에는 8장이 펼쳐져요. 남은 19장은 더미.",
    state: {
      hand: HAND,
      floor: FLOOR,
      taken: [],
      deckCount: 19,
    },
  },
  {
    id: "pick",
    title: "Pick a card from your hand",
    titleKo: "손패에서 카드를 골라요",
    desc:
      "Look for a hand card whose month matches one on the floor. Here, the 1월 광 (Pine bright) in hand pairs with the 1월 피 on the floor.",
    descKo:
      "내 손패와 바닥에서 같은 월(月)의 카드를 찾아요. 손에 있는 1월 광(송학)이 바닥의 1월 피와 짝이 맞네요.",
    state: {
      hand: HAND,
      floor: FLOOR,
      taken: [],
      deckCount: 19,
      highlight: { hand: "01-gwang", floor: "01-pi-1" },
    },
  },
  {
    id: "match",
    title: "Take the matched pair",
    titleKo: "쌍을 먹어요",
    desc:
      "Both cards move to your taken pile. Cards are kept face-up so everyone can see your score.",
    descKo:
      "두 카드 모두 내 먹은 패로 들어가요. 먹은 패는 공개돼서 모두가 점수를 확인할 수 있어요.",
    state: {
      hand: ["03-tti", "07-pi-1", "09-kkeut"],
      floor: ["04-pi-1", "08-gwang", "11-pi-3"],
      taken: ["01-gwang", "01-pi-1"],
      deckCount: 19,
      highlight: { taken: ["01-gwang", "01-pi-1"] },
    },
  },
  {
    id: "flip",
    title: "Flip the top deck card",
    titleKo: "더미에서 한 장 뒤집어요",
    desc:
      "After playing, you flip the top card from the deck. If it matches a card on the floor, you take that pair too. Here, 5월 피 has no match — it joins the floor.",
    descKo:
      "손패를 낸 후, 더미 맨 위 카드를 뒤집어요. 바닥과 매치되면 또 한 쌍을 가져갈 수 있어요. 여기선 5월 피가 짝이 없어서 그냥 바닥에 놓여요.",
    state: {
      hand: ["03-tti", "07-pi-1", "09-kkeut"],
      floor: ["04-pi-1", "08-gwang", "11-pi-3"],
      taken: ["01-gwang", "01-pi-1"],
      deckCount: 18,
      flipped: "05-pi-1",
    },
  },
  {
    id: "end",
    title: "Turn ends",
    titleKo: "차례가 끝나요",
    desc:
      "Your turn passes. Once you reach 7 points, you'll decide: 고 (go for more) or 스톱 (stop and cash out).",
    descKo:
      "내 차례가 끝나고 다음 사람으로 넘어가요. 7점에 도달하면 결정해야 해요 — 고(계속) 또는 스톱(멈춤).",
    state: {
      hand: ["03-tti", "07-pi-1", "09-kkeut"],
      floor: ["04-pi-1", "08-gwang", "11-pi-3", "05-pi-1"],
      taken: ["01-gwang", "01-pi-1"],
      deckCount: 18,
    },
  },
];

export function SectionFlow() {
  const { locale } = useLocale();
  const [stepIndex, setStepIndex] = useState(0);
  const step = STEPS[stepIndex];

  const goPrev = () => setStepIndex((i) => Math.max(0, i - 1));
  const goNext = () => setStepIndex((i) => Math.min(STEPS.length - 1, i + 1));

  return (
    <section
      id="section-flow"
      className="py-24 border-t border-foreground/10"
    >
      <div className="text-xs tabular-nums text-foreground/50 mb-4">
        SECTION 02
      </div>
      <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6">
        {locale === "ko" ? "한 판은 이렇게" : "How a round works"}
      </h2>
      <p className="text-lg text-foreground/60 max-w-2xl leading-relaxed mb-12">
        {locale === "ko"
          ? "한 턴의 흐름을 따라가 봐요. 패를 받고, 같은 월의 카드를 매치하고, 더미를 뒤집고, 다음 사람으로 넘어가요."
          : "Follow one turn from start to finish. Deal, match by month, flip from the deck, and pass to the next player."}
      </p>

      <Stage state={step.state} />

      <div className="mt-8 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-start">
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            <h3 className="text-xl font-semibold tracking-tight mb-2">
              {locale === "ko" ? step.titleKo : step.title}
            </h3>
            <p className="text-sm text-foreground/70 leading-relaxed max-w-2xl">
              {locale === "ko" ? step.descKo : step.desc}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onPress={goPrev}
            isDisabled={stepIndex === 0}
          >
            <ChevronLeft className="size-4" />
            {locale === "ko" ? "이전" : "Prev"}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onPress={goNext}
            isDisabled={stepIndex === STEPS.length - 1}
          >
            {locale === "ko" ? "다음" : "Next"}
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStepIndex(i)}
            aria-label={`Go to step ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              i === stepIndex
                ? "w-8 bg-foreground"
                : i < stepIndex
                  ? "w-4 bg-foreground/40"
                  : "w-4 bg-foreground/15 hover:bg-foreground/30"
            }`}
          />
        ))}
        <span className="ml-3 text-xs tabular-nums text-foreground/50">
          {stepIndex + 1} / {STEPS.length}
        </span>
      </div>
    </section>
  );
}

function Stage({ state }: { state: StageState }) {
  const { locale } = useLocale();
  return (
    <div className="rounded-xl border border-foreground/10 bg-foreground/[0.02] p-6 md:p-8 space-y-6">
      <Zone
        labelKo="바닥"
        labelEn="Floor"
        helpKo="공유되는 카드. 매치 대상이에요."
        helpEn="Shared face-up cards — match candidates."
        cardIds={state.floor}
        highlightedId={state.highlight?.floor}
      />

      <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-6 items-start">
        <DeckPile count={state.deckCount} flipped={state.flipped} />
        <Zone
          labelKo="먹은 패"
          labelEn="Taken"
          helpKo="내가 가져간 카드들. 광/띠/끗/피로 분류돼요."
          helpEn="Cards you've won. Sorted by type at score time."
          cardIds={state.taken}
          highlightedIds={state.highlight?.taken}
          empty={
            locale === "ko"
              ? "아직 먹은 패가 없어요"
              : "No cards taken yet"
          }
        />
      </div>

      <Zone
        labelKo="내 손패"
        labelEn="Your hand"
        helpKo="다른 플레이어에겐 안 보여요."
        helpEn="Hidden from other players."
        cardIds={state.hand}
        highlightedId={state.highlight?.hand}
      />
    </div>
  );
}

function Zone({
  labelKo,
  labelEn,
  helpKo,
  helpEn,
  cardIds,
  highlightedId,
  highlightedIds,
  empty,
}: {
  labelKo: string;
  labelEn: string;
  helpKo: string;
  helpEn: string;
  cardIds: string[];
  highlightedId?: string;
  highlightedIds?: string[];
  empty?: string;
}) {
  const { locale } = useLocale();
  const isHighlighted = (id: string) =>
    id === highlightedId || (highlightedIds?.includes(id) ?? false);

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
      {cardIds.length === 0 ? (
        <div className="rounded-md border border-dashed border-foreground/15 px-3 py-6 text-center text-xs text-foreground/40">
          {empty}
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          <AnimatePresence mode="popLayout">
            {cardIds.map((id) => (
              <MiniCard
                key={id}
                id={id}
                highlighted={isHighlighted(id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function MiniCard({
  id,
  highlighted,
}: {
  id: string;
  highlighted?: boolean;
}) {
  const card = cardById(id);
  return (
    <motion.div
      layout
      layoutId={`flow-${id}`}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ type: "spring", stiffness: 320, damping: 30 }}
      className={`relative aspect-[2/3] w-14 sm:w-16 rounded-md overflow-hidden ring-1 ring-black/10 bg-white ${
        highlighted
          ? "outline outline-2 outline-offset-2 outline-amber-500"
          : ""
      }`}
    >
      <Image src={card.image} alt={card.nameKo} fill sizes="80px" className="object-cover" />
    </motion.div>
  );
}

function DeckPile({
  count,
  flipped,
}: {
  count: number;
  flipped?: string;
}) {
  const { locale } = useLocale();
  const flippedCard = flipped ? cardById(flipped) : null;

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="text-[11px] uppercase tracking-[0.18em] font-semibold text-foreground/70">
        {locale === "ko" ? "더미" : "Deck"}
      </div>
      <div className="relative h-24 w-16 sm:w-[72px]">
        <div
          className="absolute inset-0 rounded-md bg-zinc-700 ring-1 ring-black/20 flex items-center justify-center text-zinc-300"
          aria-hidden
        >
          <Layers className="size-5" />
        </div>
        <div className="absolute inset-x-0 -bottom-5 text-center text-[10px] tabular-nums text-foreground/50">
          ×{count}
        </div>
        <AnimatePresence>
          {flippedCard && (
            <motion.div
              key={flippedCard.id}
              initial={{ opacity: 0, x: 0, rotateY: 180 }}
              animate={{ opacity: 1, x: 80, rotateY: 0 }}
              exit={{ opacity: 0, x: 80 }}
              transition={{ type: "spring", stiffness: 240, damping: 22 }}
              className="absolute inset-0 rounded-md overflow-hidden ring-1 ring-amber-500 ring-offset-2 bg-white"
            >
              <Image
                src={flippedCard.image}
                alt={flippedCard.nameKo}
                fill
                sizes="80px"
                className="object-cover"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
