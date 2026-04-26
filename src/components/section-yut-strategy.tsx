'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, ChevronLeft, ChevronRight, Layers, RotateCcw, Swords } from 'lucide-react';
import { Button } from '@heroui/react';
import { useLocale } from '@/contexts/locale-context';
import { YutBoard, type PieceState } from '@/components/yut-board';
import { getThrow, type ThrowKind } from '@/lib/yutnori';

type StrategyState = {
  pieces: ReadonlyArray<PieceState>;
  /** Highlight banner / event for this step. */
  event?: 'catch' | 'stack' | 'risk-catch';
  /** Last throw shown beside the board, if any. */
  lastThrow?: ThrowKind;
  /** True when an extra throw is owed. */
  bonusPending?: boolean;
};

type Step = {
  id: string;
  title: string;
  titleKo: string;
  desc: string;
  descKo: string;
  state: StrategyState;
};

type Scenario = {
  id: string;
  label: string;
  labelKo: string;
  blurb: string;
  blurbKo: string;
  icon: React.ReactNode;
  steps: ReadonlyArray<Step>;
};

const T_DO = getThrow('do');
const T_GEOL = getThrow('geol');
const T_YUT = getThrow('yut');

/* -------------------------------------------------------------------------- */
/* Scenario 1 — Catching                                                      */
/* -------------------------------------------------------------------------- */

const CATCH_STEPS: Step[] = [
  {
    id: 'setup',
    title: 'P2 is sitting on the path',
    titleKo: 'P2 말이 길목에 있어요',
    desc: "P2's blue piece is parked on o-r3, three spaces from start. P1's red piece is one step behind on o-r4.",
    descKo: 'P2 파란 말이 o-r3(출발에서 3칸)에 있어요. P1 빨간 말은 한 칸 뒤 o-r4에.',
    state: {
      pieces: [
        { id: 'p1', history: ['o-r4'], player: 'p1' },
        { id: 'p2', history: ['o-r4', 'o-r3'], player: 'p2' },
      ],
    },
  },
  {
    id: 'throw',
    title: 'P1 throws — do (1)',
    titleKo: 'P1이 던져서 — 도 (1)',
    desc: 'P1 needs exactly 1 to land where P2 is. Lucky throw — do!',
    descKo: 'P2가 있는 칸까지 정확히 1칸. 운 좋게 도가 나왔어요.',
    state: {
      pieces: [
        { id: 'p1', history: ['o-r4'], player: 'p1' },
        { id: 'p2', history: ['o-r4', 'o-r3'], player: 'p2' },
      ],
      lastThrow: T_DO,
    },
  },
  {
    id: 'land',
    title: 'P1 lands on P2 — catch!',
    titleKo: 'P1이 P2 위에 — 잡기!',
    desc: "P1 moves to o-r3, landing exactly where P2 is. That's a catch (잡기). P2 is sent back to start, and P1 gets a bonus throw.",
    descKo:
      "P1이 o-r3로 이동, P2가 있는 자리. '잡기'예요. P2는 출발점으로 돌아가고, P1은 한 번 더 던질 수 있어요.",
    state: {
      pieces: [
        { id: 'p1', history: ['o-r4', 'o-r3'], player: 'p1' },
        { id: 'p2', history: [], player: 'p2' },
      ],
      event: 'catch',
      lastThrow: T_DO,
      bonusPending: true,
    },
  },
];

/* -------------------------------------------------------------------------- */
/* Scenario 2 — Stacking                                                      */
/* -------------------------------------------------------------------------- */

