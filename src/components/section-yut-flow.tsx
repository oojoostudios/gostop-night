"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Plus, RotateCcw } from "lucide-react";
import { Button } from "@heroui/react";
import { useLocale } from "@/contexts/locale-context";
import { YutBoard, type PieceState } from "@/components/yut-board";
import { THROWS, type ThrowKind } from "@/lib/yutnori";

type Player = "p1" | "p2";

type FlowState = {
  /** Visited stations of P1's moving piece. */
  pieceHistory: ReadonlyArray<string>;
  whoseTurn: Player;
  lastThrow?: ThrowKind;
  /** True when 윷/모 just rolled, an extra throw is pending. */
  bonusPending?: boolean;
};

type Step = {
  id: string;
  title: string;
  titleKo: string;
  desc: string;
  descKo: string;
  state: FlowState;
};

type Scenario = {
  id: string;
  label: string;
  labelKo: string;
  blurb: string;
  blurbKo: string;
  steps: ReadonlyArray<Step>;
};

const T_DO = THROWS.find((t) => t.id === "do")!;
const T_GAE = THROWS.find((t) => t.id === "gae")!;
const T_YUT = THROWS.find((t) => t.id === "yut")!;

/* -------------------------------------------------------------------------- */
/* Scenarios                                                                   */
/* -------------------------------------------------------------------------- */

const NORMAL_STEPS: Step[] = [
  {
    id: "setup",
    title: "Players sit down",
    titleKo: "둘러앉아요",
    desc:
      "Each player gets 4 pieces stacked at start (출발). P1 (red) throws first.",
    descKo:
      "각 플레이어가 4개의 말을 출발점에 두고 앉아요. P1(빨강)이 먼저 던져요.",
    state: { pieceHistory: [], whoseTurn: "p1" },
  },
  {
    id: "throw",
    title: "P1 throws — gae",
    titleKo: "P1이 던져서 — 개",
    desc:
      "Two sticks land flat-up: gae (개). Move 2 spaces forward.",
    descKo:
      "막대 두 개가 평평한 면이 위로 — '개'. 2칸 전진할 수 있어요.",
    state: { pieceHistory: [], whoseTurn: "p1", lastThrow: T_GAE },
  },
  {
    id: "choose",
    title: "Choose a piece",
    titleKo: "말 하나를 골라요",
    desc:
      "P1 picks one of their 4 pieces to move. (Strategy comes later — for now, just pick any.)",
    descKo:
      "P1이 4개의 말 중 하나를 골라요. (전략은 나중 — 일단 아무거나 골라봐요.)",
    state: { pieceHistory: [], whoseTurn: "p1", lastThrow: T_GAE },
  },
  {
    id: "move",
    title: "Move 2 spaces counterclockwise",
    titleKo: "시계 반대방향으로 2칸",
    desc:
      "The chosen piece walks two stations along the outer ring. Always counterclockwise.",
    descKo:
      "고른 말이 외곽길을 따라 2칸 움직여요. 항상 시계 반대방향.",
    state: {
      pieceHistory: ["o-r4", "o-r3"],
      whoseTurn: "p1",
      lastThrow: T_GAE,
    },
  },
  {
    id: "pass",
    title: "Turn passes to P2",
    titleKo: "P2 차례로 넘어가요",
    desc:
      "No bonus on gae, so P1's turn ends. P2 (blue) throws next.",
    descKo:
      "개에는 보너스가 없어서 P1의 차례가 끝나요. 이제 P2(파랑)가 던져요.",
    state: {
      pieceHistory: ["o-r4", "o-r3"],
      whoseTurn: "p2",
      lastThrow: T_GAE,
    },
  },
];

