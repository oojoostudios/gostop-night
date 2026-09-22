'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useLocale } from '@/contexts/locale-context';
import { HwatuCardImage } from '@/components/hwatu-card-image';
import {
  DECK_COLUMNS,
  DOUBLE_JUNK,
  HWATU_DECK,
  HWATU_TYPES,
  MONTHS,
  cardLabel,
  deckColumn,
  monthRowLabel,
  type DeckColumn,
  type HwatuCard,
  type HwatuType,
} from '@/lib/hwatu';

export type DeckFilter = 'all' | HwatuType;

// Card-type dot colors (globals.css): each gets a 1px ink ring via `.type-dot`.
const COLUMN_DOT: Record<DeckColumn, string> = {
  gwang: 'type-dot bg-type-bright',
  kkeut: 'type-dot bg-type-animal',
  tti: 'type-dot bg-type-ribbon',
  pi: 'type-dot bg-type-junk',
  double: 'type-dot bg-type-double',
};

// The grid has six card slots per row: Bright 1, Animal 1, Ribbon 1, Junk 2, Double junk 1.
const FIRST_SLOT: Record<DeckColumn, number> = { gwang: 1, kkeut: 2, tti: 3, pi: 4, double: 6 };

// Both the header and every row use this template, so the columns line up.
// Phone: six equal slots. Wider screens: a label column on the left, then the six slots.
const ROW = 'grid grid-cols-6 gap-x-1.5 md:grid-cols-[10rem_repeat(6,minmax(0,1fr))] md:gap-x-3';

// Puts an item in a slot. The variable is +1 on wider screens because of the label column.
const slotClass = '[grid-column:var(--slot)] md:[grid-column:calc(var(--slot)_+_1)]';
// The same, for the Junk header, which sits over two slots (regular junk comes in pairs).
const slotClassWide =
  '[grid-column:var(--slot)_/_span_2] md:[grid-column:calc(var(--slot)_+_1)_/_span_2]';

/**
 * Section 01's month-by-type grid: 12 rows (months) by 5 columns (Bright, Animal, Ribbon,
 * Junk, Double junk). Empty cells stay empty. A filter dims the cards that don't match
 * (25% opacity, 95% size) and the grid keeps its shape. Tapping a card opens it enlarged.
 */
export function DeckGrid({
  filter,
  onOpen,
}: {
  filter: DeckFilter;
  onOpen: (card: HwatuCard) => void;
}) {
  const { locale } = useLocale();
  const reduce = useReducedMotion();
  const matches = (card: HwatuCard) => filter === 'all' || card.type === filter;

  const columnName = (column: DeckColumn) =>
    column === 'double'
      ? { ko: DOUBLE_JUNK.labelKo, en: DOUBLE_JUNK.label }
      : { ko: HWATU_TYPES[column].labelKo, en: HWATU_TYPES[column].label };

  return (
    <div className="max-w-3xl">
      {/* Column headers. They stay in view while you scroll the 12 rows. */}
      <div className="sticky top-14 z-20 bg-paper pb-3 pt-2 lg:top-0">
        <div className={ROW}>
          {DECK_COLUMNS.map((column) => {
            const { ko, en } = columnName(column);
            const [main, other] = locale === 'ko' ? [ko, en] : [en, ko];
            return (
              <div
                key={column}
                style={{ '--slot': FIRST_SLOT[column] } as React.CSSProperties}
                className={`${column === 'pi' ? slotClassWide : slotClass} text-center leading-tight md:pb-1`}
              >
                <div className="text-label font-bold text-ink">
                  <span
                    aria-hidden
                    className={`mr-1 inline-block size-2 rounded-full ${COLUMN_DOT[column]}`}
                  />
                  {main}
                </div>
                <div className="text-label text-ink-soft">{other}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        {MONTHS.map((month) => {
          const cards = HWATU_DECK.filter((c) => c.month === month.num);
          // Cards go left to right in column order; the two regular junk cards take two slots.
          const placed = DECK_COLUMNS.flatMap((column) =>
            cards
              .filter((c) => deckColumn(c) === column)
              .map((card, i) => ({ card, slot: FIRST_SLOT[column] + i })),
          );
          return (
            <div key={month.num} className={`${ROW} items-center border-t border-hairline py-4`}>
              <div className="col-span-6 mb-3 text-label tracking-[0.04em] text-ink-soft md:col-span-1 md:mb-0">
                {monthRowLabel(month)}
              </div>
              {placed.map(({ card, slot }) => {
                const index = HWATU_DECK.indexOf(card);
                const on = matches(card);
                return (
                  <motion.div
                    key={card.id}
                    style={{ '--slot': slot } as React.CSSProperties}
                    className={`${slotClass} w-full max-w-[5.5rem] justify-self-center`}
                    initial={false}
                    animate={{ opacity: on ? 1 : 0.25, scale: on ? 1 : 0.95 }}
                    transition={
                      reduce
                        ? { duration: 0 }
                        : { duration: 0.25, ease: 'easeOut', delay: index * 0.015 }
                    }
                  >
                    <button
                      type="button"
                      onClick={() => onOpen(card)}
                      aria-label={cardLabel(card)}
                      className="relative block aspect-[2/3] w-full cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum"
                    >
                      <HwatuCardImage card={card} className="absolute inset-0 h-full w-full" />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
