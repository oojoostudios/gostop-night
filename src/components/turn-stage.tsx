'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { Button } from '@heroui/react';
import { useLocale } from '@/contexts/locale-context';
import { HwatuCardImage } from '@/components/hwatu-card-image';
import { HwatuCardBack } from '@/components/hwatu-card-back';
import { HWATU_DECK, type HwatuCard as HwatuCardData } from '@/lib/hwatu';

/**
 * The animated turn-stage engine shared by Section 03 (Playing Game) and Section 05
 * (Special Rules). Both sections drive it with their own `Step[]` data; this file only
 * owns the shared visuals (floor/hand/taken zones, deck pile, bonus-pi badge) and the
 * prev/next step-through controls. Moving a scenario between sections is just moving
 * its `Step[]` data — the animation itself doesn't change.
 */

export const cardById = (id: string): HwatuCardData => {
  const c = HWATU_DECK.find((x) => x.id === id);
  if (!c) throw new Error(`Unknown card id: ${id}`);
  return c;
};

export type StageState = {
  hand: string[];
  floor: string[];
  taken: string[];
  /** Top deck card mid-turn (visually face-up next to deck). */
  flipped?: string;
  deckCount: number;
  highlight?: {
    /** Hand cards to highlight (single id allowed for ergonomics). */
    hand?: string | string[];
    floor?: string[];
    taken?: string[];
    /** Floor cards that are locked (뻑) — rendered dimmed with a lock badge. */
    locked?: string[];
  };
  /** "+N pi from each opponent" badge (쪽/따닥/폭탄/싹쓸이). */
  bonusPi?: number;
};

export type Step = {
  id: string;
  title: string;
  titleKo: string;
  desc: string;
  descKo: string;
  state: StageState;
};

export type Scenario = {
  id: string;
  label: string;
  labelKo: string;
  blurb: string;
  blurbKo: string;
  steps: ReadonlyArray<Step>;
};

/* -------------------------------------------------------------------------- */
/* Step-through controls: Stage + title/desc + Prev/Next + progress dots        */
/* -------------------------------------------------------------------------- */

