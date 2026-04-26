"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Drawer } from "@heroui/react";
import { useLocale } from "@/contexts/locale-context";
import { useIsMobile } from "@/lib/use-media-query";
import { HwatuCard } from "@/components/hwatu-card";
import { HwatuCardImage } from "@/components/hwatu-card-image";
import { FadeInOnView } from "@/components/fade-in-on-view";
import {
  HWATU_DECK,
  HWATU_TYPES,
  MONTHS,
  type HwatuCard as HwatuCardData,
  type HwatuType,
} from "@/lib/hwatu";

const TYPE_ORDER: ReadonlyArray<HwatuType> = ["gwang", "tti", "kkeut", "pi"];

// Per-month one-line note for the Mahjong-style row layout:
// `[info-left] [tiles-right]`. Each row gets a short blurb explaining
// the motif's meaning so readers don't need to expand each card to learn.
const MONTH_NOTE: Record<number, { ko: string; en: string }> = {
  1:  { ko: "한 해의 첫 패. 송학(소나무 + 두루미)은 장수와 기품의 상징.",
        en: "First of the year. Pine and crane symbolize longevity and dignity." },
  2:  { ko: "이른 봄. 매화 가지에 휘파람새가 봄을 처음 알려요.",
        en: "Early spring. A bush warbler perches on plum, the first songbird." },
  3:  { ko: "벚꽃 만발. 광은 만막(慢幕) 아래의 꽃놀이 풍경.",
        en: "Cherry blossoms in full bloom. The bright depicts a hanami curtain." },
  4:  { ko: "등나무(흑싸리). 두견새가 달을 가르는 옛 그림 그대로.",
        en: "Wisteria — colloquially called 흑싸리. A cuckoo crosses the moon." },
  5:  { ko: "제비붓꽃(난초). 야츠하시(八橋) 다리와 꽃이 어우러져요.",
        en: "Iris — colloquially 난초. The art shows the famous yatsuhashi bridge." },
  6:  { ko: "모란(목단)이 활짝. 부귀화로 불리며 나비와 함께.",
        en: "Peony — the 'flower of wealth' — paired with butterflies." },
  7:  { ko: "한여름의 홍싸리. 이노시카초의 멧돼지가 등장.",
        en: "Red bush clover. The boar — part of the boar-deer-butterfly trio." },
  8:  { ko: "공산명월(空山明月). 빈 산 위 보름달은 가을의 정수.",
        en: "Empty mountain, full moon — the most poetic moon in East Asian art." },
  9:  { ko: "국화. 술잔(국준)으로 무병장수를 비는 중양절 풍습.",
        en: "Chrysanthemum. The sake cup is for the longevity festival on 9/9." },
  10: { ko: "단풍이 절정. 사슴이 가을의 대표 동물로 함께해요.",
        en: "Peak maple. The stag stands as the iconic autumn animal." },
  11: { ko: "오동(똥광). 봉황이 오직 오동나무에만 앉는다는 전설.",
        en: "Paulownia ('poo-bright'). The phoenix only lands on this tree." },
  12: { ko: "비. 오노노 미치카제(小野道風)가 우산 쓴 모습 — 끈기의 상징.",
        en: "Rain. Calligrapher Ono no Michikaze under an umbrella — perseverance." },
};

const TYPE_BADGE: Record<HwatuType, string> = {
  gwang: "bg-amber-500 text-white",
  tti: "bg-rose-500 text-white",
  kkeut: "bg-emerald-600 text-white",
  pi: "bg-zinc-600 text-white",
};

// Mahjong-guide-style overview: each type gets a hanja sigil + romanization +
// English meaning. The hanja column matches the Korean term's actual etymology
// where one exists (광=光, 피=皮); kkeut has no standard hanja, so we leave a
// placeholder (—). This trio (Korean / Hanja / Romanization / English) lets
// non-Korean readers anchor on the English while still showing cultural roots.
const TYPE_OVERVIEW: Record<
  HwatuType,
  {
    hanja: string;
    roman: string;
    /** English meaning shown in EN locale and as KO subtitle */
    english: string;
    perMonth: number;
    formula: string;
    accent: string;
    sample: ReadonlyArray<string>; // representative card ids
  }