const BONUS_STEPS: Step[] = [
  {
    id: "setup",
    title: "P1's turn begins",
    titleKo: "P1의 차례 시작",
    desc: "Same starting layout. P1 throws.",
    descKo: "처음과 같은 배치. P1이 던져요.",
    state: { pieceHistory: [], whoseTurn: "p1" },
  },
  {
    id: "throw-yut",
    title: "P1 throws — yut!",
    titleKo: "P1이 던져서 — 윷!",
    desc:
      "All four sticks flat-up: yut (윷). Move 4 spaces AND throw again — that's the bonus.",
    descKo:
      "네 막대 모두 평평한 면이 위 — '윷'. 4칸 + 한 번 더 던지기 보너스!",
    state: {
      pieceHistory: [],
      whoseTurn: "p1",
      lastThrow: T_YUT,
      bonusPending: true,
    },
  },
  {
    id: "move-4",
    title: "Move 4 spaces",
    titleKo: "4칸 이동",
    desc:
      "P1 moves a piece 4 stations. Now they get to throw again before passing.",
    descKo:
      "P1의 말이 4칸 전진. 차례를 넘기기 전에 한 번 더 던질 수 있어요.",
    state: {
      pieceHistory: ["o-r4", "o-r3", "o-r2", "o-r1"],
      whoseTurn: "p1",
      lastThrow: T_YUT,
      bonusPending: true,
    },
  },
  {
    id: "bonus-throw",
    title: "Bonus throw — do",
    titleKo: "보너스 던지기 — 도",
    desc:
      "Bonus throw lands as do (도). Move 1 more space. (Could have been another yut/mo and chained again!)",
    descKo:
      "보너스 던지기 결과는 도. 1칸 더 이동. (또 윷/모면 또 한 번 더 가능해요.)",
    state: {
      pieceHistory: ["o-r4", "o-r3", "o-r2", "o-r1"],
      whoseTurn: "p1",
      lastThrow: T_DO,
    },
  },
  {
    id: "move-1",
    title: "Move 1 more — lands on NE corner",
    titleKo: "1칸 더 — NE 코너에 도착",
    desc:
      "The piece reaches the NE corner exactly. (That triggers the diagonal shortcut option — see section 02.)",
    descKo:
      "말이 정확히 NE 코너에 도착. (이러면 지름길 옵션이 떠요 — 섹션 02 참고.)",
    state: {
      pieceHistory: ["o-r4", "o-r3", "o-r2", "o-r1", "ne"],
      whoseTurn: "p1",
      lastThrow: T_DO,
    },
  },
  {
    id: "pass",
    title: "Turn passes",
    titleKo: "P2 차례로",
    desc:
      "Bonus throw used up — P1's turn ends. With yut+do, P1 covered 5 spaces in one turn.",
    descKo:
      "보너스도 다 썼으니 P1 차례 끝. 윷+도로 한 차례에 5칸을 갔네요.",
    state: {
      pieceHistory: ["o-r4", "o-r3", "o-r2", "o-r1", "ne"],
      whoseTurn: "p2",
      lastThrow: T_DO,
    },
  },
];

const SCENARIOS: ReadonlyArray<Scenario> = [
  {
    id: "normal",
    label: "Normal turn",
    labelKo: "기본 차례",
    blurb:
      "Throw the sticks, move a piece that many spaces, pass to the next player.",
    blurbKo:
      "윷을 던지고, 그만큼 말을 옮기고, 다음 사람에게 넘겨요.",
    steps: NORMAL_STEPS,
  },
  {
    id: "bonus",
    label: "Bonus throw (윷/모)",
    labelKo: "보너스 (윷/모)",
    blurb:
      "Roll yut or mo and you get to throw again before passing — and again if you keep rolling them.",
    blurbKo:
      "윷이나 모가 나오면 차례를 넘기지 않고 한 번 더 던져요. 또 윷/모면 계속 던질 수 있어요.",
    steps: BONUS_STEPS,
  },
];

/* -------------------------------------------------------------------------- */
/* Section component                                                           */
/* -------------------------------------------------------------------------- */

