import type { Metadata } from 'next';
import { HWATU_DECK, HWATU_TYPES, MONTHS, cardCombo } from '@/lib/hwatu';
import { HwatuCardImage } from '@/components/hwatu-card-image';
import { CardCaption } from '@/components/card-caption';

// Internal QA page — not linked from site nav, not for guests.
// Every label below comes straight from hwatu.ts (HWATU_DECK / HWATU_TYPES /
// MONTHS) — nothing here is a separately hardcoded string, so this page
// can't drift from the data the rest of the site actually renders.
export const metadata: Metadata = {
  title: 'Card mapping check',
  robots: { index: false, follow: false },
};

export default function CardMappingCheckPage() {
  const totals = Object.fromEntries(
    (Object.keys(HWATU_TYPES) as Array<keyof typeof HWATU_TYPES>).map((t) => [
      t,
      HWATU_DECK.filter((c) => c.type === t).length,
    ]),
  ) as Record<keyof typeof HWATU_TYPES, number>;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--ink)] px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold mb-1">Card mapping check</h1>
        <p className="text-sm text-[var(--muted-ink)] mb-2">
          All {HWATU_DECK.length} cards, grouped by month, in the order they appear in{' '}
          <code>hwatu.ts</code>. Each card shows its caption in English order, then Korean order.
          Not linked from the site — for checking the art against the mapping table only.
        </p>
        <p className="text-sm text-[var(--muted-ink)] mb-8 tabular-nums">
          Totals: {totals.gwang} {HWATU_TYPES.gwang.label} · {totals.kkeut}{' '}
          {HWATU_TYPES.kkeut.label} · {totals.tti} {HWATU_TYPES.tti.label} · {totals.pi}{' '}
          {HWATU_TYPES.pi.label} (
          {HWATU_DECK.filter((c) => c.type === 'pi' && c.tag === '쌍피').length} double)
        </p>

        {MONTHS.map((month) => {
          const cards = HWATU_DECK.filter((c) => c.month === month.num);
          return (
            <section key={month.num} className="mb-10">
              <h2 className="text-sm uppercase tracking-wide text-[var(--muted-ink)] mb-3">
                {String(month.num).padStart(2, '0')} · {month.motifKo} · {month.motif}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {cards.map((card) => {
                  const comboEn = cardCombo(card, 'en');
                  const comboKo = cardCombo(card, 'ko');
                  return (
                    <div
                      key={card.id}
                      className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-3"
                    >
                      <div className="aspect-[2/3] relative rounded-md overflow-hidden ring-1 ring-black/10 bg-white mb-2">
                        <HwatuCardImage card={card} className="absolute inset-0 w-full h-full" />
                      </div>
                      <div className="text-xs text-[var(--muted-ink)] font-mono mb-1">
                        {card.id}
                      </div>
                      <CardCaption card={card} locale="en" />
                      <CardCaption
                        card={card}
                        locale="ko"
                        className="mt-2 pt-2 border-t border-dashed border-[var(--border)]"
                      />
                      <div className="text-xs text-[var(--muted-ink)] mt-2">
                        Combo: {comboEn ?? '—'}
                        {comboKo && comboKo !== comboEn ? ` / ${comboKo}` : ''}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