> = {
  gwang: {
    hanja: "光",
    roman: "Gwang",
    english: "Brights",
    perMonth: 1,
    formula: "5 × 1 = 5",
    accent:
      "border-amber-500/40 bg-amber-500/[0.06] dark:bg-amber-500/[0.08]",
    sample: ["01-gwang", "03-gwang", "08-gwang", "11-gwang", "12-gwang"],
  },
  tti: {
    // 短 — short for 短冊 (tanzaku, the strip of paper). The compound combos
    // 紅短 (홍단), 青短 (청단), 草短 (초단) are all "<color>-short", literally
    // "<color> tanzaku". So 短 (not 帶) is the etymologically correct hanja.
    hanja: "短",
    roman: "Tti",
    english: "Ribbons",
    perMonth: 1,
    formula: "10 × 1 = 10",
    accent:
      "border-rose-500/40 bg-rose-500/[0.06] dark:bg-rose-500/[0.08]",
    sample: ["01-tti", "02-tti", "06-tti", "10-tti", "12-tti"],
  },
  kkeut: {
    // No standard hanja — "끗" is a native Korean counter-word for points.
    hanja: "—",
    roman: "Kkeut",
    english: "Animals",
    perMonth: 1,
    formula: "9 × 1 = 9",
    accent:
      "border-emerald-500/40 bg-emerald-500/[0.06] dark:bg-emerald-500/[0.08]",
    sample: ["02-kkeut", "04-kkeut", "08-kkeut", "09-kkeut", "10-kkeut"],
  },
  pi: {
    hanja: "皮",
    roman: "Pi",
    english: "Pips",
    perMonth: 2,
    formula: "Mostly 2 each = 24",
    accent:
      "border-zinc-500/40 bg-zinc-500/[0.06] dark:bg-zinc-500/[0.08]",
    sample: ["01-pi-1", "04-pi-1", "07-pi-1", "11-pi-1", "12-pi"],
  },
};

