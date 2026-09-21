'use client';

import { useState } from 'react';
import { useLocale } from '@/contexts/locale-context';
import { FadeInOnView } from '@/components/fade-in-on-view';
import { DeckGrid, type DeckFilter } from '@/components/deck-grid';
import { FlipCardModal } from '@/components/hwatu-flip-card';
import {
  DOUBLE_JUNK,
  HWATU_DECK,
  HWATU_TYPES,
  monthList,
  monthsForColumn,
  type HwatuCard,
  type HwatuType,
} from '@/lib/hwatu';

// Order of the four types: Bright, Animal, Ribbon, Junk (the same as the grid's columns).
const TYPE_ORDER: ReadonlyArray<HwatuType> = ['gwang', 'kkeut', 'tti', 'pi'];

// Type colors are fills and dots only: Bright gold, Animal ink, Ribbon plum, Junk sage.
const TYPE_DOT: Record<HwatuType, string> = {
  gwang: 'bg-gold',
  kkeut: 'bg-ink',
  tti: 'bg-plum',
  pi: 'bg-sage',
};

const smallLabel = 'mb-1 text-xs uppercase tracking-wider text-ink-soft';

/** Section 01: The Hwatu Deck. Type cards, filter chips, the month-by-type grid, and the tap-to-flip card. */
export function SectionCards() {
  const { locale } = useLocale();
  const [filter, setFilter] = useState<DeckFilter>('all');
  // The card stays remembered while the modal closes, so its exit can finish before it disappears.
  const [openId, setOpenId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const openCard = HWATU_DECK.find((c) => c.id === openId) ?? null;

  const open = (card: HwatuCard) => {
    setOpenId(card.id);
    setIsOpen(true);
  };

  return (
    <section
      id="section-cards"
      className="relative border-t border-hairline py-24 section-cards-bg"
    >
      <div className="lg:ml-72">
        <div className="mx-auto max-w-5xl px-6 sm:px-8 lg:px-16">
          <FadeInOnView
            as="h2"
            delay={0.05}
            className="mb-6 font-display text-4xl leading-tight md:text-5xl"
          >
            <span className="text-plum">01</span>
            <span className="ml-4">
              {locale === 'ko' ? '화투 카드란?' : 'What are hwatu cards?'}
            </span>
          </FadeInOnView>
          <FadeInOnView
            as="p"
            delay={0.12}
            className="mb-12 max-w-2xl text-lg leading-relaxed text-ink-soft"
          >
            {locale === 'ko'
              ? '12달 × 4장 = 48장. 각 카드는 4가지 종류 중 하나에 속해요. 필터로 종류를 골라보고, 카드를 탭하면 커지면서 뒤집혀 자세한 정보가 보여요.'
              : '12 months × 4 cards = 48 in total. Each card belongs to one of four types. Filter by type, then tap any card to enlarge it and turn it over for its details.'}
          </FadeInOnView>

          {/* The four types */}
          <div className="mb-14 grid gap-5 md:grid-cols-2">
            {TYPE_ORDER.map((type) => (
              <TypeCard key={type} type={type} />
            ))}
          </div>

          {/* Filter chips: they dim the other cards; the grid keeps its shape. */}
          <div
            className="mb-8 flex flex-wrap gap-2.5"
            role="group"
            aria-label={locale === 'ko' ? '종류별로 보기' : 'Filter cards by type'}
          >
            <FilterChip
              active={filter === 'all'}
              onClick={() => setFilter('all')}
              label={locale === 'ko' ? '전체' : 'All'}
            />
            {TYPE_ORDER.map((type) => (
              <FilterChip
                key={type}
                active={filter === type}
                onClick={() => setFilter(type)}
                dot={TYPE_DOT[type]}
                label={locale === 'ko' ? HWATU_TYPES[type].labelKo : HWATU_TYPES[type].label}
              />
            ))}
          </div>

          <DeckGrid filter={filter} onOpen={open} />
        </div>
      </div>

      <FlipCardModal card={openCard} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </section>
  );
}

/** One of the four type cards: hanja, the terms, a one-line description, and the months it appears in. */
function TypeCard({ type }: { type: HwatuType }) {
  const { locale } = useLocale();
  const ko = locale === 'ko';
  const t = HWATU_TYPES[type];
  const [main, sub] = ko
    ? [t.labelKo, `${t.label} · ${t.roman}`]
    : [t.label, `${t.labelKo} · ${t.roman}`];

  return (
    <div className="club-card flex gap-5 p-6">
      <div aria-hidden className="shrink-0 pt-1 font-display text-5xl leading-none text-ink">
        {t.hanja}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2.5">
          <span aria-hidden className={`size-2.5 shrink-0 rounded-full ${TYPE_DOT[type]}`} />
          <h3 className="font-display text-2xl leading-tight">{main}</h3>
        </div>
        <div className="mt-0.5 text-sm text-ink-soft">{sub}</div>
        <p className="mt-3 text-sm leading-relaxed">{ko ? t.blurbKo : t.blurb}</p>

        <div className="mt-4">
          <div className={smallLabel}>{ko ? '나오는 달' : 'Appears in'}</div>
          <div className="text-sm font-medium">{monthList(monthsForColumn(type), locale)}</div>
        </div>

        {/* Double junk is a Junk card worth two, so it is listed on the Junk card. */}
        {type === 'pi' && (
          <div className="mt-3">
            <div className={smallLabel}>
              {ko
                ? `${DOUBLE_JUNK.labelKo} · ${DOUBLE_JUNK.label}`
                : `${DOUBLE_JUNK.label} · ${DOUBLE_JUNK.termKo}`}{' '}
              · {DOUBLE_JUNK.roman}
            </div>
            <div className="text-sm font-medium">
              {monthList(monthsForColumn('double'), locale)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  dot,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  dot?: string;
}) {
  return (
    <button type="button" className="club-chip" aria-pressed={active} onClick={onClick}>
      {dot && (
        <span
          aria-hidden
          // On the selected (plum) chip the dot turns surface-colored so it never disappears.
          className={`size-2.5 rounded-full ${active ? 'bg-surface' : dot}`}
        />
      )}
      {label}
    </button>
  );
}
