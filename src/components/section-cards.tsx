"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useLocale } from "@/contexts/locale-context";
import { HwatuCard } from "@/components/hwatu-card";
import {
  HWATU_DECK,
  HWATU_TYPES,
  MONTHS,
  type HwatuCard as HwatuCardData,
  type HwatuType,
} from "@/lib/hwatu";

const TYPE_ORDER: ReadonlyArray<HwatuType> = ["gwang", "tti", "kkeut", "pi"];

const TYPE_BADGE: Record<HwatuType, string> = {
  gwang: "bg-amber-500 text-white",
  tti: "bg-rose-500 text-white",
  kkeut: "bg-emerald-600 text-white",
  pi: "bg-zinc-600 text-white",
};

type Filter = "all" | HwatuType;

export function SectionCards() {
  const { locale } = useLocale();
  const [selected, setSelected] = useState<HwatuCardData | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  const typeCounts = TYPE_ORDER.reduce(
    (acc, t) => {
      acc[t] = HWATU_DECK.filter((c) => c.type === t).length;
      return acc;
    },
    { gwang: 0, tti: 0, kkeut: 0, pi: 0 } as Record<HwatuType, number>,
  );

  const visibleDeck =
    filter === "all" ? HWATU_DECK : HWATU_DECK.filter((c) => c.type === filter);

  return (
    <section
      id="section-cards"
      className="py-24 border-t border-foreground/10"
    >
      <div className="text-xs tabular-nums text-foreground/50 mb-4">
        SECTION 01
      </div>
      <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6">
        {locale === "ko" ? "화투 카드란?" : "What are hwatu cards?"}
      </h2>
      <p className="text-lg text-foreground/60 max-w-2xl leading-relaxed mb-10">
        {locale === "ko"
          ? "12달 × 4장 = 48장. 각 카드는 4가지 종류 중 하나에 속해요. 필터로 종류를 골라보고, 카드를 클릭하면 자세한 정보가 옆에 떠요."
          : "12 months × 4 cards = 48 in total. Each card belongs to one of four types. Filter by type, then click any card to see details appear on the right."}
      </p>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-10">
        <FilterChip
          active={filter === "all"}
          onClick={() => setFilter("all")}
          label={locale === "ko" ? "전체" : "All"}
          count={48}
        />
        {TYPE_ORDER.map((t) => (
          <FilterChip
            key={t}
            active={filter === t}
            onClick={() => setFilter(t)}
            label={locale === "ko" ? HWATU_TYPES[t].labelKo : HWATU_TYPES[t].label}
            count={typeCounts[t]}
            badgeClassName={TYPE_BADGE[t]}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-10 lg:gap-12 items-start">
        {/* Cards by month */}
        <div className="space-y-7">
          {MONTHS.map((month) => {
            const monthCards = visibleDeck.filter((c) => c.month === month.num);
            if (monthCards.length === 0) return null;
            return (
              <div key={month.num}>
                <div className="flex items-baseline gap-2 mb-2.5 text-sm">
                  <span className="font-semibold text-foreground tabular-nums">
                    {month.num.toString().padStart(2, "0")}월
                  </span>
                  <span className="text-foreground/50">
                    {locale === "ko" ? month.motifKo : month.motif}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2.5">
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
              </div>
            );
          })}
        </div>

        {/* Detail panel */}
        <div className="lg:sticky lg:top-12 lg:self-start">
          <DetailPanel card={selected} onClear={() => setSelected(null)} />
        </div>
      </div>
    </section>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  count,
  badgeClassName,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  badgeClassName?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm transition-colors ${
        active
          ? "bg-foreground text-background"
          : "bg-foreground/5 text-foreground/70 hover:bg-foreground/10 hover:text-foreground"
      }`}
    >
      {badgeClassName && (
        <span
          className={`size-1.5 rounded-full ${badgeClassName.split(" ")[0]}`}
          aria-hidden
        />
      )}
      <span className="font-medium">{label}</span>
      <span
        className={`text-xs tabular-nums ${
          active ? "text-background/60" : "text-foreground/40"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function DetailPanel({
  card,
  onClear,
}: {
  card: HwatuCardData | null;
  onClear: () => void;
}) {
  const { locale } = useLocale();

  if (!card) {
    return (
      <div className="rounded-lg border border-dashed border-foreground/15 p-6 text-center">
        <div className="text-sm text-foreground/60">
          {locale === "ko"
            ? "카드를 클릭하면 여기에 자세한 정보가 떠요."
            : "Click any card to see details here."}
        </div>
      </div>
    );
  }

  const month = MONTHS[card.month - 1];
  const typeMeta = HWATU_TYPES[card.type];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={card.id}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.18 }}
        className="rounded-lg border border-foreground/15 bg-foreground/[0.02] overflow-hidden"
      >
        <div className="p-5 pb-0 flex justify-end">
          <button
            type="button"
            onClick={onClear}
            aria-label="Close detail"
            className="text-foreground/40 hover:text-foreground/80 text-sm leading-none p-1 -m-1"
          >
            ✕
          </button>
        </div>

        <div className="px-5">
          <div className="aspect-[2/3] relative max-w-[200px] mx-auto rounded-md overflow-hidden ring-1 ring-black/10 bg-white">
            <Image
              src={card.image}
              alt={locale === "ko" ? card.nameKo : card.name}
              fill
              sizes="200px"
              className="object-cover"
            />
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm font-semibold ${TYPE_BADGE[card.type]}`}
            >
              {locale === "ko" ? typeMeta.labelKo : typeMeta.label}
            </span>
            <span className="text-xs text-foreground/50 tabular-nums">
              {card.month}월 ·{" "}
              {locale === "ko" ? month.motifKo : month.motif}
            </span>
          </div>
          <h3 className="text-xl font-semibold tracking-tight">
            {locale === "ko" ? card.nameKo : card.name}
          </h3>
          {card.tag && (
            <div className="mt-1 text-sm text-foreground/60">
              {locale === "ko" ? card.tagKo : card.tag}
            </div>
          )}
          <p className="mt-3 text-sm text-foreground/70 leading-relaxed">
            {locale === "ko" ? typeMeta.blurbKo : typeMeta.blurb}
          </p>

          {(card.lore || card.loreKo) && (
            <div className="mt-4 pt-4 border-t border-foreground/10">
              <div className="text-[10px] uppercase tracking-[0.18em] text-foreground/50 mb-1.5">
                {locale === "ko" ? "이야기" : "Lore"}
              </div>
              <p className="text-sm text-foreground/70 leading-relaxed">
                {locale === "ko" ? card.loreKo : card.lore}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
