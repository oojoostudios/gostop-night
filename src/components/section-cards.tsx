"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLocale } from "@/contexts/locale-context";
import { HwatuCard } from "@/components/hwatu-card";
import {
  HWATU_DECK,
  HWATU_TYPES,
  MONTHS,
  type HwatuCard as HwatuCardData,
} from "@/lib/hwatu";

const TYPE_ORDER: ReadonlyArray<HwatuCardData["type"]> = [
  "gwang",
  "tti",
  "kkeut",
  "pi",
];

export function SectionCards() {
  const { locale } = useLocale();
  const [selected, setSelected] = useState<HwatuCardData | null>(null);

  return (
    <section
      id="section-cards"
      className="min-h-screen flex flex-col justify-center py-24 border-t border-foreground/10"
    >
      <div className="text-xs tabular-nums text-muted-foreground mb-4 text-foreground/50">
        01
      </div>
      <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6">
        {locale === "ko" ? "화투 카드란?" : "What are hwatu cards?"}
      </h2>
      <p className="text-lg text-foreground/60 max-w-2xl leading-relaxed mb-12">
        {locale === "ko"
          ? "12달 × 4장 = 48장. 각 달에는 꽃이나 풍경이 그려져 있고, 카드마다 4가지 종류 중 하나에 속해요. 카드를 클릭해보세요."
          : "12 months × 4 cards = 48 in total. Each month is illustrated with a flower or scene, and every card belongs to one of four types. Click any card to learn more."}
      </p>

      {/* 4 type legends */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12">
        {TYPE_ORDER.map((type) => {
          const meta = HWATU_TYPES[type];
          return (
            <div
              key={type}
              className="rounded-md border border-foreground/10 p-3 text-sm"
            >
              <div className="font-semibold mb-1">
                {locale === "ko" ? meta.labelKo : meta.label}
              </div>
              <div className="text-xs text-foreground/60 leading-snug">
                {locale === "ko" ? meta.blurbKo : meta.blurb}
              </div>
            </div>
          );
        })}
      </div>

      {/* 12 rows × up to 4 cards */}
      <div className="space-y-3">
        {MONTHS.map((month) => {
          const monthCards = HWATU_DECK.filter((c) => c.month === month.num);
          return (
            <div
              key={month.num}
              className="grid grid-cols-[60px_repeat(4,_1fr)] gap-2 items-center"
            >
              <div className="text-xs tabular-nums text-foreground/50">
                <div className="font-semibold text-foreground/80">
                  {month.num.toString().padStart(2, "0")}월
                </div>
                <div className="text-[10px] mt-0.5">
                  {locale === "ko" ? month.motifKo : month.motif}
                </div>
              </div>
              {monthCards.map((card) => (
                <HwatuCard
                  key={card.id}
                  card={card}
                  isActive={selected?.id === card.id}
                  onSelect={(c) =>
                    setSelected((prev) => (prev?.id === c.id ? null : c))
                  }
                />
              ))}
            </div>
          );
        })}
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.18 }}
            className="mt-10 rounded-lg border border-foreground/15 bg-foreground/[0.02] p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-wider text-foreground/50 mb-1">
                  {selected.month}월 ·{" "}
                  {locale === "ko"
                    ? HWATU_TYPES[selected.type].labelKo
                    : HWATU_TYPES[selected.type].label}
                </div>
                <h3 className="text-2xl font-semibold tracking-tight">
                  {locale === "ko" ? selected.nameKo : selected.name}
                </h3>
                {selected.tag && (
                  <div className="mt-1 text-sm text-foreground/60">
                    {locale === "ko" ? selected.tagKo : selected.tag}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-foreground/40 hover:text-foreground/80 text-sm"
              >
                ✕
              </button>
            </div>
            <p className="mt-3 text-sm text-foreground/70 leading-relaxed">
              {locale === "ko"
                ? HWATU_TYPES[selected.type].blurbKo
                : HWATU_TYPES[selected.type].blurb}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
