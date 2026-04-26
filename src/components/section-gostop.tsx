"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, RotateCcw, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@heroui/react";
import { useLocale } from "@/contexts/locale-context";
import { FadeInOnView } from "@/components/fade-in-on-view";

type Choice = "stop" | "go";
type ScenarioState = { picked?: Choice };

type Scenario = {
  id: string;
  title: string;
  titleKo: string;
  setup: string;
  setupKo: string;
  /** Compact bullets to show under setup. */
  facts: { label: string; labelKo: string; value: string }[];
  best: Choice;
  reasoningStop: string;
  reasoningStopKo: string;
  reasoningGo: string;
  reasoningGoKo: string;
};

const SCENARIOS: ReadonlyArray<Scenario> = [
  {
    id: "safe-stop",
    title: "Safe stop",
    titleKo: "안전한 스톱",
    setup:
      "You've just hit 7 points. Both opponents are far from a comeback, and the deck is almost empty.",
    setupKo:
      "방금 7점 달성. 상대 둘 다 점수가 낮고, 더미도 거의 다 떨어졌어요.",
    facts: [
      { label: "Your score", labelKo: "내 점수", value: "7" },
      { label: "Opponents", labelKo: "상대", value: "3 / 2" },
      { label: "Cards left", labelKo: "남은 더미", value: "4" },
    ],
    best: "stop",
    reasoningStop:
      "Locking in 7 points is the safer call. The deck is too thin for opponents to catch up, but also too thin for you to add another point comfortably.",
    reasoningStopKo:
      "7점에 안전하게 멈추는 게 정답이에요. 더미가 4장밖에 안 남아서 상대가 추격하기도, 내가 1점 더 따기도 쉽지 않아요.",
    reasoningGo:
      "Going here is greedy. With only 4 cards in the deck you might not score the extra point you committed to — and if you fall short, you actually owe.",
    reasoningGoKo:
      "이 상황에서 고는 욕심이에요. 더미 4장 안에 1점을 더 만들지 못하면 약속을 못 지킨 셈이라 오히려 손해.",
  },
  {
    id: "tempting-go",
    title: "Tempting go",
    titleKo: "고고고",
    setup:
      "You hit 7 with two brights (광) already, and you can see the third bright is on the floor — easily reachable. Plenty of deck left.",
    setupKo:
      "광 2장으로 7점 달성. 바닥에 또 다른 광이 보이고, 더미도 충분히 남아있어요.",
    facts: [
      { label: "Your score", labelKo: "내 점수", value: "7" },
      { label: "Brights you have", labelKo: "내 광", value: "2 / 5" },
      { label: "Bright on floor", labelKo: "바닥의 광", value: "✓" },
      { label: "Cards left", labelKo: "남은 더미", value: "12" },
    ],
    best: "go",
    reasoningStop:
      "Stopping at 7 leaves a lot on the table. With three brights reachable and 12 cards left, going is mathematically the better call.",
    reasoningStopKo:
      "7점에서 멈추면 너무 보수적. 3광 (3점)이 보이고 더미도 12장 남아있으니, 기댓값상 고가 더 좋은 선택.",
    reasoningGo:
      "Going makes sense. If you grab the third bright you're at 8+; that lets you call '1-go' and possibly aim for four brights = 4 points.",
    reasoningGoKo:
      "고는 합리적이에요. 바닥의 광을 먹으면 3광(3점)이 되고, 1고 → 4광 노릴 수도 있어요.",
  },
  {
    id: "losing-go",
    title: "Trap of going",
    titleKo: "함정의 고",
    setup:
      "You hit 7 but an opponent is at 6 and clearly hunting brights — they have 2 already. Going here is dangerous.",
    setupKo:
      "내가 7점인데, 한 상대가 6점에 광 2장으로 광을 노리고 있어요. 여기서 고는 위험해요.",
    facts: [
      { label: "Your score", labelKo: "내 점수", value: "7" },
      { label: "Top opponent", labelKo: "상위 상대", value: "6" },
      { label: "Their brights", labelKo: "상대 광", value: "2 / 5" },
      { label: "Cards left", labelKo: "남은 더미", value: "10" },
    ],
    best: "stop",
    reasoningStop:
      "Stop now. Going makes you a target — if your opponent reaches 7 next turn and stops, you pay double on your previous score.",
    reasoningStopKo:
      "지금은 스톱. 고하면 표적이 돼요. 상대가 7점 도달해서 스톱하면, 내 직전 점수의 2배를 토해내야 해요.",
    reasoningGo:
      "Going is risky here. The opponent only needs one bright pair to overtake — and your previous 7-point score becomes a debt instead of a win.",
    reasoningGoKo:
      "고는 위험해요. 상대가 광 한 쌍만 더 모으면 추월당하고, 내가 쌓은 7점이 빚이 돼요.",
  },
];

