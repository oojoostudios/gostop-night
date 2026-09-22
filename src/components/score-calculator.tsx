'use client';

import { useCallback, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight, RotateCcw, Trophy } from 'lucide-react';
import { Button } from '@heroui/react';
import { useLocale } from '@/contexts/locale-context';
import { ScoreCardArt } from '@/components/score-card';
import { PlayersSwitch } from '@/components/players-switch';
import { HWATU_DECK, HWATU_TYPES, type HwatuCard, type HwatuType } from '@/lib/hwatu';
import { computeScore, SAKE_CUP_ID } from '@/lib/score';
import { callThreshold } from '@/config/rules';
import { usePlayers } from '@/lib/use-players';
import { setPendingScore } from '@/lib/use-pending-score';

const TYPE_ORDER: ReadonlyArray<HwatuType> = ['gwang', 'tti', 'kkeut', 'pi'];

// Card-type dot colors (globals.css): each gets a 1px ink ring via `.type-dot`.
const TYPE_DOT: Record<HwatuType, string> = {
  gwang: 'type-dot bg-type-bright',
  tti: 'type-dot bg-type-ribbon',
  kkeut: 'type-dot bg-type-animal',
  pi: 'type-dot bg-type-junk',
};

const cardsOfType = (type: HwatuType): HwatuCard[] => HWATU_DECK.filter((c) => c.type === type);

export function ScoreCalculator() {
  const { locale } = useLocale();
  const ko = locale === 'ko';
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { players } = usePlayers();
  const threshold = callThreshold(players);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);
  const reset = useCallback(() => setSelected(new Set()), []);

  // The sake cup (9월 술잔) is counted whichever way scores higher: as an Animal, or
  // as 2 Junk. Both are computed and the better one wins.
  const score = useMemo(() => {
    const asAnimal = computeScore(selected, { sakeCupAsJunk: false });
    if (!selected.has(SAKE_CUP_ID)) return { ...asAnimal, sakeAsJunk: false };
    const asJunk = computeScore(selected, { sakeCupAsJunk: true });
    return asJunk.total > asAnimal.total
      ? { ...asJunk, sakeAsJunk: true }
      : { ...asAnimal, sakeAsJunk: false };
  }, [selected]);

  const canCall = score.total >= threshold;

  return (
    <div className="mt-20 border-t border-hairline pt-14">
      <h3 className="font-display text-sub mb-1">
        {ko ? '점수 계산기' : 'Score calculator'}
        <span className="ml-2 font-display text-ink-soft">
          {ko ? 'Score calculator' : '점수 계산기'}
        </span>
      </h3>
      <p className="mb-4 max-w-2xl text-body text-ink-soft leading-relaxed">
        {ko
          ? '가져온 카드를 탭해서 선택해보세요. 점수가 실시간으로 계산돼요.'
          : 'Tap the cards someone has captured. The total updates as you go.'}
      </p>

      <PlayersSwitch />

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px] lg:items-start">
        <div className="club-card space-y-5 p-5 sm:p-6">
          {TYPE_ORDER.map((type) => (
            <PickerGroup key={type} type={type} selected={selected} onToggle={toggle} />
          ))}
        </div>

        <div className="lg:sticky lg:top-8">
          <TotalPanel
            score={score}
            threshold={threshold}
            canCall={canCall}
            sakeSelected={selected.has(SAKE_CUP_ID)}
            onReset={reset}
          />
        </div>
      </div>
    </div>
  );
}

