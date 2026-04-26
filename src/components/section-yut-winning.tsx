"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, RotateCcw, Trophy } from "lucide-react";
import { Button } from "@heroui/react";
import { useLocale } from "@/contexts/locale-context";
import { YutBoard, type PieceState } from "@/components/yut-board";

type WinState = {
  pieces: ReadonlyArray<PieceState>;
  /** Number of pieces home (used for the progress display). */
  homed: number;
  /** True on the final winning step. */
  won?: boolean;
};

type Step = {
  id: string;
  title: string;
  titleKo: string;
  desc: string;
  descKo: string;
  state: WinState;
};

/* -------------------------------------------------------------------------- */
/* Steps — P1's 4 pieces gradually reaching home                              */
/* -------------------------------------------------------------------------- */

// Convenience: each non-home piece is on the board somewhere mid-journey.
const STEPS: Step[] = [
  {
    id: "start",
    title: "Each player has 4 pieces",
    titleKo: "각자 말 4개로 시작",
    desc:
      "Yutnori is a race: bring all four of your pieces home to win. Pieces start stacked at 출발 (start).",
    descKo:
      "윷놀이는 경주예요. 자신의 말 4개를 모두 출발점으로 돌려보내면 승리. 처음엔 출발점에 4개가 함께 놓여있어요.",
    state: {
      pieces: [
        { id: "a", history: [], player: "p1", stack: 4 },
      ],
      homed: 0,
    },
  },
  {
    id: "first-home",
    title: "First piece reaches home",
    titleKo: "첫 말이 골인",
    desc:
      "After several turns, P1's first piece completes a full lap and returns to start. 1 of 4 done — three more to go.",
    descKo:
      "여러 차례 만에 P1의 첫 말이 한 바퀴를 돌아 출발점으로 돌아왔어요. 1/4 완료 — 세 개 남음.",
    state: {
      pieces: [
        { id: "a", history: ["start"], player: "p1", completed: true },
        { id: "b", history: ["o-r4", "o-r3", "o-r2", "o-r1"], player: "p1" },
        { id: "c", history: ["o-r4", "o-r3"], player: "p1" },
        { id: "d", history: [], player: "p1" },
      ],
      homed: 1,
    },
  },
  {
    id: "second-home",
    title: "Second piece — halfway",
    titleKo: "둘째 말 — 절반",
    desc:
      "P1 takes a shortcut from NE and brings the second piece home. 2 of 4. Strategy is paying off.",
    descKo:
      "P1이 NE 코너에서 지름길을 타서 둘째 말도 골인. 2/4. 전략이 효과를 보고 있어요.",
    state: {
      pieces: [
        { id: "a", history: ["start"], player: "p1", completed: true, stack: 2 },
        { id: "c", history: ["o-r4", "o-r3", "o-r2", "o-r1", "ne", "o-t4"], player: "p1" },
        { id: "d", history: ["o-r4", "o-r3"], player: "p1" },
      ],
      homed: 2,
    },
  },
  {
    id: "third-home",
    title: "Third piece — one to go",
    titleKo: "셋째 말 — 마지막 하나 남음",
    desc:
      "Three pieces home. The last piece is on the bottom row, almost there.",
    descKo:
      "세 말이 골인. 마지막 말이 바닥 row에 있고, 거의 다 왔어요.",
    state: {
      pieces: [
        { id: "abc", history: ["start"], player: "p1", completed: true, stack: 3 },
        { id: "d", history: ["o-r4", "o-r3", "o-r2", "o-r1", "ne", "o-t4", "o-t3", "o-t2", "o-t1", "nw", "o-l4", "o-l3", "o-l2", "o-l1", "sw", "o-b4", "o-b3"], player: "p1" },
      ],
      homed: 3,
    },
  },
  {
    id: "won",
    title: "All 4 home — P1 wins!",
    titleKo: "4말 모두 골인 — P1 승!",
    desc:
      "The fourth piece crosses the finish line. P1 wins the round. 게임 끝!",
    descKo:
      "마지막 말도 골인. P1이 이번 라운드 승리. 끝!",
    state: {
      pieces: [
        { id: "abcd", history: ["start"], player: "p1", completed: true, stack: 4 },
      ],
      homed: 4,
      won: true,
    },
  },
];

/* -------------------------------------------------------------------------- */
/* Section component                                                           */
/* -------------------------------------------------------------------------- */

export function SectionYutWinning() {
  const { locale } = useLocale();
  const [stepIndex, setStepIndex] = useState<number>(0);
  const step = STEPS[stepIndex];

  const goPrev = () => setStepIndex((i) => Math.max(0, i - 1));
  const goNext = () =>
    setStepIndex((i) => Math.min(STEPS.length - 1, i + 1));
  const restart = () => setStepIndex(0);

  return (
    <section
      id="yut-winning"
      className="relative py-24 border-t border-foreground/10"
    >
      <div className="lg:ml-72">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-16">
      <div className="text-xs tabular-nums text-foreground/50 mb-4">
        SECTION 05
      </div>
      <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6">
        {locale === "ko" ? "이기는 법" : "How to win"}
      </h2>
      <p className="text-lg text-foreground/60 max-w-2xl leading-relaxed mb-12">
        {locale === "ko"
          ? "내 말 4개를 모두 한 바퀴 돌려 출발점으로 돌아오게 만들면 이겨요. 빠르게 갈 수도 있고, 잡고 업으면서 더 빨리 갈 수도 있죠."
          : "Bring all four of your pieces around the board and back home to win. Catch opponents and stack your own pieces to speed up."}
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
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Stage                                                                       */
/* -------------------------------------------------------------------------- */

function Stage({ state }: { state: WinState }) {
  const { locale } = useLocale();

  return (
    <div className="rounded-xl border border-foreground/10 bg-foreground/[0.02] p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <ProgressMeter homed={state.homed} />
        <AnimatePresence>
          {state.won && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 8 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 360, damping: 22 }}
              className="inline-flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/40"
            >
              <Trophy className="size-4" />
              {locale === "ko" ? "P1 승리!" : "P1 wins!"}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="rounded-lg overflow-hidden ring-1 ring-foreground/10">
        <YutBoard pieces={state.pieces} />
      </div>
    </div>
  );
}

function ProgressMeter({ homed }: { homed: number }) {
  const { locale } = useLocale();
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] uppercase tracking-[0.18em] font-semibold text-foreground/50">
        {locale === "ko" ? "골인" : "Home"}
      </span>
      <div className="flex items-center gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className={`size-3 rounded-full border-2 transition-colors ${
              i < homed
                ? "bg-amber-500 border-amber-700"
                : "bg-transparent border-foreground/25"
            }`}
            animate={{
              scale: i === homed - 1 ? [1, 1.4, 1] : 1,
            }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>
      <span className="text-sm font-semibold tabular-nums">
        {homed} / 4
      </span>
    </div>
  );
}