const TYPE_BLURB_DETAIL: Record<HwatuType, { ko: string; en: string }> = {
  gwang: {
    ko: "다섯 달(1·3·8·11·12월)에 각각 한 장씩. 가장 귀한 카드 — 3장부터 점수가 들어와요.",
    en: "One per month for five months (Jan, Mar, Aug, Nov, Dec). Most prestigious — 3+ start scoring.",
  },
  tti: {
    ko: "10개 달에 각 1장씩. 빨강·파랑·초록 색상 띠 — 같은 색 3장이면 콤보 (홍단·청단·초단).",
    en: "One per month, in 10 months. Red, blue, or grass-colored — three of a color = combo (Hongdan / Cheongdan / Chodan).",
  },
  kkeut: {
    ko: "9개 달에 각 1장씩 — 동물·새·풍경. 새 3종 (매조·두견·기러기)을 모으면 고도리.",
    en: "One per month, in 9 months — animals, birds, scenery. Three songbirds (warbler, cuckoo, geese) = godori combo.",
  },
  pi: {
    ko: "대부분 달에 2장씩 (가장 흔함). 11월·12월의 쌍피는 ×2 효과 — 보너스피도 ×2.",
    en: "Two per month for most (most common type). November and December 'double pi' count as ×2 — bonus pi too.",
  },
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
      className="relative py-24 border-t border-foreground/10 section-cards-bg"
    >
      <div className="lg:ml-72">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-16">
      <FadeInOnView className="text-xs tabular-nums text-foreground/50 mb-4">
        SECTION 01
      </FadeInOnView>
      <FadeInOnView
        as="h2"
        delay={0.05}
        className="text-4xl md:text-5xl font-semibold tracking-tight mb-6"
      >
        {locale === "ko" ? "화투 카드란?" : "What are hwatu cards?"}
      </FadeInOnView>
      <FadeInOnView
        as="p"
        delay={0.12}
        className="text-lg text-foreground/60 max-w-2xl leading-relaxed mb-10"
      >
        {locale === "ko"
          ? "12달 × 4장 = 48장. 각 카드는 4가지 종류 중 하나에 속해요. 필터로 종류를 골라보고, 카드를 클릭하면 자세한 정보가 옆에 떠요."
          : "12 months × 4 cards = 48 in total. Each card belongs to one of four types. Filter by type, then click any card to see details appear on the right."}
      </FadeInOnView>

      {/* Type overview blocks (광 · 띠 · 끗 · 피) */}
      <TypeOverview typeCounts={typeCounts} />

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
        {/* Cards by month — Mahjong-guide-style row layout:
         *   [info column on left] [4 small tiles on right]
         * Tighter density and per-row context make 12 months scan easily. */}
        <div className="space-y-5">
          {MONTHS.map((month, monthIdx) => {
            const monthCards = visibleDeck.filter((c) => c.month === month.num);
            if (monthCards.length === 0) return null;
            const note = MONTH_NOTE[month.num];
            return (
              <div
                key={month.num}
                className="grid grid-cols-1 sm:grid-cols-[minmax(0,170px)_1fr] gap-3 sm:gap-5 items-start py-2 border-t border-foreground/[0.06] first:border-t-0"
              >
                {/* Info column (left) — month number, motif Ko/En, lore */}
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-semibold tabular-nums leading-none">
                      {month.num.toString().padStart(2, "0")}
                    </span>
                    <span className="text-sm font-semibold text-foreground/85">
                      {locale === "ko" ? month.motifKo : month.motif}
                    </span>
                  </div>
                  <div className="text-[11px] text-foreground/50 mt-0.5">
                    {locale === "ko" ? month.motif : month.motifKo}
                  </div>
                  {note && (
                    <p className="text-[11px] text-foreground/65 mt-2 leading-snug max-w-[16rem]">
                      {locale === "ko" ? note.ko : note.en}
                    </p>
                  )}
                </div>

                {/* Tiles row (right) — 4 small cards */}
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2 max-w-[24rem]">
                  {monthCards.map((card, cardIdx) => (
                    <div
                      key={card.id}
                      className="card-fade-in"
                      style={{
                        animationDelay: `${Math.min(
                          (monthIdx * 4 + cardIdx) * 15,
                          400,
                        )}ms`,
                      }}
                    >
                      <HwatuCard
                        card={card}
                        isActive={selected?.id === card.id}
                        onSelect={(c) =>
                          setSelected((prev) =>
                            prev?.id === c.id ? null : c,
                          )
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail panel — desktop sticky on the right (hidden on mobile) */}
        <div className="hidden lg:block lg:sticky lg:top-12 lg:self-start">
          <DetailPanel card={selected} onClear={() => setSelected(null)} />
        </div>
      </div>
        </div>
      </div>

      {/* Mobile bottom sheet — same content, drawer presentation on small screens */}
      <MobileCardSheet card={selected} onClose={() => setSelected(null)} />
    </section>
  );
}

/**
 * Mobile-only bottom drawer for the card detail panel.
 *
 * Uses HeroUI v3 `Drawer` with `placement="bottom"`. (HeroUI's `Sheet` with
 * snap-points exists in their staging docs but isn't shipped in 3.0.3 yet —
 * Drawer covers our needs: drag handle, swipe-to-dismiss, blurred backdrop,
 * focus trap, body scroll lock.)
 *
 * The desktop sticky panel takes over on lg+ via `lg:hidden` on the dialog,
 * so this drawer only ever shows on mobile.
 */
function MobileCardSheet({
  card,
  onClose,
}: {
  card: HwatuCardData | null;
  onClose: () => void;
}) {
  const isMobile = useIsMobile();
  // Only mount the drawer at all when mobile — prevents desktop from showing
  // the backdrop / locking body scroll / trapping focus on the lg+ breakpoint.
  if (!isMobile) return null;

  return (
    <Drawer
      isOpen={!!card}
      onOpenChange={(open: boolean) => {
        if (!open) onClose();
      }}
    >
      {/* Backdrop — warm dark overlay (not generic black) so it reads as
       * "the room dimmed around the card" rather than a modal wash. */}
      <Drawer.Backdrop
        variant="blur"
        className="bg-[oklch(0.18_0.02_60_/_0.45)]"
      >
        <Drawer.Content placement="bottom">
          {/* Dialog — paper surface with warm hairline border + soft shadow.
           * Larger top radius so it visually "lifts" from the floor edge. */}
          <Drawer.Dialog className="max-h-[90vh] !rounded-t-2xl border-t border-x border-[var(--line)] bg-[var(--card)] shadow-[0_-12px_40px_-8px_rgba(75,54,24,0.18)]">
            <Drawer.Handle className="[&_*]:bg-[var(--ink)]/25" />
            <Drawer.CloseTrigger className="text-[var(--muted-ink)] hover:text-[var(--ink)]" />
            <Drawer.Body className="pb-8">
              {card && (
                <DetailPanel card={card} onClear={onClose} framed={false} />
              )}
            </Drawer.Body>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}

function TypeOverview({
  typeCounts,
}: {
  typeCounts: Record<HwatuType, number>;
}) {
  const { locale } = useLocale();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-12">
      {TYPE_ORDER.map((t, i) => {
        const meta = HWATU_TYPES[t];
        const ov = TYPE_OVERVIEW[t];
        const count = typeCounts[t];
        return (
          <motion.div
            key={t}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
              duration: 0.45,
              ease: [0.16, 1, 0.3, 1],
              delay: i * 0.06,
            }}
            className={`relative rounded-lg border ${ov.accent} p-5`}
          >
            <div className="flex items-start gap-4 mb-3">
              <div className="flex flex-col items-center min-w-[3rem]">
                <span
                  className="text-4xl leading-none font-normal text-foreground/85"
                  style={{ fontFamily: "var(--font-accent)" }}
                  aria-hidden
                >
                  {ov.hanja}
                </span>
                <span className="text-[10px] uppercase tracking-[0.18em] text-foreground/50 mt-1 tabular-nums">
                  {ov.roman}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  {/* Mahjong-guide-style trio: native term first, with the
                   * "other side" + romanization as a small subtitle so EN
                   * readers always see what 광/띠/끗/피 mean. */}
                  <h3 className="text-2xl font-semibold tracking-tight">
                    {locale === "ko" ? meta.labelKo : ov.english}
                  </h3>
                  <span className="text-xs text-foreground/50">
                    {locale === "ko"
                      ? `${ov.english} · ${ov.roman}`
                      : `${meta.labelKo} · ${ov.roman}`}
                  </span>
                </div>
                <div className="text-[11px] uppercase tracking-wider text-foreground/55 tabular-nums mt-0.5">
                  {ov.formula}{" "}
                  <span className="text-foreground/35 mx-1">·</span>{" "}
                  {count} {locale === "ko" ? "장" : "cards"}
                </div>
              </div>
            </div>

            <p className="text-sm text-foreground/70 leading-relaxed mb-4">
              {locale === "ko"
                ? TYPE_BLURB_DETAIL[t].ko
                : TYPE_BLURB_DETAIL[t].en}
            </p>

            <div className="flex flex-wrap gap-1.5">
              {ov.sample.map((id, idx) => {
                const card = HWATU_DECK.find((c) => c.id === id);
                if (!card) return null;
                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, y: 6 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{
                      duration: 0.32,
                      ease: [0.16, 1, 0.3, 1],
                      delay: 0.15 + idx * 0.04,
                    }}
                    whileHover={{ y: -3 }}
                    className="relative aspect-[2/3] w-12 sm:w-14 rounded-md overflow-hidden ring-1 ring-black/10 bg-white shrink-0"
                  >
                    <HwatuCardImage
                      card={card}
                      className="absolute inset-0 w-full h-full"
                    />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        );
      })}
    </div>
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
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.6 }}
      className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm transition-colors ${
        active
          ? "text-white"
          : "text-foreground/70 hover:bg-foreground/10 hover:text-foreground bg-foreground/5"
      }`}
    >
      {active && (
        <motion.span
          layoutId="cards-filter-pill"
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: "var(--mat)" }}
          transition={{
            type: "spring",
            stiffness: 480,
            damping: 28,
            mass: 0.7,
          }}
        />
      )}
      <span className="relative flex items-center gap-2 z-10">
        {badgeClassName && (
          <span
            className={`size-1.5 rounded-full ${badgeClassName.split(" ")[0]}`}
            aria-hidden
          />
        )}
        <span className="font-medium">{label}</span>
        <span
          className={`text-xs tabular-nums ${
            active ? "text-white/70" : "text-foreground/40"
          }`}
        >
          {count}
        </span>
      </span>
    </motion.button>
  );
}

function DetailPanel({
  card,
  onClear,
  framed = true,
}: {
  card: HwatuCardData | null;
  onClear: () => void;
  /** Wrap the content in a border+bg frame. Off when shown inside a Drawer
   *  (the Drawer surface itself acts as the frame — double frames look bad). */
  framed?: boolean;
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
        initial={{ opacity: 0, scale: 0.96, y: 4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: -4 }}
        transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
        style={{ transformOrigin: "center top" }}
        className={`overflow-hidden ${
          framed
            ? "rounded-lg border border-foreground/15 bg-foreground/[0.02]"
            : ""
        }`}
      >
        {/* Inline close — desktop sticky panel only.
         * On mobile we render inside a Drawer which has its own CloseTrigger,
         * so showing this would create duplicate ✕ buttons. */}
        <div className="hidden lg:flex p-5 pb-0 justify-end">
          <motion.button
            type="button"
            onClick={onClear}
            whileTap={{ scale: 0.88 }}
            aria-label="Close detail"
            className="text-foreground/40 hover:text-foreground/80 text-sm leading-none p-1 -m-1"
          >
            ✕
          </motion.button>
        </div>

        <div className="px-5">
          <div className="aspect-[2/3] relative max-w-[200px] mx-auto rounded-md overflow-hidden ring-1 ring-black/10 bg-white">
            <HwatuCardImage
              card={card}
              className="absolute inset-0 w-full h-full"
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