export function SectionYutFlow() {
  const { locale } = useLocale();
  const [scenarioId, setScenarioId] = useState<string>("normal");
  const [stepIndex, setStepIndex] = useState<number>(0);

  const scenario =
    SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0];
  const step = scenario.steps[stepIndex];

  const switchScenario = (id: string) => {
    setScenarioId(id);
    setStepIndex(0);
  };
  const goPrev = () => setStepIndex((i) => Math.max(0, i - 1));
  const goNext = () =>
    setStepIndex((i) => Math.min(scenario.steps.length - 1, i + 1));
  const restart = () => setStepIndex(0);

  return (
    <section
      id="yut-flow"
      className="py-24 border-t border-foreground/10"
    >
      <div className="text-xs tabular-nums text-foreground/50 mb-4">
        SECTION 03
      </div>
      <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6">
        {locale === "ko" ? "한 차례 흐름" : "How a turn works"}
      </h2>
      <p className="text-lg text-foreground/60 max-w-2xl leading-relaxed mb-8">
        {locale === "ko"
          ? "한 차례가 어떻게 진행되는지 따라가 봐요. 던지기, 말 이동, 그리고 윷·모 보너스까지."
          : "Follow one turn from throw to handover — including the bonus when you roll a yut or mo."}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => switchScenario(s.id)}
            className={`px-3.5 py-1.5 rounded-full text-sm transition-colors ${
              scenario.id === s.id
                ? "bg-foreground text-background font-medium"
                : "bg-foreground/5 text-foreground/70 hover:bg-foreground/10 hover:text-foreground"
            }`}
          >
            {locale === "ko" ? s.labelKo : s.label}
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
          {locale === "ko" ? scenario.blurbKo : scenario.blurb}
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
            isDisabled={stepIndex === scenario.steps.length - 1}
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
        {scenario.steps.map((s, i) => (
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
          {stepIndex + 1} / {scenario.steps.length}
        </span>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Stage — board + indicators                                                  */
/* -------------------------------------------------------------------------- */

function Stage({ state }: { state: FlowState }) {
  const { locale } = useLocale();
  const piece: PieceState = { history: state.pieceHistory };

  return (
    <div className="rounded-xl border border-foreground/10 bg-foreground/[0.02] p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <PlayerBadge player={state.whoseTurn} />
        <ThrowBadge throwKind={state.lastThrow} bonusPending={state.bonusPending} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-start">
        <div className="rounded-lg overflow-hidden ring-1 ring-foreground/10">
          <YutBoard piece={piece} />
        </div>
        <Sidebar state={state} />
      </div>

      {/* Mobile bottom row replicating sidebar info */}
      <div className="md:hidden mt-4 grid grid-cols-2 gap-2">
        <Stat
          label={locale === "ko" ? "이동 거리" : "Distance"}
          value={String(state.pieceHistory.length)}
        />
        <Stat
          label={locale === "ko" ? "보너스" : "Bonus"}
          value={state.bonusPending ? (locale === "ko" ? "한 번 더" : "extra") : "—"}
          highlight={state.bonusPending}
        />
      </div>
    </div>
  );
}

function PlayerBadge({ player }: { player: Player }) {
  const { locale } = useLocale();
  const isP1 = player === "p1";
  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
        isP1
          ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30"
          : "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/30"
      }`}
    >
      <span
        className={`size-2 rounded-full ${isP1 ? "bg-rose-500" : "bg-blue-500"}`}
      />
      {locale === "ko"
        ? isP1
          ? "P1 차례"
          : "P2 차례"
        : isP1
          ? "P1's turn"
          : "P2's turn"}
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
        {locale === "ko" ? "아직 안 던졌어요" : "Awaiting throw"}
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-baseline gap-1.5">
        <span className="text-base font-semibold tracking-tight">
          {locale === "ko" ? throwKind.nameKo : throwKind.nameEn}
        </span>
        <span className="text-xs text-foreground/55 tabular-nums">
          {throwKind.move > 0 ? `+${throwKind.move}` : throwKind.move}
          {locale === "ko" ? "칸" : ""}
        </span>
      </div>
      {bonusPending && (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
          <Plus className="size-2.5" />
          {locale === "ko" ? "한 번 더" : "extra"}
        </span>
      )}
    </div>
  );
}

function Sidebar({ state }: { state: FlowState }) {
  const { locale } = useLocale();
  return (
    <div className="hidden md:flex flex-col gap-2 min-w-[180px]">
      <Stat
        label={locale === "ko" ? "이동 거리" : "Distance"}
        value={String(state.pieceHistory.length)}
      />
      <Stat
        label={locale === "ko" ? "보너스 대기" : "Bonus pending"}
        value={
          state.bonusPending
            ? locale === "ko"
              ? "한 번 더"
              : "Extra throw"
            : "—"
        }
        highlight={state.bonusPending}
      />
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-md border px-3 py-2 ${
        highlight
          ? "border-amber-500/50 bg-amber-500/[0.05]"
          : "border-foreground/10"
      }`}
    >
      <div
        className={`text-sm font-semibold tabular-nums ${
          highlight ? "text-amber-700 dark:text-amber-400" : ""
        }`}
      >
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-foreground/55 mt-0.5">
        {label}
      </div>
    </div>
  );
}
