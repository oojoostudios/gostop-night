'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useLocale } from '@/contexts/locale-context';
import { CardCaption } from '@/components/card-caption';
import { HwatuCardImage } from '@/components/hwatu-card-image';
import { HWATU_DECK } from '@/lib/hwatu';

const cardById = (id: string) => HWATU_DECK.find((c) => c.id === id);

type Pattern = {
  id: string;
  /** Korean native term (e.g. 5광, 고도리). */
  labelKo: string;
  /** Descriptive English name (e.g. Five Brights, Godori). */
  englishName: string;
  points: number;
  /** Which type's accent color to apply to the boxed panel and tab. */
  accent: 'amber' | 'rose' | 'blue' | 'green' | 'emerald';
  desc: string;
  descKo: string;
  cardIds: string[];
  /** Optional caveat shown below the cards. */
  note?: string;
  noteKo?: string;
};

const PATTERNS: ReadonlyArray<Pattern> = [
  {
    id: '5gwang',
    labelKo: '5광',
    englishName: 'Five Brights',
    points: 15,
    accent: 'amber',
    desc: 'All five bright (광) cards. The highest single combo in standard go-stop — collect the entire bright set and you score 15 in one go.',
    descKo:
      '광 5장 모두. 고스톱 기본 룰에서 단일 콤보 최고 점수. 5광을 노린다면 12월 비광까지 다 모아야 해요.',
    cardIds: ['01-gwang', '03-gwang', '08-gwang', '11-gwang', '12-gwang'],
  },
  {
    id: '4gwang',
    labelKo: '4광',
    englishName: 'Four Brights',
    points: 4,
    accent: 'amber',
    desc: "Any four bright (광) cards. Unlike at the three-bright threshold, the Rain bright (비광) doesn't penalize at four brights — it's always 4 points.",
    descKo: '광 4장. 3광에서는 비광이 차감되지만, 4광에서는 비광이 들어가도 그대로 4점.',
    cardIds: ['01-gwang', '03-gwang', '08-gwang', '11-gwang'],
    note: 'Rain bright (비광) included is still 4 points.',
    noteKo: '비광 포함 4광도 4점.',
  },
  {
    id: '3gwang',
    labelKo: '3광',
    englishName: 'Three Brights',
    points: 3,
    accent: 'amber',
    desc: "Any three bright (광) cards. Without the Rain bright it's 3 points. With it, the score drops to 2 — a quirk that makes 비광 a tricky card to chase.",
    descKo: '광 3장. 비광 없이는 3점, 비광이 끼면 2점으로 내려가요. 비광은 그래서 양날의 검.',
    cardIds: ['01-gwang', '03-gwang', '08-gwang'],
    note: 'Including the Rain bright (비광 · 12月) reduces it to 2.',
    noteKo: '비광이 포함되면 2점으로 내려가요.',
  },
  {
    id: 'godori',
    labelKo: '고도리',
    englishName: 'Godori',
    points: 5,
    accent: 'emerald',
    desc: "Three songbirds — warbler (February), cuckoo (April), and geese (August). The most famous combo in go-stop, named after 'go' (五, five) and 'tori' (鳥, birds).",
    descKo:
      "새 3마리 — 꾀꼬리(2월), 두견새(4월), 기러기(8월). 고스톱에서 가장 유명한 콤보. 이름은 '고(5)' + '도리(새)'.",
    cardIds: ['02-kkeut', '04-kkeut', '08-kkeut'],
  },
  {
    id: 'hongdan',
    labelKo: '홍단',
    englishName: 'Red Ribbons',
    points: 3,
    accent: 'rose',
    desc: 'Three red ribbons inscribed with poetry — January, February, March. The earliest combo of the year, fittingly named after 홍 (紅, red).',
    descKo: "1·2·3월의 빨간 띠 (시문이 적힌 홍색 띠). 이름 그대로 '붉다(홍)'는 색에서 따왔어요.",
    cardIds: ['01-tti', '02-tti', '03-tti'],
  },
  {
    id: 'cheongdan',
    labelKo: '청단',
    englishName: 'Blue Ribbons',
    points: 3,
    accent: 'blue',
    desc: "Three blue ribbons — June, September, October. 'Cheong' (청 · 青) means blue. Spread out across mid-summer to autumn.",
    descKo: "6·9·10월의 파란 띠. '청'은 파랑을 뜻해요. 한여름부터 가을 사이에 흩어져 있어요.",
    cardIds: ['06-tti', '09-tti', '10-tti'],
  },
  {
    id: 'chodan',
    labelKo: '초단',
    englishName: 'Grass Ribbons',
    points: 3,
    accent: 'green',
    desc: "Three grass-colored ribbons — April, May, July. 'Cho' (초 · 草) means grass. The plant-themed ribbons of spring through midsummer.",
    descKo: "4·5·7월의 초록 띠. '초'는 풀을 뜻해요. 봄부터 한여름의 식물 모티프 띠들.",
    cardIds: ['04-tti', '05-tti', '07-tti'],
  },
];

const ACCENT: Record<
  Pattern['accent'],
  { tab: string; panel: string; ring: string; text: string }