function PickerGroup({
  type,
  selected,
  onToggle,
}: {
  type: HwatuType;
  selected: Set<string>;
  onToggle: (id: string) => void;
}) {
  const { locale } = useLocale();
  const ko = locale === 'ko';
  const meta = HWATU_TYPES[type];
  const cards = cardsOfType(type);
  const count = cards.filter((c) => selected.has(c.id)).length;

  return (
    <div className="border-t border-hairline pt-5 first:border-t-0 first:pt-0">
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 font-bold">
          <span aria-hidden className={`size-2.5 rounded-full ${TYPE_DOT[type]}`} />
          {ko ? meta.labelKo : meta.label} {ko ? meta.label : meta.labelKo}
        </span>
        <span className="text-label text-ink-soft tabular-nums">
          {count} / {cards.length}
        </span>
      </div>
      <div className="grid max-w-[420px] grid-cols-5 gap-2 md:max-w-none md:[grid-template-columns:repeat(auto-fill,68px)]">
        {cards.map((card) => {
          const pressed = selected.has(card.id);
          return (
            <motion.button
              key={card.id}
              type="button"
              aria-pressed={pressed}
              onClick={() => onToggle(card.id)}
              whileTap={{ scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              className="rounded-[6px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum"
            >
              <span
                className={`block rounded-[5px] transition-transform ${
                  pressed ? '-translate-y-0.5 outline-2 outline-plum outline-offset-2' : ''
                }`}
              >
                <ScoreCardArt card={card} ko={ko} showMonth={false} />
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function TotalPanel({
  score,
  threshold,
  canCall,
  sakeSelected,
  onReset,
}: {
  score: ReturnType<typeof computeScore> & { sakeAsJunk: boolean };
  threshold: number;
  canCall: boolean;
  sakeSelected: boolean;
  onReset: () => void;
}) {
  const { locale } = useLocale();
  const ko = locale === 'ko';
  const reduceMotion = useReducedMotion();

  const useScore = () => {
    setPendingScore(score.total);
    document
      .getElementById('section-tonight')
      ?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  };

  // The breakdown lines shown under the total: brights/ribbons/animals/junk that scored
  // (their base count, not counting combo bonuses — those get their own line below),
  // plus each active combo, plus a note on how the sake cup was counted.
  const comboPoints = (type: HwatuType) =>
    score.combos
      .filter((c) => (c.id === 'godori') === (type === 'kkeut'))
      .reduce((sum, c) => sum + c.points, 0);

  const lines: { label: string; value: string }[] = [];
  (['gwang', 'tti', 'kkeut', 'pi'] as const).forEach((type) => {
    const points = score.breakdown[type] - comboPoints(type);
    const count = type === 'pi' ? score.piEffective : score.counts[type];
    if (points <= 0 || count === 0) return;
    const meta = HWATU_TYPES[type];
    lines.push({ label: `${count} ${ko ? meta.labelKo : meta.label}`, value: String(points) });
  });
  score.combos.forEach((c) => {
    lines.push({ label: ko ? c.labelKo : c.label, value: `+${c.points}` });
  });

  return (
    <div className="club-card p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-label text-ink-soft">{ko ? '총점' : 'Total'}</span>
        <span className="relative h-[1em] overflow-hidden text-num">
          <span aria-hidden className="invisible">
            {score.total}
          </span>
          <AnimatePresence mode="sync" initial={false}>
            <motion.span
              key={score.total}
              initial={{ y: '60%', opacity: 0 }}
              animate={{ y: '0%', opacity: 1 }}
              exit={{ y: '-60%', opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
              className="absolute inset-0 flex items-baseline"
              aria-live="polite"
            >
              {score.total}
            </motion.span>
          </AnimatePresence>
        </span>
      </div>

      <AnimatePresence>
        {canCall && (
          <motion.p
            key="canstop"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-2.5 flex items-center gap-1.5 text-label font-medium text-ink"
          >
            <Trophy className="size-3.5 shrink-0" aria-hidden />
            {ko
              ? `고 또는 스톱을 부를 수 있어요 (${threshold}점+)`
              : `You can call Go or Stop (${threshold}+ points).`}
          </motion.p>
        )}
        {!canCall && (
          <motion.p
            key="needmore"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-2.5 text-label text-ink-soft"
          >
            {ko
              ? `${threshold - score.total}점 더 있어야 고/스톱을 부를 수 있어요.`
              : `${threshold - score.total} more point${threshold - score.total === 1 ? '' : 's'} to call Go or Stop.`}
          </motion.p>
        )}
      </AnimatePresence>

      {lines.length > 0 && (
        <ul className="mt-4 space-y-1.5 border-t border-hairline pt-4 text-label">
          {lines.map((l) => (
            <li key={l.label} className="flex items-center justify-between gap-3">
              <span className="text-ink-soft">{l.label}</span>
              <span className="font-bold tabular-nums">{l.value}</span>
            </li>
          ))}
          {sakeSelected && (
            <li className="flex items-center justify-between gap-3">
              <span className="text-ink-soft">
                {ko ? '9월 술잔은' : 'Sake cup counted as'}{' '}
                {score.sakeAsJunk ? (ko ? '쌍피 (피 2장)' : '2 Junk') : ko ? '열' : 'an Animal'}
              </span>
            </li>
          )}
        </ul>
      )}

      <Button
        variant="primary"
        size="sm"
        onPress={useScore}
        isDisabled={score.total === 0}
        className="mt-5 w-full justify-center gap-2 text-label"
      >
        {ko ? '이 점수로 게임 타임 기록하기' : 'Use this score in Game Time'}
        <ArrowRight className="size-3.5" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onPress={onReset}
        isDisabled={score.total === 0}
        className="mt-2 w-full justify-center gap-2 text-label"
      >
        <RotateCcw className="size-3.5" />
        {ko ? '카드 지우기' : 'Clear cards'}
      </Button>
    </div>
  );
}