const STACK_STEPS: Step[] = [
  {
    id: 'setup',
    title: "P1's first piece is ahead",
    titleKo: 'P1의 첫 말이 먼저 가있어요',
    desc: 'P1 piece A is at o-r1 (4 spaces in). Piece B is still at start.',
    descKo: 'P1의 첫 말 A는 o-r1(4칸 전진). 둘째 말 B는 아직 출발점에.',
    state: {
      pieces: [
        { id: 'a', history: ['o-r4', 'o-r3', 'o-r2', 'o-r1'], player: 'p1' },
        { id: 'b', history: [], player: 'p1' },
      ],
    },
  },
  {
    id: 'throw',
    title: 'P1 throws — yut (4)',
    titleKo: 'P1이 던져서 — 윷 (4)',
    desc: "Yut! Move 4 + bonus throw. P1 plans to advance B 4 spaces — exactly to A's spot.",
    descKo: '윷! 4칸 + 보너스. P1은 B를 4칸 전진시키기로 — 마침 A 자리예요.',
    state: {
      pieces: [
        { id: 'a', history: ['o-r4', 'o-r3', 'o-r2', 'o-r1'], player: 'p1' },
        { id: 'b', history: [], player: 'p1' },
      ],
      lastThrow: T_YUT,
      bonusPending: true,
    },
  },
  {
    id: 'approach',
    title: "B advances to A's spot",
    titleKo: 'B가 A 자리까지 전진',
    desc: 'Piece B hops 4 stations and arrives at o-r1, the exact spot where A is. Two same-color pieces sharing one station.',
    descKo: 'B가 4칸 hop hop 해서 A가 있는 o-r1에 도착. 같은 색 말 두 개가 한 자리에.',
    state: {
      pieces: [
        { id: 'a', history: ['o-r4', 'o-r3', 'o-r2', 'o-r1'], player: 'p1' },
        { id: 'b', history: ['o-r4', 'o-r3', 'o-r2', 'o-r1'], player: 'p1' },
      ],
      lastThrow: T_YUT,
      bonusPending: true,
    },
  },
  {
    id: 'merge',
    title: 'Stack! They become one piece',
    titleKo: '업기! 한 덩어리로 합쳐져요',
    desc: 'P1 stacks A and B into a single ×2 piece. From now on they travel together — moved as one but counted as two when they reach home.',
    descKo: 'P1이 A와 B를 업어서 ×2 한 덩어리로. 이동은 한 번에, 골인은 둘 다 인정.',
    state: {
      pieces: [
        {
          id: 'a',
          history: ['o-r4', 'o-r3', 'o-r2', 'o-r1'],
          player: 'p1',
          stack: 2,
        },
      ],
      event: 'stack',
      lastThrow: T_YUT,
      bonusPending: true,
    },
  },
  {
    id: 'bonus',
    title: 'Bonus throw moves the whole stack',
    titleKo: '보너스 던지기로 ×2가 함께 이동',
    desc: "P1's bonus throw is geol (3). The stacked piece advances 3 — both pieces moved at the same cost.",
    descKo: '보너스 던지기는 걸 (3). 업힌 말이 한꺼번에 3칸 — 두 말이 한 번에 이동.',
    state: {
      pieces: [
        {
          id: 'a',
          history: ['o-r4', 'o-r3', 'o-r2', 'o-r1', 'ne', 'o-t4', 'o-t3'],
          player: 'p1',
          stack: 2,
        },
      ],
      event: 'stack',
      lastThrow: T_GEOL,
    },
  },
];

/* -------------------------------------------------------------------------- */
/* Scenario 3 — The risk of stacking                                          */
/* -------------------------------------------------------------------------- */

const RISK_STEPS: Step[] = [
  {
    id: 'setup',
    title: "P1's stack of 2 is exposed",
    titleKo: 'P1의 ×2 말이 노출돼있어요',
    desc: 'P1 has a ×2 stack at o-r1 from a previous turn. P2 is at start, hungry to catch.',
    descKo: 'P1의 ×2 업힌 말이 지난 차례 결과로 o-r1에 있어요. 출발점의 P2가 기회를 노려요.',
    state: {
      pieces: [
        {
          id: 'stack',
          history: ['o-r4', 'o-r3', 'o-r2', 'o-r1'],
          player: 'p1',
          stack: 2,
        },
        { id: 'p2', history: [], player: 'p2' },
      ],
    },
  },
  {
    id: 'throw',
    title: 'P2 throws — yut (4)',
    titleKo: 'P2가 던져서 — 윷 (4)',
    desc: 'P2 rolls yut — exactly the distance from start to o-r1. A devastating roll for P1.',
    descKo: 'P2가 윷 — 출발점에서 o-r1까지 정확히 4칸. P1에겐 최악의 결과예요.',
    state: {
      pieces: [
        {
          id: 'stack',
          history: ['o-r4', 'o-r3', 'o-r2', 'o-r1'],
          player: 'p1',
          stack: 2,
        },
        { id: 'p2', history: [], player: 'p2' },
      ],
      lastThrow: T_YUT,
    },
  },
  {
    id: 'approach',
    title: 'P2 hops 4 spaces onto the stack',
    titleKo: 'P2가 4칸 hop해서 ×2 자리에',
    desc: "P2's piece advances 4 stations and lands right where P1's stack sits. Both colors are momentarily on o-r1.",
    descKo: 'P2가 4칸 전진해서 P1의 ×2가 있는 자리에 도착. 두 색이 잠깐 o-r1에 함께 있어요.',
    state: {
      pieces: [
        {
          id: 'stack',
          history: ['o-r4', 'o-r3', 'o-r2', 'o-r1'],
          player: 'p1',
          stack: 2,
        },
        {
          id: 'p2',
          history: ['o-r4', 'o-r3', 'o-r2', 'o-r1'],
          player: 'p2',
        },
      ],
      lastThrow: T_YUT,
    },
  },
  {
    id: 'catch',
    title: 'Stack caught — both go home',
    titleKo: '업힌 말이 잡힘 — 둘 다 시작점으로',
    desc: 'When a stack is caught, ALL pieces in it return to start at once. The risk of stacking — P2 also earns a bonus throw.',
    descKo:
      '업힌 말이 잡히면 그 안의 모든 말이 한꺼번에 출발점으로. 업기의 위험. P2는 보너스 던지기까지.',
    state: {
      pieces: [
        {
          id: 'stack',
          history: [],
          player: 'p1',
          stack: 2,
        },
        {
          id: 'p2',
          history: ['o-r4', 'o-r3', 'o-r2', 'o-r1'],
          player: 'p2',
        },
      ],
      event: 'risk-catch',
      lastThrow: T_YUT,
      bonusPending: true,
    },
  },
];