> = {
  amber: {
    tab: 'border-amber-500/50 bg-amber-500/[0.06] text-amber-700 dark:text-amber-400',
    panel: 'border-amber-500/30 bg-amber-500/[0.03]',
    ring: 'outline-amber-500',
    text: 'text-amber-700 dark:text-amber-400',
  },
  rose: {
    tab: 'border-rose-500/50 bg-rose-500/[0.06] text-rose-700 dark:text-rose-400',
    panel: 'border-rose-500/30 bg-rose-500/[0.03]',
    ring: 'outline-rose-500',
    text: 'text-rose-700 dark:text-rose-400',
  },
  blue: {
    tab: 'border-blue-500/50 bg-blue-500/[0.06] text-blue-700 dark:text-blue-400',
    panel: 'border-blue-500/30 bg-blue-500/[0.03]',
    ring: 'outline-blue-500',
    text: 'text-blue-700 dark:text-blue-400',
  },
  green: {
    tab: 'border-green-600/50 bg-green-600/[0.06] text-green-700 dark:text-green-400',
    panel: 'border-green-600/30 bg-green-600/[0.03]',
    ring: 'outline-green-600',
    text: 'text-green-700 dark:text-green-400',
  },
  emerald: {
    tab: 'border-emerald-500/50 bg-emerald-500/[0.06] text-emerald-700 dark:text-emerald-400',
    panel: 'border-emerald-500/30 bg-emerald-500/[0.03]',
    ring: 'outline-emerald-500',
    text: 'text-emerald-700 dark:text-emerald-400',
  },
};

export function WinningPatterns() {
  const { locale } = useLocale();
  const [activeId, setActiveId] = useState<string>('5gwang');
  const active = PATTERNS.find((p) => p.id === activeId) ?? PATTERNS[0];
  const accent = ACCENT[active.accent];

  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-foreground/50 mb-3">
        {locale === 'ko' ? '이기는 패턴' : 'Winning patterns'}
      </div>
      <h3 className="text-2xl font-semibold tracking-tight mb-2">
        {locale === 'ko' ? '점수가 되는 모양들' : 'Patterns that score'}
      </h3>
      <p className="text-sm text-foreground/60 max-w-2xl leading-relaxed mb-6">
        {locale === 'ko'
          ? '각 콤보에 어떤 카드가 필요한지 한눈에. 탭을 눌러 다른 콤보 모양을 보세요.'
          : 'At a glance, the exact cards each combo requires. Click any tab to see another shape.'}
      </p>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label={locale === 'ko' ? '이기는 패턴' : 'Winning patterns'}
        className="flex flex-wrap gap-1.5 mb-5"
      >
        {PATTERNS.map((p) => {
          const isActive = p.id === activeId;
          const ac = ACCENT[p.accent];
          return (
            <motion.button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveId(p.id)}
              whileTap={{ scale: 0.94 }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 30,
                mass: 0.6,
              }}
              className={`relative text-sm px-3 py-1.5 rounded-md border transition-colors ${
                isActive
                  ? ac.tab
                  : 'border-transparent text-foreground/55 hover:text-foreground hover:bg-foreground/5'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="winning-pattern-tab"
                  className="absolute inset-0 rounded-md bg-foreground/[0.04] border border-foreground/15"
                  transition={{
                    type: 'spring',
                    stiffness: 460,
                    damping: 30,
                    mass: 0.7,
                  }}
                />
              )}
              <span className="relative z-10 font-medium">
                {locale === 'ko' ? p.labelKo : p.englishName}
              </span>
              <span className="relative z-10 mx-1.5 text-foreground/30">·</span>
              <span className="relative z-10 tabular-nums text-xs">
                {p.points}
                {locale === 'ko' ? '점' : ' pts'}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Active panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
          className={`rounded-lg border p-5 md:p-6 ${accent.panel}`}
        >
          <div className="flex items-baseline justify-between gap-3 mb-2 flex-wrap">
            <div>
              <h4 className="text-2xl font-semibold tracking-tight">
                {locale === 'ko' ? active.labelKo : active.englishName}
              </h4>
              <div className={`text-sm ${accent.text}`}>
                {locale === 'ko' ? active.englishName : active.labelKo}
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-semibold tabular-nums">{active.points}</span>
              <span className="text-sm text-foreground/55">{locale === 'ko' ? '점' : 'pts'}</span>
            </div>
          </div>

          <p className="text-sm text-foreground/75 leading-relaxed mb-5 max-w-2xl">
            {locale === 'ko' ? active.descKo : active.desc}
          </p>

          <div className="flex flex-wrap gap-2.5 mb-2">
            {active.cardIds.map((id) => {
              const card = cardById(id);
              if (!card) return null;
              return (
                <div key={id} className="flex flex-col items-center gap-1.5 w-24">
                  <div
                    className={`relative aspect-[2/3] w-16 sm:w-20 rounded-md overflow-hidden ring-1 ring-black/10 bg-white outline outline-2 outline-offset-2 ${accent.ring}`}
                  >
                    <HwatuCardImage card={card} className="absolute inset-0 w-full h-full" />
                  </div>
                  <CardCaption card={card} compact className="text-center" />
                </div>
              );
            })}
          </div>

          {active.note && (
            <p className={`text-xs italic mt-3 ${accent.text}`}>
              {locale === 'ko' ? active.noteKo : active.note}
            </p>
          )}

          <div className="mt-5 pt-4 border-t border-foreground/10 flex items-baseline justify-between text-sm">
            <span className="text-[10px] uppercase tracking-[0.18em] text-foreground/55 font-semibold">
              {locale === 'ko' ? '총합' : 'Total'}
            </span>
            <span className="tabular-nums">
              <span className="text-foreground/55">
                {active.cardIds.length}
                {locale === 'ko' ? '장' : ' cards'}
              </span>
              <span className="text-foreground/30 mx-2">→</span>
              <span className={`text-lg font-semibold ${accent.text}`}>
                {active.points}
                {locale === 'ko' ? '점' : ' pts'}
              </span>
            </span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