export function SectionGoStop() {
  const { locale } = useLocale();

  return (
    <section
      id="section-gostop"
      className="relative py-24 border-t border-foreground/10 section-gostop-bg"
    >
      <div className="lg:ml-72">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-16">
      <FadeInOnView className="text-xs tabular-nums text-foreground/50 mb-4">
        SECTION 06
      </FadeInOnView>
      <FadeInOnView
        as="h2"
        delay={0.05}
        className="text-4xl md:text-5xl font-semibold tracking-tight mb-6"
      >
        {locale === "ko" ? "고냐 스톱이냐" : "Go or Stop?"}
      </FadeInOnView>
      <FadeInOnView
        as="p"
        delay={0.12}
        className="text-lg text-foreground/60 max-w-2xl leading-relaxed mb-12"
      >
        {locale === "ko"
          ? "게임 이름에 들어간 그 결정. 7점에 도달하는 순간, 멈출지 더 갈지를 직접 골라야 해요. 욕심과 리스크 사이의 줄타기."
          : "The decision baked into the game's name. The moment you hit 7 points, you choose: end the round or risk doubling — for both reward and punishment."}
      </FadeInOnView>

      <DecisionMoment />

      <div className="mt-16">
        <h3 className="text-sm uppercase tracking-[0.18em] font-semibold text-foreground/70 mb-5">
          {locale === "ko" ? "고 진행 — 배수표" : "Go progression — multipliers"}
        </h3>
        <MultiplierTable />
        <p className="text-xs text-foreground/55 mt-3 italic max-w-2xl">
          {locale === "ko"
            ? "* 고할 때마다 점수를 1점 이상 더 올려야 다시 고할 수 있어요. 못 올리면 라운드 자체가 무효 (낙장 / 나가리)."
            : "* Each go requires you to score at least one more point before calling again. Fall short and the round can be voided."}
        </p>
      </div>

      <div className="mt-16">
        <h3 className="text-sm uppercase tracking-[0.18em] font-semibold text-foreground/70 mb-5">
          {locale === "ko" ? "직접 골라보기" : "Try the call"}
        </h3>
        <div className="space-y-4">
          {SCENARIOS.map((s) => (
            <ScenarioCard key={s.id} scenario={s} />
          ))}
        </div>
      </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function DecisionMoment() {
  const { locale } = useLocale();
  const [hover, setHover] = useState<Choice | null>(null);

  return (
    <div className="rounded-xl border border-foreground/15 bg-foreground/[0.02] p-6 md:p-10">
      <div className="text-center mb-6">
        <div className="text-[10px] uppercase tracking-[0.22em] text-foreground/50 mb-2">
          {locale === "ko" ? "내 점수" : "Your score"}
        </div>
        <div className="text-7xl md:text-8xl font-semibold tabular-nums tracking-tight">
          7
        </div>
        <div className="text-sm text-foreground/55 mt-1">
          {locale === "ko"
            ? "결정해야 해요"
            : "Time to decide"}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        <PathCard
          choice="stop"
          active={hover === "stop"}
          onHover={(b) => setHover(b ? "stop" : null)}
          accent="emerald"
          icon={<ShieldCheck className="size-4" />}
          label={locale === "ko" ? "스톱" : "Stop"}
          subtitle={locale === "ko" ? "라운드 종료" : "End the round"}
          desc={
            locale === "ko"
              ? "내 점수로 라운드 마무리. 안전하게 승리 확정."
              : "Lock in your current score. Round ends, you win — at base value."
          }
        />
        <PathCard
          choice="go"
          active={hover === "go"}
          onHover={(b) => setHover(b ? "go" : null)}
          accent="amber"
          icon={<Zap className="size-4" />}
          label={locale === "ko" ? "고" : "Go"}
          subtitle={
            locale === "ko" ? "한 번 더 노려요" : "Push for more"
          }
          desc={
            locale === "ko"
              ? "라운드를 계속해서 더 많은 점수를. 단, 상대가 먼저 스톱하면 내가 두 배로 물어줘요."
              : "Continue scoring. But if an opponent stops first, you pay double instead of receiving."
          }
        />
      </div>
    </div>
  );
}

function PathCard({
  choice,
  active,
  onHover,
  accent,
  icon,
  label,
  subtitle,
  desc,
}: {
  choice: Choice;
  active: boolean;
  onHover: (h: boolean) => void;
  accent: "emerald" | "amber";
  icon: React.ReactNode;
  label: string;
  subtitle: string;
  desc: string;
}) {
  void choice;
  const cls =
    accent === "emerald"
      ? {
          bg: "bg-emerald-500/5",
          border: "border-emerald-500/40",
          text: "text-emerald-700 dark:text-emerald-400",
          hover: "hover:border-emerald-500/70 hover:bg-emerald-500/10",
        }
      : {
          bg: "bg-amber-500/5",
          border: "border-amber-500/40",
          text: "text-amber-700 dark:text-amber-400",
          hover: "hover:border-amber-500/70 hover:bg-amber-500/10",
        };
  return (
    <motion.div
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      animate={{ scale: active ? 1.015 : 1 }}
      transition={{ type: "spring", stiffness: 360, damping: 26 }}
      className={`rounded-lg border p-5 transition-colors cursor-default ${cls.bg} ${cls.border} ${cls.hover}`}
    >
      <div className={`flex items-center gap-2 mb-1.5 ${cls.text}`}>
        {icon}
        <span className="text-xl font-semibold tracking-tight">{label}</span>
      </div>
      <div className="text-sm text-foreground/60 mb-3">{subtitle}</div>
      <p className="text-sm text-foreground/75 leading-relaxed">{desc}</p>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */

function MultiplierTable() {
  const { locale } = useLocale();
  const rows: {
    label: string;
    labelKo: string;
    mult: string;
    note: string;
    noteKo: string;
    emphasis?: boolean;
  }[] = [
    {
      label: "Stop",
      labelKo: "스톱",
      mult: "1×",
      note: "End now, base score.",
      noteKo: "현재 점수 그대로 종료.",
    },
    {
      label: "1-Go",
      labelKo: "1고",
      mult: "1×",
      note: "Need +1 pt to call again.",
      noteKo: "1점 더 추가해야 다시 고 가능.",
    },
    {
      label: "2-Go",
      labelKo: "2고",
      mult: "1×",
      note: "Need another +1 pt.",
      noteKo: "또 1점 더 필요.",
    },
    {
      label: "Three-Go",
      labelKo: "쓰리고 (3고)",
      mult: "2×",
      note: "Score doubled — turning point.",
      noteKo: "점수 2배 — 진짜 시작.",
      emphasis: true,
    },
    {
      label: "4-Go+",
      labelKo: "포고+",
      mult: "4×↑",
      note: "Each further go ×2 cumulative.",
      noteKo: "한 번 갈 때마다 ×2 누적.",
    },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
      {rows.map((r) => (
        <div
          key={r.label}
          className={`rounded-md border p-3 ${
            r.emphasis
              ? "border-amber-500/60 bg-amber-500/5"
              : "border-foreground/15"
          }`}
        >
          <div className="text-[11px] uppercase tracking-wider font-semibold text-foreground/60 mb-0.5">
            {locale === "ko" ? r.labelKo : r.label}
          </div>
          <div className="text-xl font-semibold tabular-nums">{r.mult}</div>
          <div className="text-[11px] text-foreground/55 leading-snug mt-1">
            {locale === "ko" ? r.noteKo : r.note}
          </div>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function ScenarioCard({ scenario }: { scenario: Scenario }) {
  const { locale } = useLocale();
  const [state, setState] = useState<ScenarioState>({});

  const pick = (c: Choice) => setState({ picked: c });
  const reset = () => setState({});

  return (
    <div className="rounded-lg border border-foreground/15 bg-foreground/[0.02] p-5">
      <h4 className="text-base font-semibold tracking-tight mb-1">
        {locale === "ko" ? scenario.titleKo : scenario.title}
      </h4>
      <p className="text-sm text-foreground/70 leading-relaxed mb-4">
        {locale === "ko" ? scenario.setupKo : scenario.setup}
      </p>

      <div className="flex flex-wrap gap-2 mb-5">
        {scenario.facts.map((f) => (
          <div
            key={f.label}
            className="rounded-md bg-foreground/5 px-2.5 py-1 text-xs"
          >
            <span className="text-foreground/50 mr-1.5">
              {locale === "ko" ? f.labelKo : f.label}
            </span>
            <span className="font-semibold tabular-nums">{f.value}</span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {!state.picked ? (
          <motion.div
            key="choices"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 gap-2 max-w-sm"
          >
            <Button
              variant="outline"
              onPress={() => pick("stop")}
              className="justify-center gap-1.5 border-emerald-500/50 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10"
            >
              <ShieldCheck className="size-4" />
              {locale === "ko" ? "스톱" : "Stop"}
            </Button>
            <Button
              variant="outline"
              onPress={() => pick("go")}
              className="justify-center gap-1.5 border-amber-500/50 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10"
            >
              <Zap className="size-4" />
              {locale === "ko" ? "고" : "Go"}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            <Verdict
              choice={state.picked}
              best={scenario.best}
              reasoning={
                state.picked === "stop"
                  ? locale === "ko"
                    ? scenario.reasoningStopKo
                    : scenario.reasoningStop
                  : locale === "ko"
                    ? scenario.reasoningGoKo
                    : scenario.reasoningGo
              }
            />
            <Button
              variant="ghost"
              size="sm"
              onPress={reset}
              className="mt-3 gap-1.5 text-xs"
            >
              <RotateCcw className="size-3.5" />
              {locale === "ko" ? "다시" : "Try again"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Verdict({
  choice,
  best,
  reasoning,
}: {
  choice: Choice;
  best: Choice;
  reasoning: string;
}) {
  const { locale } = useLocale();
  const correct = choice === best;
  return (
    <div
      className={`rounded-md border px-4 py-3 ${
        correct
          ? "border-emerald-500/40 bg-emerald-500/5"
          : "border-rose-500/40 bg-rose-500/5"
      }`}
    >
      <div
        className={`text-xs font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5 ${
          correct
            ? "text-emerald-700 dark:text-emerald-400"
            : "text-rose-700 dark:text-rose-400"
        }`}
      >
        {correct
          ? locale === "ko"
            ? "좋은 선택"
            : "Good call"
          : locale === "ko"
            ? "위험한 선택"
            : "Risky pick"}
        <ArrowRight className="size-3.5" />
        <span className="font-normal normal-case tracking-normal text-foreground/60">
          {locale === "ko"
            ? choice === "stop"
              ? "스톱했어요"
              : "고했어요"
            : choice === "stop"
              ? "you chose stop"
              : "you chose go"}
        </span>
      </div>
      <p className="text-sm text-foreground/75 leading-relaxed">
        {reasoning}
      </p>
    </div>
  );
}