const SCENARIOS: ReadonlyArray<Scenario> = [
  {
    id: 'catch',
    label: 'Catch',
    labelKo: '잡기',
    icon: <Swords className="size-3.5" />,
    blurb:
      "Land on an opponent's piece and you send it back to start — plus you get a bonus throw.",
    blurbKo:
      '상대 말 자리에 정확히 멈추면 그 말을 시작점으로 돌려보내고, 한 번 더 던지기 보너스까지.',
    steps: CATCH_STEPS,
  },
  {
    id: 'stack',
    label: 'Stack',
    labelKo: '업기',
    icon: <Layers className="size-3.5" />,
    blurb:
      'Land on your own piece to stack them. The stack moves as one — efficient for racing home.',
    blurbKo:
      '내 말 위에 떨어지면 업을 수 있어요. 업힌 말은 한 덩어리로 다녀서, 함께 빨리 골인할 수 있어요.',
    steps: STACK_STEPS,
  },
  {
    id: 'risk',
    label: 'Risk',
    labelKo: '위험',
    icon: <AlertTriangle className="size-3.5" />,
    blurb: 'Stacking concentrates risk: if the stack gets caught, ALL pieces go home at once.',
    blurbKo: '업기엔 위험도 따라요. 업힌 말이 잡히면 그 안의 말 모두가 한꺼번에 출발점으로.',
    steps: RISK_STEPS,
  },
];

/* -------------------------------------------------------------------------- */
/* Section component                                                           */
/* -------------------------------------------------------------------------- */

