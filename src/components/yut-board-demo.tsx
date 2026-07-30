'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Dices, Plus, RotateCcw, Trophy } from 'lucide-react';
import { Button } from '@heroui/react';
import { useLocale } from '@/contexts/locale-context';
import { YutBoard, type PieceState } from '@/components/yut-board';
import { getNext, getStation, type PathChoice } from '@/lib/yut-board';
import { resolveThrow, type ThrowKind } from '@/lib/yutnori';

export function YutBoardDemo() {
  const { locale } = useLocale();

  const [history, setHistory] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [pendingChoice, setPendingChoice] = useState<PathChoice | null>(null);
  const [lastThrow, setLastThrow] = useState<ThrowKind | null>(null);
  const [bonusReady, setBonusReady] = useState(false);
  /** Remaining steps from the current throw (paused while a choice is pending). */
  const [remainingSteps, setRemainingSteps] = useState(0);
  /** Direction chosen at a choice point — consumed as the first step of the next throw. */
  const [chosenDirection, setChosenDirection] = useState<string | null>(null);

  const currentStation = history.length === 0 ? 'start' : history[history.length - 1];

  const advancePiece = (
    startPos: string,
    steps: number,
    currentHistory: string[],
    firstNext?: string,
  ) => {
    const newSteps: string[] = [];
    let pos = startPos;
    let stepsLeft = steps;
    let choice: PathChoice | null = null;

    for (let i = 0; i < stepsLeft; i++) {
      let next: string | null;
      if (i === 0 && firstNext) {
        next = firstNext;
      } else {
        const result = getNext(pos, [...currentHistory, ...newSteps], true);
        next = result.next;
      }
      if (!next) break;
      newSteps.push(next);
      pos = next;
      if (pos === 'start' && (currentHistory.length > 0 || newSteps.length > 1)) break;
    }

    if (!choice) {
      const finalCheck = getNext(pos, [...currentHistory, ...newSteps]);
      if (finalCheck.choice) {
        choice = finalCheck.choice;
        stepsLeft = 0;
      }
    }

    return { newSteps, finalPos: pos, choice, stepsLeft };
  };

  const applyMove = (
    newSteps: string[],
    finalPos: string,
    choice: PathChoice | null,
    stepsLeft: number,
    throwResult: ThrowKind,
  ) => {
    const prevHistory = [...history];
    setHistory((h) => [...h, ...newSteps]);

    const isFinished = finalPos === 'start' && prevHistory.length > 0;

    const animDelay = 320 * newSteps.length + 80;
    window.setTimeout(() => {
      if (isFinished) {
        setFinished(true);
        setBonusReady(false);
        setRemainingSteps(0);
      } else if (choice) {
        setPendingChoice(choice);
        setRemainingSteps(stepsLeft);
      } else {
        setRemainingSteps(0);
      }
      setBonusReady(throwResult.extraThrow ?? false);
      setRolling(false);
    }, animDelay);
  };

  const onThrow = () => {
    if (rolling || finished || pendingChoice) return;
    setRolling(true);

    const sticks = Array.from({ length: 4 }, () => Math.random() < 0.5);
    const result = resolveThrow(sticks);
    setLastThrow(result);

    const dir = chosenDirection;
    if (dir) setChosenDirection(null);

    const { newSteps, finalPos, choice, stepsLeft } = advancePiece(
      currentStation,
      result.move,
      history,
      dir ?? undefined,
    );

    applyMove(newSteps, finalPos, choice, stepsLeft, result);
  };

  const resolveChoice = (chosenNextStation: string) => {
    if (!pendingChoice) return;
    setPendingChoice(null);

    if (remainingSteps === 0) {
      setChosenDirection(chosenNextStation);
      return;
    }

    setRolling(true);
    const prevHistory = [...history];
    const steps = remainingSteps - 1;
    const firstStep = [chosenNextStation];

    const { newSteps, finalPos, choice, stepsLeft } = advancePiece(chosenNextStation, steps, [
      ...prevHistory,
      chosenNextStation,
    ]);

    const allNewSteps = [...firstStep, ...newSteps];
    setHistory((h) => [...h, ...allNewSteps]);
    const isFinished = finalPos === 'start' && prevHistory.length > 0;

    const animDelay = 320 * allNewSteps.length + 80;
    window.setTimeout(() => {
      if (isFinished) {
        setFinished(true);
        setBonusReady(false);
        setRemainingSteps(0);
      } else if (choice) {
        setPendingChoice(choice);
        setRemainingSteps(stepsLeft);
      } else {
        setRemainingSteps(0);
      }
      setRolling(false);
    }, animDelay);
  };

  const reset = () => {
    setHistory([]);
    setFinished(false);
    setRolling(false);
    setPendingChoice(null);
    setLastThrow(null);
    setBonusReady(false);
    setRemainingSteps(0);
    setChosenDirection(null);
  };

  const piece: PieceState = { history };

  const stationLabel = (() => {
    const s = getStation(currentStation);
    if (s.nameKo) return locale === 'ko' ? s.nameKo : (s.nameEn ?? s.id);
    return locale === 'ko' ? `${s.id}` : s.id;
  })();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 items-start">
      <div className="rounded-xl overflow-hidden ring-1 ring-foreground/10 shadow-sm">
        <YutBoard piece={piece} />
      </div>

      <div className="space-y-5">
        {/* Status row */}
        <div className="grid grid-cols-3 gap-2">
          <Stat
            label={locale === 'ko' ? '현재 자리' : 'Now at'}
            value={stationLabel}
            highlight={!!finished}
          />
          <Stat label={locale === 'ko' ? '이동 거리' : 'Distance'} value={String(history.length)} />
          <Stat
            label={locale === 'ko' ? '마지막' : 'Last'}
            value={lastThrow ? (locale === 'ko' ? lastThrow.nameKo : lastThrow.nameEn) : '—'}
          />
        </div>

        {/* Last throw reveal */}
        <div className="min-h-12">
          <AnimatePresence mode="wait">
            {lastThrow && !pendingChoice && !finished && (
              <motion.div
                key={`throw-${history.length}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                className={`rounded-md border px-4 py-3 ${
                  bonusReady
                    ? 'border-amber-500/50 bg-amber-500/[0.05]'
                    : 'border-foreground/15 bg-foreground/[0.02]'
                }`}
              >
                <div className="text-xs text-foreground/55">
                  {locale === 'ko' ? `방금: ${lastThrow.nameKo}` : `Rolled: ${lastThrow.nameEn}`}
                </div>
                <div className="text-sm font-semibold tabular-nums">
                  {locale === 'ko'
                    ? `${lastThrow.move > 0 ? '+' : ''}${lastThrow.move}칸`
                    : `${lastThrow.move > 0 ? '+' : ''}${lastThrow.move} step${Math.abs(lastThrow.move) === 1 ? '' : 's'}`}
                  {bonusReady && (
                    <span className="ml-2 inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                      <Plus className="size-2.5" />
                      {locale === 'ko' ? '한 번 더!' : 'extra throw!'}
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Path choice prompt (corner shortcut or center direction) */}
        <AnimatePresence>
          {pendingChoice && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className={`rounded-md border px-4 py-3 ${
                pendingChoice.type === 'corner'
                  ? 'border-sky-500/40 bg-sky-500/5'
                  : 'border-violet-500/40 bg-violet-500/5'
              }`}
            >
              {pendingChoice.type === 'corner' ? (
                <>
                  <div className="text-xs font-semibold text-sky-700 dark:text-sky-400 mb-1">
                    {locale === 'ko' ? '코너에 정확히 멈췄어요!' : 'Landed exactly on a corner!'}
                  </div>
                  <p className="text-xs text-foreground/65 mb-3">
                    {locale === 'ko'
                      ? '지름길로 가운데를 거쳐 가로지를 수 있어요. 갈래요?'
                      : 'You can take the diagonal shortcut through the center. Take it?'}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onPress={() => resolveChoice(pendingChoice.options[0].next)}
                      className="text-xs"
                    >
                      {locale === 'ko' ? '지름길로!' : 'Take shortcut'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onPress={() => resolveChoice(pendingChoice.options[1].next)}
                      className="text-xs"
                    >
                      {locale === 'ko' ? '그냥 외곽' : 'Stay outer'}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-xs font-semibold text-violet-700 dark:text-violet-400 mb-1">
                    {locale === 'ko' ? '가운데(방)에 도착!' : 'Arrived at the center!'}
                  </div>
                  <p className="text-xs text-foreground/65 mb-3">
                    {locale === 'ko'
                      ? '직진할 수도, 방향을 꺾어 다른 대각선으로 갈 수도 있어요.'
                      : 'You can continue straight or turn onto the other diagonal.'}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onPress={() => resolveChoice(pendingChoice.options[1].next)}
                      className="text-xs"
                    >
                      {locale === 'ko' ? '방향 꺾기' : 'Turn'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onPress={() => resolveChoice(pendingChoice.options[0].next)}
                      className="text-xs"
                    >
                      {locale === 'ko' ? '직진' : 'Go straight'}
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Finished celebration */}
        <AnimatePresence>
          {finished && (
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 360, damping: 22 }}
              className="rounded-md border border-amber-500/50 bg-amber-500/10 px-4 py-3 flex items-center gap-3"
            >
              <Trophy className="size-5 text-amber-600 dark:text-amber-400" />
              <div>
                <div className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                  {locale === 'ko' ? '골인! 한 바퀴 완주' : 'Home! Round complete'}
                </div>
                <div className="text-xs text-foreground/60">
                  {locale === 'ko'
                    ? `총 ${history.length}자리를 거쳤어요.`
                    : `Visited ${history.length} stations along the way.`}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            variant="primary"
            size="md"
            onPress={onThrow}
            isDisabled={rolling || finished || !!pendingChoice}
            className="gap-2"
          >
            <Dices className={`size-4 ${rolling ? 'animate-spin' : ''}`} />
            {finished
              ? locale === 'ko'
                ? '완주!'
                : 'Done'
              : rolling
                ? locale === 'ko'
                  ? '이동 중…'
                  : 'Moving…'
                : bonusReady
                  ? locale === 'ko'
                    ? '보너스 던지기'
                    : 'Bonus throw'
                  : history.length === 0
                    ? locale === 'ko'
                      ? '윷 던지기'
                      : 'Throw the yut'
                    : locale === 'ko'
                      ? '한 번 더 던지기'
                      : 'Throw again'}
          </Button>
          <Button
            variant="ghost"
            size="md"
            onPress={reset}
            isDisabled={rolling || history.length === 0}
            className="gap-1.5 text-xs"
          >
            <RotateCcw className="size-3.5" />
            {locale === 'ko' ? '리셋' : 'Reset'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-md border px-3 py-2 transition-colors ${
        highlight ? 'border-amber-500/50 bg-amber-500/[0.05]' : 'border-foreground/10'
      }`}
    >
      <div
        className={`text-base font-semibold tabular-nums truncate ${
          highlight ? 'text-amber-700 dark:text-amber-400' : ''
        }`}
      >
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-foreground/55 mt-0.5">{label}</div>
    </div>
  );
}
