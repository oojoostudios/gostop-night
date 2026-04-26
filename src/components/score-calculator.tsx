"use client";

import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { RotateCcw, Trophy } from "lucide-react";
import { Button } from "@heroui/react";
import { useLocale } from "@/contexts/locale-context";
import { HwatuCardImage } from "@/components/hwatu-card-image";
import {
  HWATU_DECK,
  HWATU_TYPES,
  type HwatuCard as HwatuCardData,
  type HwatuType,
} from "@/lib/hwatu";
import { computeScore } from "@/lib/score";

const TYPE_ORDER: ReadonlyArray<HwatuType> = ["gwang", "tti", "kkeut", "pi"];

const TYPE_BADGE: Record<HwatuType, string> = {
  gwang: "bg-amber-500 text-white",
  tti: "bg-rose-500 text-white",
  kkeut: "bg-emerald-600 text-white",
  pi: "bg-zinc-600 text-white",
};

const TYPE_DOT: Record<HwatuType, string> = {
  gwang: "bg-amber-500",
  tti: "bg-rose-500",
  kkeut: "bg-emerald-600",
  pi: "bg-zinc-600",
};

export function ScoreCalculator() {
  const { locale } = useLocale();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const reset = useCallback(() => setSelectedIds(new Set()), []);
  const score = useMemo(() => computeScore(selectedIds), [selectedIds]);

  return (
    <div className="border-t border-foreground/10 pt-14 mt-4">
      <div className="text-[10px] uppercase tracking-[0.2em] text-foreground/50 mb-3">
        {locale === "ko" ? "직접 해보기" : "Try it"}
      </div>
      <h3 className="text-2xl font-semibold tracking-tight mb-2">
        {locale === "ko" ? "점수 계산기" : "Score calculator"}
      </h3>
      <p className="text-sm text-foreground/60 max-w-2xl leading-relaxed mb-8">
        {locale === "ko"
          ? "카드를 클릭해서 가지고 있는 카드를 선택해보세요. 옆 패널에 점수가 실시간으로 계산되고, 콤보가 완성되면 자동으로 잡혀요."
          : "Click any card to add it to your collection. Total score and active combos update live in the panel on the right."}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-8 items-start">
        <div className="space-y-7">
          {TYPE_ORDER.map((type) => (
            <ToggleGroup
              key={type}
              type={type}
              selectedIds={selectedIds}
              onToggle={toggle}
            />
          ))}
        </div>

        <div className="lg:sticky lg:top-8 lg:self-start">
          <ScorePanel
            score={score}
            selectedCount={selectedIds.size}
            onReset={reset}
          />
        </div>
      </div>
    </div>
  );
}

function ToggleGroup({
  type,
  selectedIds,
  onToggle,
}: {
  type: HwatuType;
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
}) {
  const { locale } = useLocale();
  const meta = HWATU_TYPES[type];
  const cards = HWATU_DECK.filter((c) => c.type === type);
  const selectedCount = cards.filter((c) => selectedIds.has(c.id)).length;

  return (
    <div>
      <div className="flex items-baseline gap-2 mb-2.5">
        <span
          className={`text-[10px] px-2 py-0.5 rounded-sm font-semibold uppercase tracking-wider ${TYPE_BADGE[type]}`}
        >
          {locale === "ko" ? meta.labelKo : meta.label}
        </span>
        <span className="text-sm text-foreground/60">
          {selectedCount} / {cards.length}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {cards.map((card) => (
          <ToggleCard
            key={card.id}
            card={card}
            selected={selectedIds.has(card.id)}
            onClick={() => onToggle(card.id)}
          />
        ))}
      </div>
    </div>
  );
}

function ToggleCard({
  card,
  selected,
  onClick,
}: {
  card: HwatuCardData;
  selected: boolean;
  onClick: () => void;
}) {
  const { locale } = useLocale();
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      aria-pressed={selected}
      aria-label={locale === "ko" ? card.nameKo : card.name}
      className={`relative aspect-[2/3] w-14 sm:w-16 rounded-md overflow-hidden ring-1 ring-black/10 bg-white transition-all ${
        selected
          ? "outline outline-2 outline-offset-2 outline-foreground shadow"
          : "opacity-40 hover:opacity-80 grayscale-[40%] hover:grayscale-0"
      }`}
    >
      <HwatuCardImage
        card={card}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
      {card.tag === "쌍피" && (
        <span className="absolute bottom-1 right-1 text-[8px] font-bold bg-purple-600 text-white px-1 rounded-sm">
          ×2
        </span>
      )}
    </motion.button>
  );
}