export function SectionYutStrategy() {
  const { locale } = useLocale();
  const [scenarioId, setScenarioId] = useState<string>('catch');
  const [stepIndex, setStepIndex] = useState<number>(0);

  const scenario = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0];
  const step = scenario.steps[stepIndex];

  const switchScenario = (id: string) => {
    setScenarioId(id);
    setStepIndex(0);
  };
  const goPrev = () => setStepIndex((i) => Math.max(0, i - 1));
  const goNext = () => setStepIndex((i) => Math.min(scenario.steps.length - 1, i + 1));
  const restart = () => setStepIndex(0);

  return (
    <section id="yut-strategy" className="relative py-24 border-t border-foreground/10">
      <div className="lg:ml-72">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-16">
          <div className="text-xs tabular-nums text-foreground/50 mb-4">SECTION 04</div>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6">
            {locale === 'ko' ? '잡기와 업기' : 'Catching and stacking'}
          </h2>
          <p className="text-lg text-foreground/60 max-w-2xl leading-relaxed mb-8">
            {locale === 'ko'
              ? '윷놀이의 전략 핵심. 상대를 잡으면 보너스를, 내 말을 업으면 효율을. 단, 업힌 말이 잡히면 손실이 커져요.'
              : 'The strategic heart of yutnori. Catching opponents earns bonus throws; stacking your own pieces moves them efficiently. The catch (pun intended): a captured stack loses everyone at once.'}
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => switchScenario(s.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm transition-colors ${
                  scenario.id === s.id
                    ? 'bg-foreground text-background font-medium'
                    : 'bg-foreground/5 text-foreground/70 hover:bg-foreground/10 hover:text-foreground'
                }`}
              >
                {s.icon}
                {locale === 'ko' ? s.labelKo : s.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.p
              key={scenario.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              className="text-sm text-foreground/55 mb-8 max-w-2xl leading-relaxed"
            >
              {locale === 'ko' ? scenario.blurbKo : scenario.blurb}
            </motion.p>
          </AnimatePresence>

          <Stage state={step.state} />

          <div className="mt-8 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-start">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${scenario.id}-${step.id}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
              >
                <h3 className="text-xl font-semibold tracking-tight mb-2">
                  {locale === 'ko' ? step.titleKo : step.title}
                </h3>
                <p className="text-sm text-foreground/70 leading-relaxed max-w-2xl">
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
                isDisabled={stepIndex === scenario.steps.length - 1}
              >
                {locale === 'ko' ? '다음' : 'Next'}
                <ChevronRight className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onPress={restart}
                isDisabled={stepIndex === 0}
                className="gap-1"
              >
                <RotateCcw className="size-3.5" />
              </Button>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2">
            {scenario.steps.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStepIndex(i)}
                aria-label={`Go to step ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === stepIndex
                    ? 'w-8 bg-foreground'
                    : i < stepIndex
                      ? 'w-4 bg-foreground/40'
                      : 'w-4 bg-foreground/15 hover:bg-foreground/30'
                }`}
              />
            ))}
            <span className="ml-3 text-xs tabular-nums text-foreground/50">
              {stepIndex + 1} / {scenario.steps.length}
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

function Stage({ state }: { state: StrategyState }) {
  const { locale } = useLocale();

  return (
    <div className="rounded-xl border border-foreground/10 bg-foreground/[0.02] p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <ThrowBadge throwKind={state.lastThrow} bonusPending={state.bonusPending} />
        <EventBadge event={state.event} />
      </div>

      <div className="rounded-lg overflow-hidden ring-1 ring-foreground/10">
        <YutBoard pieces={state.pieces} />
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4">
        <Legend color="#dc2626" label={locale === 'ko' ? 'P1 (빨강)' : 'P1 (red)'} />
        <Legend color="#2563eb" label={locale === 'ko' ? 'P2 (파랑)' : 'P2 (blue)'} />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-foreground/55">
      <span className="size-3 rounded-full" style={{ backgroundColor: color }} aria-hidden />
      {label}
    </div>
  );
}

function ThrowBadge({
  throwKind,
  bonusPending,
}: {
  throwKind?: ThrowKind;
  bonusPending?: boolean;
}) {
  const { locale } = useLocale();
  if (!throwKind) {
    return (
      <div className="text-xs text-foreground/40 italic">
        {locale === 'ko' ? '준비 단계' : 'Setup'}
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-baseline gap-1.5">
        <span className="text-base font-semibold tracking-tight">
          {locale === 'ko' ? throwKind.nameKo : throwKind.nameEn}
        </span>
        <span className="text-xs text-foreground/55 tabular-nums">
          {throwKind.move > 0 ? `+${throwKind.move}` : throwKind.move}
          {locale === 'ko' ? '칸' : ''}
        </span>
      </div>
      {bonusPending && (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
          {locale === 'ko' ? '보너스' : 'bonus'}
        </span>
      )}
    </div>
  );
}

function EventBadge({ event }: { event?: StrategyState['event'] }) {
  const { locale } = useLocale();
  if (!event) return null;

  const config = {
    catch: {
      labelKo: '잡았어요!',
      labelEn: 'Caught!',
      cls: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/40',
      icon: <Swords className="size-3" />,
    },
    stack: {
      labelKo: '업었어요',
      labelEn: 'Stacked',
      cls: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/40',
      icon: <Layers className="size-3" />,
    },
    'risk-catch': {
      labelKo: '업힌 말 잡힘!',
      labelEn: 'Stack caught!',
      cls: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/40',
      icon: <AlertTriangle className="size-3" />,
    },
  }[event];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 360, damping: 22 }}
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${config.cls}`}
    >
      {config.icon}
      {locale === 'ko' ? config.labelKo : config.labelEn}
    </motion.div>
  );
}