export function StepThrough({
  steps,
  topClassName = 'mt-8',
}: {
  steps: ReadonlyArray<Step>;
  topClassName?: string;
}) {
  const { locale } = useLocale();
  const [stepIndex, setStepIndex] = useState(0);
  const step = steps[stepIndex];

  const goPrev = () => setStepIndex((i) => Math.max(0, i - 1));
  const goNext = () => setStepIndex((i) => Math.min(steps.length - 1, i + 1));

  return (
    <div>
      <Stage state={step.state} />

      <div className={`${topClassName} grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-start`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            <h3 className="font-display text-sub mb-2">
              {locale === 'ko' ? step.titleKo : step.title}
            </h3>
            <p className="text-body text-ink-soft leading-relaxed max-w-[65ch]">
              {locale === 'ko' ? step.descKo : step.desc}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onPress={goPrev} isDisabled={stepIndex === 0}>
            <ChevronLeft className="size-4" />
            {locale === 'ko' ? '이전' : 'Prev'}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onPress={goNext}
            isDisabled={stepIndex === steps.length - 1}
          >
            {locale === 'ko' ? '다음' : 'Next'}
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2">
        {steps.map((s, i) => (
          <motion.button
            key={s.id}
            type="button"
            onClick={() => setStepIndex(i)}
            whileTap={{ scale: 0.85 }}
            aria-label={locale === 'ko' ? `${i + 1}단계로 이동` : `Go to step ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              i === stepIndex ? 'w-8 bg-plum' : i < stepIndex ? 'w-4 bg-plum' : 'w-4 bg-ink/20'
            }`}
          />
        ))}
        <span className="ml-3 text-label tabular-nums text-ink-soft">
          {stepIndex + 1} / {steps.length}
        </span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Stage                                                                       */
/* -------------------------------------------------------------------------- */

export function Stage({ state }: { state: StageState }) {
  const { locale } = useLocale();
  return (
    <div className="club-card p-6 md:p-8 space-y-8">
      <Zone
        labelKo="바닥"
        labelEn="Floor"
        helpKo="공유되는 카드. 매치 대상이에요."
        helpEn="Shared face-up cards — match candidates."
        cardIds={state.floor}
        highlightedIds={state.highlight?.floor}
        lockedIds={state.highlight?.locked}
      />

      <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] gap-6 items-start">
        <DeckPile count={state.deckCount} flipped={state.flipped} />
        <Zone
          labelKo="먹은 패"
          labelEn="Taken"
          helpKo="내가 가져간 카드들. 광/띠/열/피로 분류돼요."
          helpEn="Cards you've won. Sorted by type at score time."
          cardIds={state.taken}
          highlightedIds={state.highlight?.taken}
          empty={locale === 'ko' ? '아직 먹은 패가 없어요' : 'No cards taken yet'}
        />
        <BonusPiBadge count={state.bonusPi} />
      </div>

      <Zone
        labelKo="내 손패"
        labelEn="Your hand"
        helpKo="다른 플레이어에겐 안 보여요."
        helpEn="Hidden from other players."
        cardIds={state.hand}
        highlightedIds={
          state.highlight?.hand
            ? Array.isArray(state.highlight.hand)
              ? state.highlight.hand
              : [state.highlight.hand]
            : undefined
        }
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
  highlightedIds,
  lockedIds,
  empty,
}: {
  labelKo: string;
  labelEn: string;
  helpKo: string;
  helpEn: string;
  cardIds: string[];
  highlightedIds?: string[];
  lockedIds?: string[];
  empty?: string;
}) {
  const { locale } = useLocale();
  const isHighlighted = (id: string) => highlightedIds?.includes(id) ?? false;
  const isLocked = (id: string) => lockedIds?.includes(id) ?? false;
  // When some cards in a zone are highlighted, the rest step back.
  const hasHighlight = (highlightedIds?.length ?? 0) > 0;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <div className="text-label uppercase tracking-[0.18em] font-semibold text-ink-soft">
          {locale === 'ko' ? labelKo : labelEn}
        </div>
        <div className="text-label text-ink-soft">{locale === 'ko' ? helpKo : helpEn}</div>
      </div>
      {cardIds.length === 0 ? (
        <div className="rounded-md bg-ink/5 px-3 py-6 text-center text-label text-ink-soft">
          {empty}
        </div>
      ) : (
        <div className="flex flex-wrap gap-x-1.5 gap-y-4">
          <AnimatePresence mode="popLayout">
            {cardIds.map((id) => (
              <StageMiniCard
                key={id}
                id={id}
                highlighted={isHighlighted(id)}
                dimmed={hasHighlight && !isHighlighted(id)}
                locked={isLocked(id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function StageMiniCard({
  id,
  highlighted,
  dimmed,
  locked,
}: {
  id: string;
  highlighted?: boolean;
  dimmed?: boolean;
  locked?: boolean;
}) {
  const card = cardById(id);
  return (
    <motion.div
      layout
      layoutId={`flow-${id}`}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: locked ? 0.6 : dimmed ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      className="relative aspect-[2/3] w-14 sm:w-16"
    >
      <HwatuCardImage card={card} className="absolute inset-0 w-full h-full" />
      {locked && (
        <div className="absolute top-0.5 right-0.5 bg-plum text-surface rounded-full p-0.5">
          <Lock className="size-2.5" />
        </div>
      )}
      {highlighted && (
        <span
          aria-hidden
          className="absolute -bottom-3 left-1/2 size-2 -translate-x-1/2 rounded-full bg-plum"
        />
      )}
    </motion.div>
  );
}

function DeckPile({ count, flipped }: { count: number; flipped?: string }) {
  const { locale } = useLocale();
  const flippedCard = flipped ? cardById(flipped) : null;

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="text-label uppercase tracking-[0.18em] font-semibold text-ink-soft">
        {locale === 'ko' ? '더미' : 'Deck'}
      </div>
      <div className="relative h-24 w-16 sm:w-[72px]">
        <div className="absolute inset-0 rounded-md overflow-hidden" aria-hidden>
          <HwatuCardBack className="absolute inset-0 w-full h-full" />
        </div>
        <div className="absolute inset-x-0 -bottom-5 text-center text-label tabular-nums text-ink-soft">
          ×{count}
        </div>
        <AnimatePresence>
          {flippedCard && (
            <motion.div
              key={flippedCard.id}
              layoutId={`flow-${flippedCard.id}`}
              initial={{ opacity: 0, x: 0, rotateY: 180, scale: 0.9 }}
              animate={{ opacity: 1, x: 80, rotateY: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                type: 'spring',
                stiffness: 240,
                damping: 22,
              }}
              style={{ zIndex: 50 }}
              className="absolute inset-0"
            >
              <HwatuCardImage card={flippedCard} className="absolute inset-0 w-full h-full" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function BonusPiBadge({ count }: { count?: number }) {
  const { locale } = useLocale();
  return (
    <AnimatePresence>
      {count && count > 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 360, damping: 22 }}
          className="rounded-md bg-gold px-3 py-2 text-label text-on-fill self-center"
        >
          <div className="font-semibold tabular-nums">
            +{count} {locale === 'ko' ? '피 (보너스)' : 'pi (bonus)'}
          </div>
          <div className="text-label mt-0.5">
            {locale === 'ko' ? '상대 한 명당 한 장씩' : 'from each opponent'}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