function ScorePanel({
  score,
  selectedCount,
  onReset,
}: {
  score: ReturnType<typeof computeScore>;
  selectedCount: number;
  onReset: () => void;
}) {
  const { locale } = useLocale();
  const canStop = score.total >= 7;

  return (
    <div
      className={`rounded-lg border bg-foreground/[0.02] p-5 transition-colors ${
        canStop
          ? "border-amber-500/60 bg-amber-500/5"
          : "border-foreground/15"
      }`}
    >
      <div className="flex items-baseline justify-between mb-1">
        <div className="text-[10px] uppercase tracking-[0.18em] font-semibold text-foreground/50">
          {locale === "ko" ? "총점" : "Total"}
        </div>
        <div className="text-[10px] tabular-nums text-foreground/40">
          {selectedCount} {locale === "ko" ? "장 선택" : "selected"}
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-3">
        <div className="relative h-[1em] text-5xl font-semibold tabular-nums tracking-tight overflow-hidden">
          {/* invisible spacer to reserve width — keeps layout stable */}
          <span aria-hidden className="invisible">
            {score.total}
          </span>
          <AnimatePresence mode="sync" initial={false}>
            <motion.span
              key={score.total}
              initial={{ y: "70%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              exit={{ y: "-70%", opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
              className="absolute inset-0 flex items-baseline"
              aria-live="polite"
            >
              {score.total}
            </motion.span>
          </AnimatePresence>
        </div>
        <div className="text-foreground/50 text-sm">
          {locale === "ko" ? "점" : "pts"}
        </div>
      </div>

      <AnimatePresence>
        {canStop && (
          <motion.div
            key="canstop"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 mb-4"
          >
            <Trophy className="size-3.5" />
            <span
              className="sweep-mark"
              style={{ ["--sweep-delay" as string]: "120ms" }}
            >
              {locale === "ko"
                ? "고/스톱 결정 가능 (7점)"
                : "Go/Stop available (7+)"}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-1 mb-4 pt-4 border-t border-foreground/10">
        {(["gwang", "tti", "kkeut", "pi"] as const).map((type) => {
          const points = score.breakdown[type];
          const count =
            type === "pi" ? score.piEffective : score.counts[type];
          const meta = HWATU_TYPES[type];
          return (
            <div
              key={type}
              className="flex items-baseline justify-between gap-3 text-sm"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`size-1.5 rounded-full ${TYPE_DOT[type]}`}
                  aria-hidden
                />
                <span
                  className={
                    points > 0 ? "text-foreground" : "text-foreground/45"
                  }
                >
                  {locale === "ko" ? meta.labelKo : meta.label}
                </span>
                <span className="text-[11px] text-foreground/40 tabular-nums">
                  {count}
                  {type === "pi" && score.piEffective !== score.counts.pi && (
                    <span className="text-purple-600">
                      {" "}
                      ({locale === "ko" ? "쌍피 포함" : "w/ doubles"})
                    </span>
                  )}
                </span>
              </div>
              <span
                className={`relative tabular-nums font-semibold inline-block min-w-[1.5ch] text-right overflow-hidden ${
                  points > 0 ? "text-foreground" : "text-foreground/30"
                }`}
              >
                <AnimatePresence mode="sync" initial={false}>
                  <motion.span
                    key={points}
                    initial={{ y: "60%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    exit={{ y: "-60%", opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
                    className="inline-block"
                  >
                    {points}
                  </motion.span>
                </AnimatePresence>
              </span>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {score.combos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-foreground/10 pt-4 mb-4"
          >
            <div className="text-[10px] uppercase tracking-[0.18em] font-semibold text-foreground/50 mb-2">
              {locale === "ko" ? "콤보" : "Combos"}
            </div>
            <div className="space-y-1">
              {score.combos.map((combo) => (
                <motion.div
                  key={combo.id}
                  layout
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  className="flex items-baseline justify-between text-sm"
                >
                  <span className="font-semibold text-amber-700 dark:text-amber-400">
                    {locale === "ko" ? combo.labelKo : combo.label}
                  </span>
                  <span className="tabular-nums font-semibold">
                    +{combo.points}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        variant="ghost"
        size="sm"
        onPress={onReset}
        isDisabled={selectedCount === 0}
        className="w-full justify-center gap-2 text-xs"
      >
        <RotateCcw className="size-3.5" />
        {locale === "ko" ? "초기화" : "Reset"}
      </Button>
    </div>
  );
}
